import { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Download, Loader2 } from 'lucide-react';
import { getPendingQCOut } from '../services/qc_out.api';
import { showError } from '../../../utils/toastService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const today = new Date().toISOString().split('T')[0];

const PendingQCOut = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async (from, to) => {
    setLoading(true);
    try {
      const res = await getPendingQCOut(from, to);
      if (res?.success) {
        setRows(res.data || []);
      } else {
        showError(res?.message || 'Failed to fetch pending QC Out data');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData('', '');
  }, []);

  const handleSearch = () => {
    fetchData(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    fetchData('', '');
  };

  const handleExport = () => {
    if (!rows.length) {
      showError('No data to export');
      return;
    }

    const exportData = rows.map((row, idx) => ({
      'Sr No': idx + 1,
      'Bobbin No': row.bobbin_no,
      'FID': row.bobbin_fid || '',
      'Product Type': row.product_type || '',
      'Final Grade': row.final_grade || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pending QC Out');

    /* Auto-fit column widths */
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(key.length, ...exportData.map(r => String(r[key] || '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(blob, `Pending_QC_Out_${today}.xlsx`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
      {/* ── Filter bar ── */}
      <div className="flex items-end gap-3 px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg flex-shrink-0">
        <div className="flex flex-col">
          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 mb-0.5">From Date (PT Date)</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 mb-0.5">To Date (PT Date)</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]"
        >
          <Search size={10} /> Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded uppercase hover:bg-slate-300 transition-all h-[28px]"
        >
          Reset
        </button>
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase hover:bg-emerald-700 transition-all h-[28px]"
          >
            <Download size={10} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
          <ClipboardCheck size={12} className="text-orange-600" />
          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Pending QC Out Bobbins</span>
          {rows.length > 0 && (
            <span className="text-[8px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{rows.length}</span>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-slate-400" />
            <span className="ml-2 text-xs text-slate-400">Loading...</span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200">
                  {['#', 'Bobbin No', 'FID', 'Product Type', 'Final Grade'].map(h => (
                    <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[10px] text-slate-400">
                      No pending QC Out bobbins found
                    </td>
                  </tr>
                ) : rows.map((row, idx) => (
                  <tr key={row.bobbin_no || idx} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-3 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                    <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_no}</td>
                    <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                    <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.product_type || '—'}</td>
                    <td className="px-3 py-1.5 border-r border-slate-100">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{row.final_grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingQCOut;
