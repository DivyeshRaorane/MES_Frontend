import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  X, FileSpreadsheet, Sparkles, Download, Upload, Play, Loader2,
  CheckCircle2, XCircle, MinusCircle, AlertTriangle, RotateCcw, FileDown,
} from 'lucide-react';
import { gradeBobbinBulk, getPendingTempGrade } from '../services/qc_entry.api';
import { showSuccess, showError } from '../../../utils/toastService';

/* ══════════════════════════════════════════════════════════
   Bulk Temp-Grade Entry — additive feature.
   Two modes:
     • Excel     — download a single-column (bobbin_no) template, import an
                   .xlsx, grade the imported bobbins.
     • Automatic — auto-load all bobbins pending temp grade, grade them.
   All grading is delegated to POST /qcentry/grade-bulk. The backend applies the
   skip rules (not tested / already graded) and the existing validateBobbinQC.
   ══════════════════════════════════════════════════════════ */

/* Per-status presentation (badge + row tint + icon). */
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

const BulkEntryModal = ({ open, onClose }) => {
  const [mode, setMode] = useState(null);       // null | 'excel' | 'auto'
  const [bobbins, setBobbins] = useState([]);   // string[] of bobbin_no to grade
  const [results, setResults] = useState(null); // { summary, results:[] } | null
  const [grading, setGrading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  if (!open) return null;

  const reset = () => { setMode(null); setBobbins([]); setResults(null); setGrading(false); setLoadingList(false); };
  const close = () => { reset(); onClose?.(); };

  /* ── Download a single-column (bobbin_no) template ── */
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([['bobbin_no'], ['']]);
    ws['!cols'] = [{ wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bobbins');
    XLSX.writeFile(wb, 'bulk_bobbin_template.xlsx');
  };

  /* ── Import .xlsx and extract the bobbin_no column ── */
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

        // Locate the bobbin_no column (case-insensitive header match); fall back to first column.
        let headerRow = rows[0] || [];
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

        if (list.length === 0) { showError('No bobbin numbers found in the file.'); return; }
        setBobbins(list);
        setResults(null);
        showSuccess(`Imported ${list.length} bobbin${list.length > 1 ? 's' : ''}.`);
      } catch (err) {
        console.error('Excel import error:', err);
        showError('Could not read the Excel file. Use the provided template.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // allow re-importing the same file
  };

  /* ── Automatic mode: load bobbins pending temp grade ── */
  const loadPending = async () => {
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

  /* ── Run grading for the current list ── */
  const startGrading = async () => {
    if (bobbins.length === 0) { showError('No bobbins to grade.'); return; }
    setGrading(true);
    try {
      const res = await gradeBobbinBulk(bobbins);
      const list = res?.results || [];
      const summary = res?.summary || null;
      setResults({ results: list, summary });
      const passed = summary?.passed ?? list.filter(r => r.status === 'PASSED').length;
      showSuccess(`Grading complete. ${passed} passed.`);
    } catch (err) {
      showError(err?.response?.data?.message || 'Bulk grading failed.');
    }
    setGrading(false);
  };

  /* ── Export the results table to Excel ── */
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

  const removeBobbin = (b) => setBobbins(prev => prev.filter(x => x !== b));

  const summary = results?.summary;
  const summaryChips = summary && [
    ['Total', summary.total, 'bg-slate-100 text-slate-700 border-slate-300'],
    ['Passed', summary.passed, 'bg-emerald-100 text-emerald-700 border-emerald-300'],
    ['Failed', summary.failed, 'bg-red-100 text-red-700 border-red-300'],
    ['Missing', summary.missing, 'bg-amber-100 text-amber-700 border-amber-300'],
    ['Skipped', summary.skipped, 'bg-slate-100 text-slate-600 border-slate-300'],
  ].filter(([, v]) => v !== undefined && v !== null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[720px] max-w-full max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="bg-slate-700 p-1.5 text-white rounded"><FileSpreadsheet size={15} /></div>
          <h3 className="text-sm font-bold text-slate-800">Bulk Temp Grade</h3>
          {mode && (
            <button type="button" onClick={reset}
              className="ml-2 flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-100">
              <RotateCcw size={10} /> Change Mode
            </button>
          )}
          <button type="button" onClick={close} className="ml-auto text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Mode chooser ── */}
          {!mode && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode('excel')}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition-all">
                <FileSpreadsheet size={28} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Excel</span>
                <span className="text-[10px] text-slate-500 text-center">Import a list of bobbin numbers from an Excel file</span>
              </button>
              <button type="button" onClick={() => { setMode('auto'); }}
                className="flex flex-col items-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
                <Sparkles size={28} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Automatic</span>
                <span className="text-[10px] text-slate-500 text-center">Auto-load all bobbins pending a temp grade</span>
              </button>
            </div>
          )}

          {/* ── Excel controls ── */}
          {mode === 'excel' && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button type="button" onClick={downloadTemplate}
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
          {mode === 'auto' && (
            <div className="flex items-center gap-2 mb-4">
              <button type="button" onClick={loadPending} disabled={loadingList}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                {loadingList ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {loadingList ? 'Loading...' : 'Load Pending Bobbins'}
              </button>
              <span className="text-[10px] text-slate-500">In bobbin_entries + qc_entry_temp, no temp grade yet.</span>
            </div>
          )}

          {/* ── Imported / loaded list ── */}
          {mode && bobbins.length > 0 && !results && (
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

          {/* ── Results table ── */}
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
                        return (
                          <tr key={`${r.bobbin_no}-${i}`} className={`border-t border-slate-100 ${m.row}`}>
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
            </div>
          )}
        </div>

        {/* Footer actions */}
        {mode && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            {results && (
              <button type="button" onClick={exportResults}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200">
                <FileDown size={12} /> Export Excel
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={close}
                className="px-3 py-2 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300">Close</button>
              {!results && (
                <button type="button" onClick={startGrading} disabled={grading || bobbins.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 disabled:opacity-40">
                  {grading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {grading ? 'Grading...' : `Start Grading${bobbins.length ? ` (${bobbins.length})` : ''}`}
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
