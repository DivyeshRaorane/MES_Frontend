import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  X, FileSpreadsheet, Sparkles, Download, Upload, Play, Loader2,
  CheckCircle2, XCircle, MinusCircle, AlertTriangle, RotateCcw, FileDown, Send, Layers, Award,
} from 'lucide-react';
import { gradeBobbinBulk, getPendingTempGrade, submitFinalQCBulk, getPendingFinalSubmit } from '../services/qc_entry.api';
import { showSuccess, showError } from '../../../utils/toastService';

/* ══════════════════════════════════════════════════════════
   Bulk Entry — two independent features, chosen on open:

     1. Bulk Temp Grade
          • Excel     — download a single-column (bobbin_no) template, import an
                        .xlsx, grade the imported bobbins.
          • Automatic — auto-load all bobbins pending temp grade, grade them.
        Grading is delegated to POST /qcentry/grade-bulk. Passed bobbins can then
        be selected and finalized via POST /qcentry/submit-final-bulk.

     2. Bulk Submit  (NEW)
          • Excel     — download the same (bobbin_no) template, import an .xlsx,
                        finalize those bobbins.
          • Automatic — auto-load bobbins that already have a temp grade but no
                        final grade yet (in qc_entry_temp, not in qc_entry) via
                        GET /qcentry/pending-final-submit, finalize them.
        Finalizing is delegated to POST /qcentry/submit-final-bulk.
   ══════════════════════════════════════════════════════════ */

/* Per-status presentation (badge + row tint + icon) for bulk GRADING results. */
const STATUS_META = {
  PASSED:            { label: 'Passed',        cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', row: 'bg-emerald-50/40',  Icon: CheckCircle2 },
  FAILED:            { label: 'Failed',        cls: 'bg-red-100 text-red-700 border-red-300',             row: 'bg-red-50/40',      Icon: XCircle },
  MISSING_DATA:      { label: 'Missing Data',  cls: 'bg-amber-100 text-amber-700 border-amber-300',       row: 'bg-amber-50/40',    Icon: AlertTriangle },
  MBEND_REQUIRED:    { label: 'MBend Needed',  cls: 'bg-orange-100 text-orange-700 border-orange-300',    row: 'bg-orange-50/40',   Icon: AlertTriangle },
  SKIPPED_NO_TEST:   { label: 'Not Tested',    cls: 'bg-slate-100 text-slate-600 border-slate-300',       row: 'bg-slate-50',       Icon: MinusCircle },
  SKIPPED_HAS_GRADE: { label: 'Already Graded',cls: 'bg-purple-100 text-purple-700 border-purple-300',    row: 'bg-purple-50/40',   Icon: MinusCircle },
  ERROR:             { label: 'Error',         cls: 'bg-rose-100 text-rose-700 border-rose-300',          row: 'bg-rose-50/40',     Icon: XCircle },
};
const metaFor = (status) => STATUS_META[status] || { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-600 border-slate-300', row: '', Icon: MinusCircle };

/* Per-status presentation for the Submit-Final-Bulk results (separate status vocabulary). */
const SUBMIT_STATUS_META = {
  SUCCESS: { label: 'Success', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', row: 'bg-emerald-50/40', Icon: CheckCircle2 },
  FAILED:  { label: 'Failed',  cls: 'bg-red-100 text-red-700 border-red-300',             row: 'bg-red-50/40',    Icon: XCircle },
  ERROR:   { label: 'Error',   cls: 'bg-rose-100 text-rose-700 border-rose-300',          row: 'bg-rose-50/40',   Icon: XCircle },
};
const submitMetaFor = (status) => SUBMIT_STATUS_META[status] || { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-600 border-slate-300', row: '', Icon: MinusCircle };

/* Short human message for the "Detail" column when the backend didn't send one. */
const detailFor = (r) => {
  if (r.message) return r.message;
  if (r.status === 'PASSED') return `Grade: ${r.matched_grade}`;
  if (r.status === 'FAILED') return `Failed parameter: ${r.failed_parameter || r.failure_details?.failed_parameter || '—'}`;
  if (r.status === 'MISSING_DATA') return `Missing: ${(r.missing_parameters || []).join(', ') || '—'}`;
  if (r.status === 'SKIPPED_NO_TEST') return 'Testing not done for this bobbin';
  if (r.status === 'SKIPPED_HAS_GRADE') return 'This bobbin already has a grade';
  return '';
};

/* ── Shared Excel helpers (same single-column bobbin_no template for both features) ── */
const downloadBobbinTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([['bobbin_no'], ['']]);
  ws['!cols'] = [{ wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bobbins');
  XLSX.writeFile(wb, 'bulk_bobbin_template.xlsx');
};

/* Parse an imported .xlsx into a deduped list of upper-cased bobbin numbers. */
const parseBobbinWorkbook = (arrayBuffer) => {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

  // Locate the bobbin_no column (case-insensitive header match); fall back to first column.
  const headerRow = rows[0] || [];
  let colIdx = headerRow.findIndex(h => String(h).trim().toLowerCase() === 'bobbin_no');
  let dataStart = 1;
  if (colIdx === -1) { colIdx = 0; dataStart = 0; } // no header — treat every row as a value

  const seen = new Set();
  const list = [];
  for (let i = dataStart; i < rows.length; i++) {
    const raw = rows[i]?.[colIdx];
    const val = String(raw ?? '').trim().toUpperCase();
    if (val && !seen.has(val)) { seen.add(val); list.push(val); }
  }
  return list;
};

const BulkEntryModal = ({ open, onClose }) => {
  const [feature, setFeature] = useState(null); // null | 'tempgrade' | 'submit'
  const [mode, setMode] = useState(null);       // null | 'excel' | 'auto'
  const [bobbins, setBobbins] = useState([]);   // string[] of bobbin_no to process
  const [results, setResults] = useState(null); // bulk-grade: { summary, results:[] } | null
  const [grading, setGrading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // ── Submit (bulk final submit) state ──
  const [selected, setSelected] = useState(new Set()); // bobbin_no set, checked in the grade results table
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [submitResults, setSubmitResults] = useState(null); // { summary, results:[] } | null

  if (!open) return null;

  const resetToMode = () => {
    setMode(null); setBobbins([]); setResults(null); setGrading(false); setLoadingList(false);
    setSelected(new Set()); setSubmittingBulk(false); setSubmitResults(null);
  };
  const resetAll = () => { setFeature(null); resetToMode(); };
  const close = () => { resetAll(); onClose?.(); };

  const featureTitle = feature === 'submit' ? 'Bulk Submit' : feature === 'tempgrade' ? 'Bulk Temp Grade' : 'Bulk Entry';

  /* ── Import .xlsx and extract the bobbin_no column ── */
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const list = parseBobbinWorkbook(ev.target.result);
        if (list.length === 0) { showError('No bobbin numbers found in the file.'); return; }
        setBobbins(list);
        setResults(null);
        setSubmitResults(null);
        showSuccess(`Imported ${list.length} bobbin${list.length > 1 ? 's' : ''}.`);
      } catch (err) {
        console.error('Excel import error:', err);
        showError('Could not read the Excel file. Use the provided template.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // allow re-importing the same file
  };

  /* ── Automatic mode (Temp Grade): load bobbins pending temp grade ── */
  const loadPendingTempGrade = async () => {
    setLoadingList(true); setResults(null);
    try {
      const res = await getPendingTempGrade();
      const list = (res?.data || res?.bobbins || [])
        .map(r => (typeof r === 'string' ? r : r.bobbin_no))
        .filter(Boolean)
        .map(v => String(v).trim().toUpperCase());
      const unique = [...new Set(list)];
      setBobbins(unique);
      if (unique.length === 0) showError('No bobbins pending temp grade.');
      else showSuccess(`Loaded ${unique.length} pending bobbin${unique.length > 1 ? 's' : ''}.`);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to load pending bobbins.');
    }
    setLoadingList(false);
  };

  /* ── Automatic mode (Submit): load bobbins pending final submit ──
     Bobbins in qc_entry_temp with a temp_grade but no final_grade, not in qc_entry. ── */
  const loadPendingFinalSubmit = async () => {
    setLoadingList(true); setSubmitResults(null);
    try {
      const res = await getPendingFinalSubmit();
      const list = (res?.data || res?.bobbins || [])
        .map(r => (typeof r === 'string' ? r : r.bobbin_no))
        .filter(Boolean)
        .map(v => String(v).trim().toUpperCase());
      const unique = [...new Set(list)];
      setBobbins(unique);
      if (unique.length === 0) showError('No bobbins pending final submit.');
      else showSuccess(`Loaded ${unique.length} pending bobbin${unique.length > 1 ? 's' : ''}.`);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to load pending bobbins.');
    }
    setLoadingList(false);
  };

  /* ── Run grading for the current list (Temp Grade feature) ── */
  const startGrading = async () => {
    if (bobbins.length === 0) { showError('No bobbins to grade.'); return; }
    setGrading(true);
    try {
      const res = await gradeBobbinBulk(bobbins);
      const list = res?.results || [];
      const summary = res?.summary || null;
      setResults({ results: list, summary });
      setSelected(new Set());        // fresh grading run — clear any prior selection
      setSubmitResults(null);        // and any prior submit-final results
      const passed = summary?.passed ?? list.filter(r => r.status === 'PASSED').length;
      showSuccess(`Grading complete. ${passed} passed.`);
    } catch (err) {
      showError(err?.response?.data?.message || 'Bulk grading failed.');
    }
    setGrading(false);
  };

  /* ── Selection helpers for the "Submit Selected" step (Temp Grade feature) ──
     Only PASSED bobbins are selectable — those have a temp grade and are eligible. ── */
  const passedBobbins = (results?.results || []).filter(r => r.status === 'PASSED').map(r => r.bobbin_no);

  const toggleSelected = (bobbin_no) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(bobbin_no)) next.delete(bobbin_no); else next.add(bobbin_no);
      return next;
    });
  };

  const toggleSelectAllPassed = () => {
    setSelected(prev => (prev.size === passedBobbins.length ? new Set() : new Set(passedBobbins)));
  };

  /* ── Submit Selected: finalize QC for the chosen (passed) bobbins (Temp Grade feature) ── */
  const submitSelected = async () => {
    const bobbin_nos = [...selected];
    if (bobbin_nos.length === 0) { showError('Select at least one bobbin to submit.'); return; }
    setSubmittingBulk(true);
    try {
      const res = await submitFinalQCBulk(bobbin_nos);
      const list = res?.results || [];
      const summary = res?.summary || null;
      setSubmitResults({ results: list, summary });
      if (summary) {
        showSuccess(`Submit complete: ${summary.success} succeeded, ${summary.failed} failed out of ${summary.total}.`);
      } else {
        showSuccess('Submit complete.');
      }
      // Drop successfully submitted bobbins from the selection so re-submitting
      // only targets the ones that still need attention.
      const succeededSet = new Set(list.filter(r => r.status === 'SUCCESS').map(r => r.bobbin_no));
      setSelected(prev => new Set([...prev].filter(b => !succeededSet.has(b))));

      // Refresh: re-run bulk grading for the full list so the results table
      // reflects the new state (submitted bobbins already have final_grade
      // and will show up as SKIPPED_HAS_GRADE / already-graded on a re-check).
      if (bobbins.length > 0) {
        try {
          const refreshed = await gradeBobbinBulk(bobbins);
          setResults({ results: refreshed?.results || [], summary: refreshed?.summary || null });
        } catch {
          // Non-fatal — the submit results are still shown even if refresh fails.
        }
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Bulk submit failed.');
    }
    setSubmittingBulk(false);
  };

  /* ── Bulk Submit feature: finalize QC directly for the whole imported/loaded list ── */
  const submitBulkDirect = async () => {
    if (bobbins.length === 0) { showError('No bobbins to submit.'); return; }
    setSubmittingBulk(true);
    try {
      const res = await submitFinalQCBulk(bobbins);
      const list = res?.results || [];
      const summary = res?.summary || null;
      setSubmitResults({ results: list, summary });
      if (summary) {
        showSuccess(`Submit complete: ${summary.success} succeeded, ${summary.failed} failed out of ${summary.total}.`);
      } else {
        showSuccess('Submit complete.');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Bulk submit failed.');
    }
    setSubmittingBulk(false);
  };

  /* ── Export the grade results table to Excel ── */
  const exportResults = () => {
    if (!results?.results?.length) { showError('Nothing to export yet.'); return; }
    const aoa = [['bobbin_no', 'status', 'grade', 'detail']];
    results.results.forEach(r => {
      aoa.push([r.bobbin_no, metaFor(r.status).label, r.matched_grade || '', detailFor(r)]);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Grade Results');
    XLSX.writeFile(wb, `bulk_grade_results_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  /* ── Export the submit results table to Excel ── */
  const exportSubmitResults = () => {
    if (!submitResults?.results?.length) { showError('Nothing to export yet.'); return; }
    const aoa = [['bobbin_no', 'status', 'grade', 'message']];
    submitResults.results.forEach(r => {
      aoa.push([r.bobbin_no, submitMetaFor(r.status).label, r.grade || '', r.message || '']);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Submit Results');
    XLSX.writeFile(wb, `bulk_submit_results_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const removeBobbin = (b) => setBobbins(prev => prev.filter(x => x !== b));

  const summary = results?.summary;
  const summaryChips = summary && [
    ['Total', summary.total, 'bg-slate-100 text-slate-700 border-slate-300'],
    ['Passed', summary.passed, 'bg-emerald-100 text-emerald-700 border-emerald-300'],
    ['Failed', summary.failed, 'bg-red-100 text-red-700 border-red-300'],
    ['Missing', summary.missing, 'bg-amber-100 text-amber-700 border-amber-300'],
    ['Skipped', summary.skipped, 'bg-slate-100 text-slate-600 border-slate-300'],
  ].filter(([, v]) => v !== undefined && v !== null);

  const isSubmitFeature = feature === 'submit';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[720px] max-w-full max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="bg-slate-700 p-1.5 text-white rounded"><FileSpreadsheet size={15} /></div>
          <h3 className="text-sm font-bold text-slate-800">{featureTitle}</h3>
          {/* Back to feature chooser (visible once a feature is picked) */}
          {feature && (
            <button type="button" onClick={resetAll}
              className="ml-2 flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-100">
              <Layers size={10} /> Change Feature
            </button>
          )}
          {/* Back to mode chooser within the active feature */}
          {feature && mode && (
            <button type="button" onClick={resetToMode}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-100">
              <RotateCcw size={10} /> Change Mode
            </button>
          )}
          <button type="button" onClick={close} className="ml-auto text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Feature chooser (top level) ── */}
          {!feature && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFeature('tempgrade')}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/40 transition-all">
                <Award size={28} className="text-amber-600" />
                <span className="text-sm font-bold text-slate-800">Bulk Temp Grade</span>
                <span className="text-[10px] text-slate-500 text-center">Grade many bobbins at once (Excel or Automatic), then optionally submit the passed ones</span>
              </button>
              <button type="button" onClick={() => setFeature('submit')}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
                <Send size={28} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Bulk Submit</span>
                <span className="text-[10px] text-slate-500 text-center">Finalize QC for many bobbins at once (Excel or Automatic)</span>
              </button>
            </div>
          )}

          {/* ── Mode chooser (within a feature) ── */}
          {feature && !mode && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode('excel')}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition-all">
                <FileSpreadsheet size={28} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Excel</span>
                <span className="text-[10px] text-slate-500 text-center">Import a list of bobbin numbers from an Excel file</span>
              </button>
              <button type="button" onClick={() => setMode('auto')}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
                <Sparkles size={28} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Automatic</span>
                <span className="text-[10px] text-slate-500 text-center">
                  {isSubmitFeature
                    ? 'Auto-load all bobbins that have a temp grade but no final grade yet'
                    : 'Auto-load all bobbins pending a temp grade'}
                </span>
              </button>
            </div>
          )}

          {/* ── Excel controls ── */}
          {feature && mode === 'excel' && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button type="button" onClick={downloadBobbinTemplate}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200">
                <Download size={12} /> Download Template
              </button>
              <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-blue-700">
                <Upload size={12} /> Import Excel
                <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
              </label>
              <span className="text-[10px] text-slate-500">Only a single <span className="font-mono font-bold">bobbin_no</span> column is used.</span>
            </div>
          )}

          {/* ── Automatic controls ── */}
          {feature && mode === 'auto' && (
            <div className="flex items-center gap-2 mb-4">
              <button type="button" onClick={isSubmitFeature ? loadPendingFinalSubmit : loadPendingTempGrade} disabled={loadingList}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                {loadingList ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {loadingList ? 'Loading...' : 'Load Pending Bobbins'}
              </button>
              <span className="text-[10px] text-slate-500">
                {isSubmitFeature
                  ? 'In qc_entry_temp with temp grade, no final grade yet, not in qc_entry.'
                  : 'In bobbin_entries + qc_entry_temp, no temp grade yet.'}
              </span>
            </div>
          )}

          {/* ── Imported / loaded list (shown before grade results / submit results) ── */}
          {feature && mode && bobbins.length > 0 && !results && !submitResults && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-700">{bobbins.length} bobbin{bobbins.length > 1 ? 's' : ''} ready</span>
                <button type="button" onClick={() => setBobbins([])} className="text-[9px] font-bold text-slate-500 hover:text-red-600">Clear</button>
              </div>
              <div className="max-h-[280px] overflow-y-auto p-2 flex flex-wrap gap-1.5">
                {bobbins.map(b => (
                  <span key={b} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">
                    {b}
                    <button type="button" onClick={() => removeBobbin(b)} className="text-slate-400 hover:text-red-600"><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Grade results table (Temp Grade feature) ── */}
          {results && (
            <div>
              {summaryChips && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {summaryChips.map(([label, val, cls]) => (
                    <span key={label} className={`text-[10px] font-bold px-2 py-1 rounded border ${cls}`}>{label}: {val}</span>
                  ))}
                </div>
              )}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-3 py-2 font-bold w-8">
                          <input type="checkbox"
                            checked={passedBobbins.length > 0 && selected.size === passedBobbins.length}
                            onChange={toggleSelectAllPassed}
                            disabled={passedBobbins.length === 0}
                            title="Select all Passed bobbins" />
                        </th>
                        <th className="text-left px-3 py-2 font-bold">Bobbin</th>
                        <th className="text-left px-3 py-2 font-bold">Status</th>
                        <th className="text-left px-3 py-2 font-bold">Grade</th>
                        <th className="text-left px-3 py-2 font-bold">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((r, i) => {
                        const m = metaFor(r.status);
                        const Icon = m.Icon;
                        const selectable = r.status === 'PASSED';
                        return (
                          <tr key={`${r.bobbin_no}-${i}`} className={`border-t border-slate-100 ${m.row}`}>
                            <td className="px-3 py-1.5">
                              <input type="checkbox"
                                checked={selected.has(r.bobbin_no)}
                                disabled={!selectable}
                                onChange={() => toggleSelected(r.bobbin_no)}
                                title={selectable ? '' : 'Only Passed bobbins can be submitted'} />
                            </td>
                            <td className="px-3 py-1.5 font-mono font-bold text-slate-800">{r.bobbin_no}</td>
                            <td className="px-3 py-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-bold ${m.cls}`}>
                                <Icon size={10} /> {m.label}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-bold text-slate-800">{r.matched_grade || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-600">{detailFor(r)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {passedBobbins.length > 0 && (
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {selected.size} of {passedBobbins.length} passed bobbin{passedBobbins.length > 1 ? 's' : ''} selected for final submit.
                </p>
              )}
            </div>
          )}

          {/* ── Submit Final (bulk) results breakdown ── */}
          {submitResults && (
            <div className={results ? 'mt-4' : ''}>
              <h4 className="text-[11px] font-bold text-slate-700 mb-2">Final Submit Results</h4>
              {submitResults.summary && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-slate-100 text-slate-700 border-slate-300">Total: {submitResults.summary.total}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-emerald-100 text-emerald-700 border-emerald-300">Succeeded: {submitResults.summary.success}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded border bg-red-100 text-red-700 border-red-300">Failed: {submitResults.summary.failed}</span>
                  {submitResults.summary.error > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded border bg-rose-100 text-rose-700 border-rose-300">Error: {submitResults.summary.error}</span>
                  )}
                </div>
              )}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-[280px] overflow-y-auto">
                  <table className="w-full text-[10px]">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700">
                      <tr>
                        <th className="text-left px-3 py-2 font-bold">Bobbin</th>
                        <th className="text-left px-3 py-2 font-bold">Status</th>
                        <th className="text-left px-3 py-2 font-bold">Grade</th>
                        <th className="text-left px-3 py-2 font-bold">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submitResults.results.map((r, i) => {
                        const m = submitMetaFor(r.status);
                        const Icon = m.Icon;
                        return (
                          <tr key={`${r.bobbin_no}-submit-${i}`} className={`border-t border-slate-100 ${m.row}`}>
                            <td className="px-3 py-1.5 font-mono font-bold text-slate-800">{r.bobbin_no}</td>
                            <td className="px-3 py-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-bold ${m.cls}`}>
                                <Icon size={10} /> {m.label}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-bold text-slate-800">{r.grade || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-600">{r.message || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {feature && mode && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            {/* Export: grade results (temp grade feature) or submit results (submit feature) */}
            {results && (
              <button type="button" onClick={exportResults}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200">
                <FileDown size={12} /> Export Excel
              </button>
            )}
            {isSubmitFeature && submitResults && (
              <button type="button" onClick={exportSubmitResults}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200">
                <FileDown size={12} /> Export Excel
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={close}
                className="px-3 py-2 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300">Close</button>

              {/* Temp Grade feature: Grade -> then Submit Selected */}
              {!isSubmitFeature && !results && (
                <button type="button" onClick={startGrading} disabled={grading || bobbins.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 disabled:opacity-40">
                  {grading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {grading ? 'Grading...' : `Start Grading${bobbins.length ? ` (${bobbins.length})` : ''}`}
                </button>
              )}
              {!isSubmitFeature && results && (
                <button type="button" onClick={submitSelected} disabled={submittingBulk || selected.size === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                  {submittingBulk ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {submittingBulk ? 'Submitting...' : `Submit Selected${selected.size ? ` (${selected.size})` : ''}`}
                </button>
              )}

              {/* Submit feature: submit the whole imported/loaded list directly */}
              {isSubmitFeature && (
                <button type="button" onClick={submitBulkDirect} disabled={submittingBulk || bobbins.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                  {submittingBulk ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {submittingBulk ? 'Submitting...' : `Submit${bobbins.length ? ` (${bobbins.length})` : ''}`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEntryModal;
