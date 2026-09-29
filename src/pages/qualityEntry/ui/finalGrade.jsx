import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Scan, Layers, CheckCircle2, XCircle, Trash2, Send, Loader2, Award, Upload, FileSpreadsheet } from 'lucide-react';
import { submitFinalGrade, submitFinalGradeBulk } from '../services/qc_entry.api';
import { showSuccess, showError } from '../../../utils/toastService';

/* ── Status badge (shared look for single result rows + bulk results table) ── */
const StatusBadge = ({ status }) => {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
        <CheckCircle2 size={10} /> Success
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700">
        <XCircle size={10} /> Error
      </span>
    );
  }
  return <span className="text-[9px] text-slate-400">—</span>;
};

/* ══════════════════════════════════════════════════════════
   Final Grade Screen
   Promotes an already-assigned temp_grade to final_grade.
   Two modes on one screen, toggled via tabs:
     • Single — scan one bobbin at a time, submit immediately.
     • Bulk   — import an Excel file (Bobbin No / FID / Product Type /
                Temp Grade columns), review the loaded rows, then submit
                all at once. Only bobbin_no is sent to the API — the other
                columns are shown for the operator to visually confirm.
   ══════════════════════════════════════════════════════════ */
const FinalGradeScreen = () => {
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'

  /* ── Single mode state ── */
  const [scanInput, setScanInput] = useState('');
  const [submittingSingle, setSubmittingSingle] = useState(false);
  const [singleResults, setSingleResults] = useState([]); // running history, newest first
  const singleScanRef = useRef(null);

  /* ── Bulk mode state (Excel import) ── */
  const [bulkRows, setBulkRows] = useState([]); // [{ bobbin_no, fid, product_type, temp_grade }] parsed from Excel
  const [fileName, setFileName] = useState('');
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [bulkResults, setBulkResults] = useState(null); // { summary, results:[] } | null
  const fileRef = useRef(null);

  /* ══════════════════════════════════════════════════════════
     SINGLE MODE
     ══════════════════════════════════════════════════════════ */
  const handleSingleSubmit = async () => {
    if (submittingSingle) return; // guard against double-Enter / double-click while a request is in flight

    const bobbin_no = scanInput.trim().toUpperCase();
    if (!bobbin_no) { showError('Enter bobbin number'); return; }

    // Basic bobbin format guard — alphanumeric only, matches how bobbin_no is
    // normalised elsewhere in this app (qcEntry.jsx / bulkFinalGrade.jsx).
    if (!/^[A-Z0-9]+$/.test(bobbin_no)) {
      showError('Invalid bobbin number format');
      return;
    }

    // Block re-submitting a bobbin that already succeeded in this session —
    // avoids firing a redundant request for something already finalized here.
    const already = singleResults.find(r => r.bobbin_no === bobbin_no && r.status === 'success');
    if (already) {
      showError(`${bobbin_no} was already finalized in this session (Grade: ${already.final_grade || '—'})`);
      setScanInput('');
      singleScanRef.current?.focus();
      return;
    }

    setSubmittingSingle(true);
    try {
      const res = await submitFinalGrade(bobbin_no);
      if (res?.success) {
        setSingleResults(prev => [{
          bobbin_no,
          status: res.status || 'success',
          message: res.message || 'Final grade submitted successfully',
          final_grade: res.final_grade || '',
        }, ...prev]);
        showSuccess(`${res.message || 'Final grade submitted successfully'}${res.final_grade ? ` — Grade: ${res.final_grade}` : ''}`);
        setScanInput(''); // clear scan input so the operator can scan the next bobbin
      } else {
        setSingleResults(prev => [{
          bobbin_no,
          status: res?.status || 'error',
          message: res?.message || 'Final grade submission failed',
          final_grade: '',
        }, ...prev]);
        showError(res?.message || 'Final grade submission failed');
      }
    } catch (e) {
      // Backend returns 400 with { success:false, status:'error', message } on business-rule failures
      const data = e?.response?.data;
      const msg = data?.message || 'Final grade submission failed';
      setSingleResults(prev => [{
        bobbin_no,
        status: data?.status || 'error',
        message: msg,
        final_grade: '',
      }, ...prev]);
      showError(msg);
    }
    setSubmittingSingle(false);
    singleScanRef.current?.focus();
  };

  const handleClearSingleResults = () => setSingleResults([]);

  /* ══════════════════════════════════════════════════════════
     BULK MODE — Excel import
     ══════════════════════════════════════════════════════════ */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!jsonData.length) {
          showError('Excel file is empty');
          return;
        }

        // Map columns — support various header names, matching the project's
        // established Excel-import convention (see BulkFinalGrade / D2 flows).
        const rows = jsonData.map((row) => {
          const bobbin_no = row['Bobbin No'] || row['bobbin_no'] || row['Bobbin_No'] || row['BOBBIN_NO'] || '';
          const fid = row['FID'] || row['fid'] || row['Fid'] || '';
          const product_type = row['Product Type'] || row['product_type'] || row['Product_Type'] || '';
          const temp_grade = row['Temp Grade'] || row['temp_grade'] || row['Temp_Grade'] || '';
          return {
            bobbin_no: String(bobbin_no).trim().toUpperCase(),
            fid: String(fid).trim(),
            product_type: String(product_type).trim(),
            temp_grade: String(temp_grade).trim(),
          };
        }).filter(r => r.bobbin_no); // drop rows with no bobbin_no

        if (!rows.length) {
          showError('No valid bobbin entries found in the Excel file');
          return;
        }

        // De-dupe by bobbin_no, keep first occurrence
        const seen = new Set();
        const unique = rows.filter(r => (seen.has(r.bobbin_no) ? false : (seen.add(r.bobbin_no), true)));

        setBulkRows(unique);
        setBulkResults(null);
        showSuccess(`Loaded ${unique.length} bobbin${unique.length > 1 ? 's' : ''} from Excel`);
      } catch {
        showError('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // allow re-importing the same file
  };

  const removeBulkRow = (bobbin_no) => {
    setBulkRows(prev => prev.filter(r => r.bobbin_no !== bobbin_no));
    setBulkResults(null);
  };

  const clearBulkRows = () => {
    setBulkRows([]);
    setBulkResults(null);
    setFileName('');
  };

  const handleBulkSubmit = async () => {
    if (bulkRows.length === 0) { showError('Import an Excel file with at least one bobbin'); return; }
    setSubmittingBulk(true);
    try {
      // Only bobbin_no is sent — FID/Product Type/Temp Grade are shown for
      // visual confirmation only, the backend re-derives/validates the grade itself.
      const bobbin_nos = bulkRows.map(r => r.bobbin_no);
      const res = await submitFinalGradeBulk(bobbin_nos);
      const results = res?.results || [];
      const summary = res?.summary || null;
      setBulkResults({ results, summary });
      if (summary) {
        showSuccess(`${summary.success} succeeded, ${summary.error} failed out of ${summary.total}`);
      } else {
        showSuccess('Bulk final grade submit complete');
      }
      setBulkRows([]); // reset the batch so the operator can import the next file
      setFileName('');
    } catch (e) {
      showError(e?.response?.data?.message || 'Bulk final grade submission failed');
    }
    setSubmittingBulk(false);
  };

  const successCount = bulkResults?.results?.filter(r => r.status === 'success').length ?? 0;
  const errorCount = bulkResults?.results?.filter(r => r.status === 'error').length ?? 0;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Header + Mode Tabs ── */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <Award size={14} className="text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Final Grade</span>

          <div className="ml-4 flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button type="button" onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all
                ${mode === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Scan size={11} /> Single
            </button>
            <button type="button" onClick={() => setMode('bulk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all
                ${mode === 'bulk' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Layers size={11} /> Bulk
            </button>
          </div>

          <span className="ml-auto text-[9px] text-slate-400">Promotes an assigned Temp Grade to Final Grade.</span>
        </div>

        {/* ══════════════════════════════════════════════════════════
             SINGLE MODE
           ══════════════════════════════════════════════════════════ */}
        {mode === 'single' && (
          <>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <input
                ref={singleScanRef}
                autoFocus
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSingleSubmit(); } }}
                placeholder="Scan bobbin..."
                disabled={submittingSingle}
                className="flex-1 max-w-xs px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 font-bold text-indigo-700 disabled:opacity-60"
              />
              <button type="button" onClick={handleSingleSubmit} disabled={submittingSingle || !scanInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">
                {submittingSingle ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {submittingSingle ? 'Submitting...' : 'Final Entry'}
              </button>
              {singleResults.length > 0 && (
                <button type="button" onClick={handleClearSingleResults}
                  className="flex items-center gap-1 px-2 py-2 text-slate-400 hover:text-red-600 transition-all" title="Clear history">
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {singleResults.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Award size={32} className="opacity-40" />
                    <span className="text-xs font-medium">Scan a bobbin and click Final Entry</span>
                  </div>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Bobbin No</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Final Grade</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {singleResults.map((row, idx) => (
                      <tr key={`${row.bobbin_no}-${idx}`} className={row.status === 'error' ? 'bg-red-50/40' : 'bg-emerald-50/30'}>
                        <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2"><span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span></td>
                        <td className="px-3 py-2 text-center">
                          {row.final_grade
                            ? <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">{row.final_grade}</span>
                            : <span className="text-[9px] text-slate-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center"><StatusBadge status={row.status} /></td>
                        <td className="px-3 py-2 text-[10px] text-slate-600">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
             BULK MODE — Excel import
           ══════════════════════════════════════════════════════════ */}
        {mode === 'bulk' && (
          <>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={submittingBulk}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50">
                <Upload size={13} />
                {fileName || 'Choose Excel File'}
              </button>
              <span className="text-[10px] text-slate-400">Columns: Bobbin No, FID, Product Type, Temp Grade</span>
              {bulkRows.length > 0 && (
                <span className="text-[10px] text-slate-500 font-medium">{bulkRows.length} bobbin{bulkRows.length !== 1 ? 's' : ''} loaded</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {bulkRows.length > 0 && (
                  <button type="button" onClick={clearBulkRows} disabled={submittingBulk}
                    className="flex items-center gap-1 px-2 py-2 text-slate-400 hover:text-red-600 transition-all disabled:opacity-50" title="Clear list">
                    <Trash2 size={13} />
                  </button>
                )}
                <button type="button" onClick={handleBulkSubmit} disabled={submittingBulk || bulkRows.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50">
                  {submittingBulk ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {submittingBulk ? 'Submitting...' : `Submit All${bulkRows.length ? ` (${bulkRows.length})` : ''}`}
                </button>
              </div>
            </div>

            {/* Summary banner (after a bulk submit) */}
            {bulkResults && (
              <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {bulkResults.summary
                    ? `${bulkResults.summary.success} succeeded, ${bulkResults.summary.error} failed out of ${bulkResults.summary.total}`
                    : 'Results:'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 size={10} /> {successCount} Success
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700">
                  <XCircle size={10} /> {errorCount} Failed
                </span>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {/* Results table takes priority once a submit has run; otherwise show the loaded (pending) rows */}
              {bulkResults ? (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Bobbin No</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Final Grade</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkResults.results.map((row, idx) => (
                      <tr key={`${row.bobbin_no}-${idx}`} className={row.status === 'error' ? 'bg-red-50/40' : 'bg-emerald-50/30'}>
                        <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2"><span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span></td>
                        <td className="px-3 py-2 text-center">
                          {row.final_grade
                            ? <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">{row.final_grade}</span>
                            : <span className="text-[9px] text-slate-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center"><StatusBadge status={row.status} /></td>
                        <td className="px-3 py-2 text-[10px] text-slate-600">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : bulkRows.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Bobbin No</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">FID</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Product Type</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Temp Grade</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkRows.map((row, idx) => (
                      <tr key={row.bobbin_no} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2"><span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span></td>
                        <td className="px-3 py-2 text-[11px] text-slate-700">{row.fid || '—'}</td>
                        <td className="px-3 py-2 text-[11px] text-slate-700">{row.product_type || '—'}</td>
                        <td className="px-3 py-2 text-center">
                          {row.temp_grade
                            ? <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">{row.temp_grade}</span>
                            : <span className="text-[9px] text-slate-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button type="button" onClick={() => removeBulkRow(row.bobbin_no)} disabled={submittingBulk}
                            className="text-slate-300 hover:text-red-600 disabled:opacity-50" title="Remove">
                            <XCircle size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileSpreadsheet size={32} className="opacity-40" />
                    <span className="text-xs font-medium">Import an Excel file to build a batch, then Submit All</span>
                    <span className="text-[10px]">Expected columns: Bobbin No, FID, Product Type, Temp Grade</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinalGradeScreen;
