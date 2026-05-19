import React, { useState, useRef } from 'react';
import { Scan, Upload, Trash2, FileText, Plus, XCircle } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { Formik, Form, Field } from 'formik';

/* ── Dummy scan data ── */
let dummyCounter = 1;
const makeDummyRow = (barcode = null) => ({
  id: Date.now() + Math.random(),
  fiber_id: barcode || `TEF52${String(dummyCounter++).padStart(4, '0')}`,
  status: 'Rejected',
  reason: '',   // editable per row
  colour: '',   // editable per row
});

/* ── Compact editable table cell ── */
const EditCell = ({ value, onChange, placeholder = '' }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-transparent px-1.5 py-0.5 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded border border-transparent focus:border-blue-200 transition-all"
  />
);

/* ── Compact select cell ── */
const EditSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full appearance-none bg-transparent px-1.5 py-0.5 text-xs outline-none focus:bg-white rounded cursor-pointer border border-transparent focus:border-blue-200 transition-all pr-4"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
  </div>
);

const COLOUR_OPTIONS = ['', 'Red', 'Blue', 'Green', 'Yellow', 'White', 'Orange', 'Violet', 'Natural'];

/* ══════════════════════════════════════════════════════════ */
const FGFiberRejection = () => {
  const [mode, setMode] = useState('');        // 'scan' | 'upload'
  const [barcodeInput, setBarcodeInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [rows, setRows] = useState([]);
  const fileRef = useRef(null);
  const scanRef = useRef(null);

  /* ── Mode toggle — only one at a time ── */
  const handleMode = (val) => {
    setMode(prev => prev === val ? '' : val);
    setBarcodeInput('');
    setUploadedFile(null);
  };

  /* ── Add row from scan ── */
  const addScanRow = (barcode) => {
    if (!barcode.trim()) return;
    setRows(prev => [...prev, makeDummyRow(barcode)]);
    setBarcodeInput('');
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── File upload (simulate parsing) ── */
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploadedFile(f);
    /* Simulate 5 rows from file */
    const fakeRows = Array.from({ length: 5 }, () => makeDummyRow());
    setRows(prev => [...prev, ...fakeRows]);
  };

  /* ── Test button — add dummy row ── */
  const addTestRow = () => setRows(prev => [...prev, makeDummyRow()]);

  /* ── Remove row ── */
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  /* ── Edit cell ── */
  const editRow = (id, field, value) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  /* ── Apply global reason/colour to all rows ── */
  const applyGlobal = (reason, colour) => {
    setRows(prev => prev.map(r => ({
      ...r,
      reason: reason || r.reason,
      colour: colour || r.colour,
    })));
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={{ rejection_reason: '', colour_required: '', rejected_by: '' }}
          onSubmit={(values) => {
            if (rows.length === 0) { alert('No fibers to reject.'); return; }
            console.log('FG Fiber Rejection:', { ...values, fibers: rows });
            alert(`Rejected ${rows.length} fiber(s) successfully!`);
            setRows([]);
          }}
        >
          {({ values, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
              {/* ── Controls card ── */}
              <ModuleCard compact title="FG Fiber Rejection" icon={<XCircle size={13} className="text-rose-600" />}>
                <div className="flex flex-col gap-3">

                  {/* Row 1: Mode checkboxes */}
                  <div className="flex items-center gap-6 pb-2 border-b border-slate-100">
                    {/* With Scan */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={mode === 'scan'}
                        onChange={() => handleMode('scan')}
                        className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${mode === 'scan' ? 'text-blue-600' : 'text-slate-600'}`}>
                        With Scan
                      </span>
                    </label>
                    {/* Upload File */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={mode === 'upload'}
                        onChange={() => handleMode('upload')}
                        className="w-4 h-4 rounded border-slate-300 accent-indigo-600" />
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${mode === 'upload' ? 'text-indigo-600' : 'text-slate-600'}`}>
                        Upload File
                      </span>
                    </label>

                    {/* Scan input — shown when scan mode */}
                    {mode === 'scan' && (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 max-w-xs">
                          <input
                            ref={scanRef}
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addScanRow(barcodeInput); } }}
                            placeholder="Scan barcode..."
                            autoFocus
                            className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20"
                          />
                        </div>
                        <button type="button" onClick={() => addScanRow(barcodeInput)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 transition-all h-[28px]">
                          <Scan size={10} /> Scan
                        </button>
                        {/* Test button */}
                        <button type="button" onClick={addTestRow}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded hover:bg-amber-600 transition-all h-[28px]">
                          <Plus size={10} /> Test
                        </button>
                      </div>
                    )}

                    {/* File upload — shown when upload mode */}
                    {mode === 'upload' && (
                      <div className="flex items-center gap-2">
                        <input ref={fileRef} type="file" accept=".xlsx,.pdf,.csv"
                          onChange={handleFile} className="hidden" />
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold rounded hover:bg-slate-200 transition-all">
                          <Upload size={11} /> Choose File
                        </button>
                        {uploadedFile ? (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                            <FileText size={10} />
                            <span className="max-w-[140px] truncate">{uploadedFile.name}</span>
                            <button type="button" onClick={() => setUploadedFile(null)}
                              className="ml-1 text-rose-500 hover:text-rose-700">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400">xlsx / pdf / csv</span>
                        )}
                        {/* Test button for upload mode too */}
                        <button type="button" onClick={addTestRow}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded hover:bg-amber-600 transition-all h-[28px]">
                          <Plus size={10} /> Test
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Global fields */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <FormikInput compact label="Rejection Reason (Remark)" name="rejection_reason"
                        placeholder="Enter reason..." />
                    </div>
                    <FormikSelect compact label="Colour Required" name="colour_required"
                      options={COLOUR_OPTIONS} />
                    <FormikSelect compact label="Rejected By" name="rejected_by"
                      options={['Select', 'Operator A', 'Operator B', 'QA Lead', 'Manager', 'Supervisor']} />
                  </div>

                  {/* Apply global to all rows */}
                  {rows.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => applyGlobal(values.rejection_reason, values.colour_required)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white text-[9px] font-bold rounded hover:bg-slate-800 transition-all">
                        Apply Reason &amp; Colour to All Rows
                      </button>
                      <span className="text-[9px] text-slate-400">
                        (or edit per row in the table below)
                      </span>
                    </div>
                  )}
                </div>
              </ModuleCard>

              {/* ── Fiber table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <XCircle size={12} className="text-rose-600" />
                    <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Rejection List</span>
                    {rows.length > 0 && (
                      <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">{rows.length} fibers</span>
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-8 border-r border-slate-100">#</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Fiber ID</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Status</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Reason (editable)</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Colour (editable)</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-[10px] text-slate-400">
                            {mode === 'scan'
                              ? 'Scan a barcode or click Test to add fibers'
                              : mode === 'upload'
                                ? 'Upload a file or click Test to add fibers'
                                : 'Select "With Scan" or "Upload File" to begin'}
                          </td>
                        </tr>
                      ) : rows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-rose-50/20 transition-colors">
                          <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">{idx + 1}</td>
                          <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.fiber_id}</td>
                          <td className="px-2 py-1.5 border-r border-slate-100">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{row.status}</span>
                          </td>
                          {/* Editable reason */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <EditCell value={row.reason} onChange={v => editRow(row.id, 'reason', v)} placeholder="Enter reason..." />
                          </td>
                          {/* Editable colour */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <EditSelect value={row.colour} onChange={v => editRow(row.id, 'colour', v)} options={COLOUR_OPTIONS} />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button type="button" onClick={() => removeRow(row.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FGFiberRejection;
