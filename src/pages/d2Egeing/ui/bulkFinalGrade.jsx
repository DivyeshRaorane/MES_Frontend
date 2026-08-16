import { useState, useRef } from 'react';
import { Scan, Upload, CheckCircle2, XCircle, AlertTriangle, Award, FileSpreadsheet, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { processSingleFinalGrade, processBulkFinalGrade } from '../services/d2_issue.api';
import { showSuccess, showError } from '../../../utils/toastService';

/* ── Status badge helper ── */
const StatusBadge = ({ status }) => {
  if (status === 'success') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700"><CheckCircle2 size={10} /> Success</span>;
  if (status === 'already_done') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700"><CheckCircle2 size={10} /> Already Graded</span>;
  if (status === 'error') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700"><XCircle size={10} /> Failed</span>;
  if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600"><AlertTriangle size={10} /> Pending</span>;
  return <span className="text-[9px] text-slate-400">—</span>;
};

const BulkFinalGrade = () => {
  const [scanInput, setScanInput] = useState('');
  const [scanResults, setScanResults] = useState([]);
  const [scanLoading, setScanLoading] = useState(false);

  const [bulkBobbins, setBulkBobbins] = useState([]);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');

  const fileRef = useRef(null);
  const scanRef = useRef(null);

  /* ══════════════════════════════════════════════════════════
     SINGLE SCAN MODE
     ══════════════════════════════════════════════════════════ */
  const handleSingleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) { showError('Enter bobbin number'); return; }

    // Check if already scanned
    if (scanResults.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin is already in the list');
      setScanInput('');
      scanRef.current?.focus();
      return;
    }

    setScanLoading(true);
    try {
      const res = await processSingleFinalGrade(bobbin_no);
      if (res?.success) {
        setScanResults(prev => [{
          bobbin_no,
          fid: res.data?.fid || '',
          product_type: res.data?.product_type || '',
          temp_grade: res.data?.temp_grade || '',
          final_grade: res.data?.final_grade || '',
          status: res.data?.status || 'success',
          remark: res.data?.remark || 'Final grade assigned',
        }, ...prev]);
        if (res.data?.status === 'success') {
          showSuccess(`Final grade assigned: ${res.data?.final_grade || res.data?.temp_grade}`);
        } else if (res.data?.status === 'already_done') {
          showSuccess('Already has final grade');
        }
      } else {
        setScanResults(prev => [{
          bobbin_no,
          fid: '',
          product_type: '',
          temp_grade: '',
          final_grade: '',
          status: 'error',
          remark: res?.message || 'Processing failed',
        }, ...prev]);
        showError(res?.message || 'Processing failed');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Processing failed';
      setScanResults(prev => [{
        bobbin_no,
        fid: '',
        product_type: '',
        temp_grade: '',
        final_grade: '',
        status: 'error',
        remark: msg,
      }, ...prev]);
      showError(msg);
    }
    setScanInput('');
    setScanLoading(false);
    scanRef.current?.focus();
  };

  /* ══════════════════════════════════════════════════════════
     BULK EXCEL IMPORT MODE
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

        // Map columns — support various header names
        const bobbins = jsonData.map((row, idx) => {
          const bobbin_no = row['Bobbin No'] || row['bobbin_no'] || row['Bobbin_No'] || row['BOBBIN_NO'] || '';
          const fid = row['FID'] || row['fid'] || row['Fid'] || '';
          const product_type = row['Product Type'] || row['product_type'] || row['Product_Type'] || '';
          const temp_grade = row['Temp Grade'] || row['temp_grade'] || row['Temp_Grade'] || '';
          return { id: idx, bobbin_no: String(bobbin_no).trim(), fid: String(fid).trim(), product_type: String(product_type).trim(), temp_grade: String(temp_grade).trim() };
        }).filter(b => b.bobbin_no); // Remove empty rows

        if (!bobbins.length) {
          showError('No valid bobbin entries found in the Excel file');
          return;
        }

        setBulkBobbins(bobbins);
        setBulkResults([]);
        setFileLoaded(true);
        showSuccess(`Loaded ${bobbins.length} bobbin(s) from Excel`);
      } catch (err) {
        showError('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleBulkProcess = async () => {
    if (!bulkBobbins.length) { showError('No bobbins to process'); return; }
    setBulkProcessing(true);
    try {
      const payload = bulkBobbins.map(b => ({
        bobbin_no: b.bobbin_no,
        fid: b.fid,
        product_type: b.product_type,
        temp_grade: b.temp_grade,
      }));
      const res = await processBulkFinalGrade(payload);
      if (res?.success) {
        setBulkResults(res.data || []);
        const successCount = (res.data || []).filter(r => r.status === 'success').length;
        const alreadyCount = (res.data || []).filter(r => r.status === 'already_done').length;
        const errorCount = (res.data || []).filter(r => r.status === 'error').length;
        showSuccess(`Processed: ${successCount} success, ${alreadyCount} already done, ${errorCount} failed`);
      } else {
        showError(res?.message || 'Bulk processing failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Bulk processing failed');
    }
    setBulkProcessing(false);
  };

  const handleClearBulk = () => {
    setBulkBobbins([]);
    setBulkResults([]);
    setFileLoaded(false);
    setFileName('');
  };

  const handleClearScan = () => {
    setScanResults([]);
  };

  /* ── Counts for bulk results ── */
  const successCount = bulkResults.filter(r => r.status === 'success').length;
  const alreadyCount = bulkResults.filter(r => r.status === 'already_done').length;
  const errorCount = bulkResults.filter(r => r.status === 'error').length;

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">

      {/* ── Top Section: Scan + Import side by side ── */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3">

        {/* ── Single Scan Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Scan size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Single Bobbin Final Grade</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={scanRef}
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSingleScan(); } }}
              placeholder="Scan bobbin..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 font-bold text-indigo-700"
            />
            <button
              onClick={handleSingleScan}
              disabled={scanLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Award size={12} />
              {scanLoading ? '...' : 'Final Grade'}
            </button>
            {scanResults.length > 0 && (
              <button
                onClick={handleClearScan}
                className="flex items-center gap-1 px-2 py-2 text-slate-500 hover:text-red-600 transition-all"
                title="Clear results"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Bulk Import Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Bulk Final Grade (Excel Import)</span>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              <Upload size={12} />
              {fileName || 'Choose Excel File'}
            </button>
            {fileLoaded && (
              <>
                <span className="text-[10px] text-slate-500 font-medium">{bulkBobbins.length} bobbin(s)</span>
                <button
                  onClick={handleBulkProcess}
                  disabled={bulkProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 size={12} />
                  {bulkProcessing ? 'Processing...' : 'Process All'}
                </button>
                <button
                  onClick={handleClearBulk}
                  className="flex items-center gap-1 px-2 py-2 text-slate-500 hover:text-red-600 transition-all"
                  title="Clear"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Results Section ── */}
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">

        {/* ── Summary bar (if bulk results) ── */}
        {bulkResults.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Results Summary:</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 size={10} /> {successCount} Success
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700">
              <CheckCircle2 size={10} /> {alreadyCount} Already Done
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700">
              <XCircle size={10} /> {errorCount} Failed
            </span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="flex-1 overflow-auto">
          {(scanResults.length === 0 && bulkResults.length === 0 && !fileLoaded) ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Award size={32} className="opacity-40" />
                <span className="text-xs font-medium">Scan a bobbin or import an Excel file to assign Final Grade</span>
                <span className="text-[10px]">Use the exported Excel from D2 Batches tab for bulk processing</span>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider w-8">#</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Bobbin No</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">FID</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Product Type</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Temp Grade</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Final Grade</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Show bulk results if available, otherwise show loaded bobbins, otherwise scan results */}
                {bulkResults.length > 0 ? (
                  bulkResults.map((row, idx) => (
                    <tr key={`bulk-${idx}`} className={`transition-all ${
                      row.status === 'error' ? 'bg-red-50/40' :
                      row.status === 'success' ? 'bg-emerald-50/30' :
                      row.status === 'already_done' ? 'bg-blue-50/30' :
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}>
                      <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.fid || '—'}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.product_type || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {row.temp_grade ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">{row.temp_grade}</span>
                        ) : <span className="text-[9px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.final_grade ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">{row.final_grade}</span>
                        ) : <span className="text-[9px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-2 text-[10px] text-slate-600">{row.remark || ''}</td>
                    </tr>
                  ))
                ) : fileLoaded && bulkBobbins.length > 0 ? (
                  bulkBobbins.map((row, idx) => (
                    <tr key={`loaded-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.fid || '—'}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.product_type || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {row.temp_grade ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">{row.temp_grade}</span>
                        ) : <span className="text-[9px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center"><span className="text-[9px] text-slate-400">—</span></td>
                      <td className="px-3 py-2 text-center"><StatusBadge status="pending" /></td>
                      <td className="px-3 py-2 text-[10px] text-slate-400 italic">Waiting to process...</td>
                    </tr>
                  ))
                ) : (
                  scanResults.map((row, idx) => (
                    <tr key={`scan-${idx}`} className={`transition-all ${
                      row.status === 'error' ? 'bg-red-50/40' :
                      row.status === 'success' ? 'bg-emerald-50/30' :
                      row.status === 'already_done' ? 'bg-blue-50/30' :
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}>
                      <td className="px-3 py-2 text-[10px] text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] font-bold text-slate-800">{row.bobbin_no}</span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.fid || '—'}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-700">{row.product_type || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {row.temp_grade ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">{row.temp_grade}</span>
                        ) : <span className="text-[9px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.final_grade ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">{row.final_grade}</span>
                        ) : <span className="text-[9px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-2 text-[10px] text-slate-600">{row.remark || ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkFinalGrade;
