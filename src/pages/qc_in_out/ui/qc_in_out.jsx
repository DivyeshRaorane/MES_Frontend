import { useState, useRef, useEffect } from 'react';
import { Scan, Trash2, ClipboardCheck, Clock, Upload, PlayCircle } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../utils/toastService';
import { Formik, Form } from 'formik';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { validateBobbinForQCOut, submitQCOut, bulkValidateQCOut, bulkSubmitQCOut } from '../services/qc_out.api';
import PendingQCOut from './PendingQCOut';

const API = import.meta.env.VITE_API_URL;
const getQCUsers = async () => (await axios.get(`${API}/getqcusers`)).data;

const today = new Date().toISOString().split('T')[0];
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const initialFormValues = {
  date: today,
  user: '',
  shift: '',
  barcode: '',
};

const TABS = [
  { key: 'qc_out', label: 'QC Out', icon: <ClipboardCheck size={13} /> },
  { key: 'pending_qc_out', label: 'Pending QC Out', icon: <Clock size={13} /> },
];

/* ── Excluded final grades (mirrors backend rule) ── */
const EXCLUDED_GRADES = ['REW', 'FAIL', 'REWH2'];

/* ══════════════════════════════════════════════════════════ */
const QCInOut = () => {
  const [activeTab, setActiveTab] = useState('qc_out');
  const [rows, setRows] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [qcUsers, setQcUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false); // true once /qcout/submit results are rendered (scan mode)
  const [importMode, setImportMode] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [validating, setValidating] = useState(false); // dry-run bulk-validate in progress
  const [validated, setValidated] = useState(false); // true after bulk-validate has run (import mode)
  const [bulkProcessed, setBulkProcessed] = useState(false); // true after Bulk QC Out is clicked
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const scanRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, uRes] = await Promise.all([getAllShifts(), getQCUsers()]);
        setShifts(sRes?.data || []);
        setQcUsers(uRes?.data || []);
      } catch (e) { console.error('Load error:', e); }
    })();
  }, []);

  const shiftOptions = shifts.map(s => ({ label: s.shift_name, value: s.shift_name }));
  const userOptions = qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }));

  const refocus = (setFieldValue) => {
    setFieldValue('barcode', '');
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── Scan bobbin ── */
  const handleScan = async (barcode, values, setFieldValue) => {
    const bobbin_no = barcode.trim();
    if (!bobbin_no) return;

    if (!values.user) { showError('Select User first'); return; }
    if (!values.shift) { showError('Select Shift first'); return; }

    if (rows.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin has already been scanned.');
      refocus(setFieldValue); return;
    }

    try {
      const data = await validateBobbinForQCOut(bobbin_no);

      if (!data?.success) {
        showError(data?.message || 'Bobbin not found.');
        refocus(setFieldValue); return;
      }

      const bobbin = data.data;

      if (!bobbin.final_grade) {
        showError('Final grade is pending for this bobbin. Cannot proceed with QC Out.');
        refocus(setFieldValue); return;
      }

      const fg = bobbin.final_grade.toUpperCase();
      if (EXCLUDED_GRADES.includes(fg)) {
        showError(`This bobbin cannot be QC Out because its final grade is ${fg}.`);
        refocus(setFieldValue); return;
      }

      setRows(prev => [...prev, {
        id: Date.now(),
        bobbin_no: bobbin.bobbin_no,
        bobbin_fid: bobbin.bobbin_fid || '',
        product_type: bobbin.product_type || '',
        fiber_type: bobbin.fiber_type || '',
        fiber_color: bobbin.fiber_color || '',
        fiber_length: bobbin.fiber_length || '',
        final_grade: bobbin.final_grade || '',
        out_time: nowTime(),
        is_qc_out: null, // unknown until /qcout/submit responds
        reason: '',
      }]);

      refocus(setFieldValue);
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
      refocus(setFieldValue);
    }
  };

  /* ── Remove row ── */
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  /* ── Excel Import (just read file and show bobbins in table) ── */
  const handleExcelImport = async (e, values) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!values.user) { showError('Select User first'); fileInputRef.current.value = ''; return; }
    if (!values.shift) { showError('Select Shift first'); fileInputRef.current.value = ''; return; }

    setImportProcessing(true);
    setImportMode(true);
    setBulkProcessed(false);
    setValidated(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Extract bobbin_no from Excel
      const bobbinNos = jsonData
        .map(row => {
          const key = Object.keys(row).find(k =>
            k.toLowerCase().replace(/[_\s]/g, '') === 'bobbinno' ||
            k.toLowerCase().replace(/[_\s]/g, '') === 'bobbin' ||
            k.toLowerCase().replace(/[_\s]/g, '') === 'bobbin_no'
          );
          return key ? String(row[key]).trim() : null;
        })
        .filter(Boolean);

      if (!bobbinNos.length) {
        showError('No bobbin_no column found in Excel. Please ensure column header is "bobbin_no" or "Bobbin No".');
        setImportProcessing(false);
        setImportMode(false);
        fileInputRef.current.value = '';
        return;
      }

      // Remove duplicates
      const uniqueBobbins = [...new Set(bobbinNos)];

      // Just show bobbins in table (no validation yet)
      const importedRows = uniqueBobbins.map((bobbin_no, idx) => ({
        id: Date.now() + idx,
        bobbin_no,
        bobbin_fid: '',
        product_type: '',
        final_grade: '',
        is_valid: null,   // null = not yet dry-run validated
        is_qc_out: null,  // null = not yet submitted
        reason: '',
        out_time: nowTime(),
      }));

      setRows(importedRows);
      showSuccess(`Imported ${importedRows.length} bobbins from Excel. Click "Validate" to dry-run check them, then "Bulk QC Out" to submit.`);
    } catch {
      showError('Failed to read Excel file');
      setImportMode(false);
    }

    setImportProcessing(false);
    fileInputRef.current.value = '';
  };

  /* ── Dry-run validate all imported bobbins via /qcout/bulk-validate ── */
  const handleValidate = async () => {
    if (!rows.length) { showError('No bobbins to validate'); return; }

    setValidating(true);
    try {
      const bobbinNos = rows.map(r => r.bobbin_no);
      const res = await bulkValidateQCOut(bobbinNos);

      if (res?.success) {
        const results = res.data || [];
        const updatedRows = rows.map(row => {
          const result = results.find(r => r.bobbin_no === row.bobbin_no);
          if (result) {
            return {
              ...row,
              bobbin_fid: result.bobbin_fid || row.bobbin_fid,
              product_type: result.product_type || row.product_type,
              final_grade: result.final_grade || row.final_grade,
              is_valid: result.is_valid === true,
              reason: result.reason || '',
            };
          }
          return { ...row, is_valid: false, reason: 'No response from server' };
        });

        setRows(updatedRows);
        setValidated(true);

        const validCount = updatedRows.filter(r => r.is_valid).length;
        const invalidCount = updatedRows.filter(r => !r.is_valid).length;
        showSuccess(`Validation complete: ${validCount} valid, ${invalidCount} invalid.`);
      } else {
        showError(res?.message || 'Bulk validate failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong during validation');
    }
    setValidating(false);
  };

  /* ── Bulk QC Out (submit all imported bobbins via /qcout/bulk-submit) ── */
  const handleBulkQCOut = async (values) => {
    if (!rows.length) { showError('No bobbins to process'); return; }
    if (!values.user) { showError('Select User first'); return; }
    if (!values.shift) { showError('Select Shift first'); return; }

    setBulkProcessing(true);

    try {
      const bobbinNos = rows.map(r => r.bobbin_no);

      const payload = {
        out_date: values.date,
        user: values.user,
        shift: values.shift,
        bobbins: bobbinNos,
      };

      const res = await bulkSubmitQCOut(payload);

      if (res?.success) {
        const results = res.data || [];

        // Update rows with per-bobbin results, matched by array order (backend
        // returns one result entry per submitted bobbin, same order).
        const updatedRows = rows.map((row, idx) => {
          const result = results[idx] && results[idx].bobbin_no === row.bobbin_no
            ? results[idx]
            : results.find(r => r.bobbin_no === row.bobbin_no);
          if (result) {
            return {
              ...row,
              bobbin_fid: result.bobbin_fid || row.bobbin_fid,
              product_type: result.product_type || row.product_type,
              final_grade: result.final_grade || row.final_grade,
              is_qc_out: result.is_qc_out === true,
              reason: result.reason || '',
            };
          }
          return { ...row, is_qc_out: false, reason: 'No response from server' };
        });

        setRows(updatedRows);
        setBulkProcessed(true);

        const passCount = updatedRows.filter(r => r.is_qc_out).length;
        const failCount = updatedRows.filter(r => !r.is_qc_out).length;
        showSuccess(`Bulk QC Out complete: ${passCount} succeeded, ${failCount} skipped/failed.`);
      } else {
        showError(res?.message || 'Bulk QC Out failed');
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (status === 400) {
        showError(msg || 'user, shift, and bobbins array are required');
      } else {
        showError(msg || 'Something went wrong during Bulk QC Out');
      }
    }

    setBulkProcessing(false);
  };

  /* ── Submit (scan mode) — POST /qcout/submit ── */
  const handleSubmit = async (values) => {
    // Mirror backend's required-field validation for fast client-side feedback.
    if (!values.user) { showError('Select User'); return; }
    if (!values.shift) { showError('Select Shift'); return; }
    if (!rows.length) { showError('Scan at least one bobbin before submitting'); return; }

    setSubmitting(true);
    try {
      const payload = {
        user: values.user,
        shift: values.shift,
        out_date: values.date,
        bobbins: rows.map(r => ({
          bobbin_no: r.bobbin_no,
          out_time: r.out_time,
        })),
      };

      const res = await submitQCOut(payload);

      if (res?.success) {
        const results = res.data || [];

        // Per-bobbin results — do NOT assume a 201 means every bobbin succeeded.
        const updatedRows = rows.map((row, idx) => {
          const result = results[idx] && results[idx].bobbin_no === row.bobbin_no
            ? results[idx]
            : results.find(r => r.bobbin_no === row.bobbin_no);
          if (result) {
            return {
              ...row,
              bobbin_fid: result.bobbin_fid || row.bobbin_fid,
              product_type: result.product_type || row.product_type,
              final_grade: result.final_grade || row.final_grade,
              is_qc_out: result.is_qc_out === true,
              reason: result.reason || '',
            };
          }
          return { ...row, is_qc_out: false, reason: 'No response from server' };
        });

        setRows(updatedRows);
        setSubmitted(true);

        const passCount = updatedRows.filter(r => r.is_qc_out).length;
        const failCount = updatedRows.filter(r => !r.is_qc_out).length;
        if (failCount === 0) {
          showSuccess(`All ${passCount} bobbin(s) QC'd out successfully.`);
        } else {
          showWarning(`${passCount} succeeded, ${failCount} skipped — see table for reasons.`);
        }
      } else {
        showError(res?.message || 'Submit failed');
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (status === 400) {
        showError(msg || 'user, shift, and bobbins array are required');
      } else {
        showError(msg || 'Something went wrong');
      }
    }
    setSubmitting(false);
  };

  /* ── Status badge helpers ── */
  const getValidateBadge = (is_valid) => {
    if (is_valid === null || is_valid === undefined) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">PENDING</span>;
    if (is_valid) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">VALID</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">INVALID</span>;
  };

  const getOutBadge = (is_qc_out) => {
    if (is_qc_out === null || is_qc_out === undefined) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">—</span>;
    if (is_qc_out) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">QC OUT</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">SKIPPED</span>;
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab Navigation ── */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-3 pt-2 flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-t-lg border border-b-0 transition-all -mb-px
                ${activeTab === tab.key
                  ? 'bg-white text-indigo-700 border-slate-200 shadow-sm'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100/50'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'qc_out' && (
          <Formik initialValues={initialFormValues} onSubmit={() => {}}>
            {({ values, setFieldValue, resetForm }) => (
              <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

                {/* ── Action bar ── */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    QC Out {importMode && <span className="text-orange-600 ml-1">(Excel Import)</span>}
                  </span>
                  <div className="flex gap-1.5">
                    <ResetButton compact type="button" onClick={() => {
                      resetForm(); setRows([]); setImportMode(false);
                      setBulkProcessed(false); setValidated(false); setSubmitted(false);
                    }}>Reset</ResetButton>
                    {!importMode && (
                      <SubmitButton compact type="button" disabled={submitting || !rows.length}
                        onClick={() => handleSubmit(values)}>
                        {submitting ? 'Saving...' : `Submit (${rows.length})`}
                      </SubmitButton>
                    )}
                  </div>
                </div>

                {/* ── Header fields ── */}
                <ModuleCard compact title="QC Out Entry" icon={<ClipboardCheck size={13} className="text-blue-600" />}>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <FormikInput compact label="Date" name="date" type="date" />
                      <FormikSelect compact label="QC User" name="user" options={userOptions} />
                      <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />
                    </div>

                    {/* Scan row + Excel Import */}
                    <div className="flex items-end gap-2 pt-1 border-t border-slate-100">
                      <div className="flex-1 max-w-sm">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">Scan Bobbin</label>
                        <input ref={scanRef} value={values.barcode}
                          onChange={e => setFieldValue('barcode', e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(values.barcode, values, setFieldValue); } }}
                          placeholder="Scan bobbin barcode..."
                          disabled={importMode}
                          className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50" />
                      </div>
                      <button type="button" onClick={() => handleScan(values.barcode, values, setFieldValue)}
                        disabled={importMode}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px] disabled:opacity-50">
                        <Scan size={10} /> Scan
                      </button>

                      {/* Excel Import Button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleExcelImport(e, values)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importProcessing || bulkProcessed}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-[9px] font-bold rounded uppercase hover:bg-amber-700 transition-all h-[28px] disabled:opacity-50"
                      >
                        <Upload size={10} /> {importProcessing ? 'Reading...' : 'Import Excel'}
                      </button>

                      {/* Validate Button (dry-run via /qcout/bulk-validate — no auth) */}
                      {importMode && !bulkProcessed && (
                        <button
                          type="button"
                          onClick={handleValidate}
                          disabled={validating || !rows.length}
                          className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-[9px] font-bold rounded uppercase hover:bg-sky-700 transition-all h-[28px] disabled:opacity-50"
                        >
                          <ClipboardCheck size={10} /> {validating ? 'Validating...' : 'Validate'}
                        </button>
                      )}

                      {/* Bulk QC Out Button (only visible after import, before processing) */}
                      {importMode && !bulkProcessed && (
                        <button
                          type="button"
                          onClick={() => handleBulkQCOut(values)}
                          disabled={bulkProcessing || !rows.length || !validated}
                          title={!validated ? 'Run Validate first' : ''}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase hover:bg-emerald-700 transition-all h-[28px] disabled:opacity-50"
                        >
                          <PlayCircle size={10} /> {bulkProcessing ? 'Processing...' : 'Bulk QC Out'}
                        </button>
                      )}

                      <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                        {rows.length} {importMode ? 'imported' : 'scanned'}
                      </span>
                    </div>
                  </div>
                </ModuleCard>

                {/* ── Table ── */}
                <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                    <ClipboardCheck size={12} className="text-blue-600" />
                    <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">
                      {importMode ? 'Imported Bobbins' : 'Scanned Bobbins'}
                    </span>
                    {rows.length > 0 && (
                      <>
                        <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{rows.length} Total</span>
                        {importMode && validated && !bulkProcessed && (
                          <>
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => r.is_valid).length} Valid</span>
                            <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => !r.is_valid).length} Invalid</span>
                          </>
                        )}
                        {importMode && bulkProcessed && (
                          <>
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => r.is_qc_out).length} QC Out</span>
                            <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => !r.is_qc_out).length} Skipped</span>
                          </>
                        )}
                        {!importMode && submitted && (
                          <>
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => r.is_qc_out).length} QC Out</span>
                            <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">{rows.filter(r => !r.is_qc_out).length} Skipped</span>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200">
                          {importMode
                            ? ['#', 'Bobbin No', 'FID', 'Product Type', 'Final Grade', 'Valid', 'QC Out', 'Reason'].map(h => (
                                <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                              ))
                            : ['#', 'Bobbin No', 'Bobbin FID', 'Product Type', 'Color', 'Fiber Length', 'Final Grade', 'Out Time', 'Result', ''].map(h => (
                                <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                              ))
                          }
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={importMode ? 8 : 10} className="px-4 py-10 text-center text-[10px] text-slate-400">
                              {importMode ? 'Import an Excel file to begin' : 'Scan a bobbin barcode to begin'}
                            </td>
                          </tr>
                        ) : importMode ? (
                          /* ── Import Mode Table ── */
                          rows.map((row, idx) => (
                            <tr key={row.id} className={`hover:bg-blue-50/20 transition-colors group
                              ${bulkProcessed && !row.is_qc_out ? 'bg-rose-50/30' : ''}
                              ${bulkProcessed && row.is_qc_out ? 'bg-emerald-50/20' : ''}
                              ${!bulkProcessed && validated && !row.is_valid ? 'bg-rose-50/30' : ''}`}>
                              <td className="px-3 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                              <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_no}</td>
                              <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                              <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.product_type || '—'}</td>
                              <td className="px-3 py-1.5 border-r border-slate-100">
                                {row.final_grade
                                  ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{row.final_grade}</span>
                                  : <span className="text-[9px] text-slate-400">—</span>
                                }
                              </td>
                              <td className="px-3 py-1.5 border-r border-slate-100">
                                {getValidateBadge(row.is_valid)}
                              </td>
                              <td className="px-3 py-1.5 border-r border-slate-100">
                                {getOutBadge(row.is_qc_out)}
                              </td>
                              <td className="px-3 py-1.5 text-[9px] text-rose-600">{row.reason || '—'}</td>
                            </tr>
                          ))
                        ) : (
                          /* ── Scan Mode Table ── */
                          rows.map((row, idx) => (
                            <tr key={row.id} className={`hover:bg-blue-50/20 transition-colors group
                              ${submitted && !row.is_qc_out ? 'bg-rose-50/30' : ''}
                              ${submitted && row.is_qc_out ? 'bg-emerald-50/20' : ''}`}>
                              <td className="px-3 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                              <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_no}</td>
                              <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                              <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.product_type || '—'}</td>
                              <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_color || '—'}</td>
                              <td className="px-3 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.fiber_length || '—'}</td>
                              <td className="px-3 py-1.5 border-r border-slate-100">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{row.final_grade}</span>
                              </td>
                              <td className="px-3 py-1.5 text-xs text-slate-400 border-r border-slate-100">{row.out_time}</td>
                              <td className="px-3 py-1.5 border-r border-slate-100">
                                {submitted
                                  ? (
                                    <div className="flex flex-col gap-0.5">
                                      {getOutBadge(row.is_qc_out)}
                                      {!row.is_qc_out && row.reason && (
                                        <span className="text-[8px] text-rose-600">{row.reason}</span>
                                      )}
                                    </div>
                                  )
                                  : <span className="text-[9px] text-slate-400">—</span>
                                }
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                {!submitted && (
                                  <button type="button" onClick={() => removeRow(row.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </Form>
            )}
          </Formik>
        )}

        {activeTab === 'pending_qc_out' && <PendingQCOut />}
      </div>
    </div>
  );
};

export default QCInOut;
