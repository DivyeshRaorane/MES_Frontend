import { useState, useEffect } from 'react';
import { Calendar, Search, Database, Clock, User, Hash, Layers, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getD2Batches, getD2BatchBobbinsForGrade } from '../services/d2_issue.api';
import { showError, showSuccess } from '../../../utils/toastService';

/* ── Helper: format date to YYYY-MM-DD ── */
const formatDate = (d) => d.toISOString().split('T')[0];

/* ── Helper: get date N days ago ── */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

const today = formatDate(new Date());

const D2Batches = () => {
  const [fromDate, setFromDate] = useState(daysAgo(15));
  const [toDate, setToDate] = useState(today);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(null); // holds batch_id being exported

  /* ── Fetch batches on mount ── */
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    if (!fromDate || !toDate) {
      showError('Please select both From and To dates');
      return;
    }
    if (fromDate > toDate) {
      showError('From date cannot be after To date');
      return;
    }
    setLoading(true);
    try {
      const res = await getD2Batches(fromDate, toDate);
      if (res?.success) {
        setBatches(res.data || []);
      } else {
        showError(res?.message || 'Failed to fetch batches');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to fetch D2 batches');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchBatches();
  };

  /* ── Excel Export for Final Grade ── */
  const handleExportGrade = async (batch, e) => {
    e.stopPropagation();
    const batchId = batch.d2_batch_id;
    setExporting(batchId);
    try {
      const res = await getD2BatchBobbinsForGrade(batchId);
      if (!res?.success) {
        showError(res?.message || 'Failed to fetch bobbins for export');
        setExporting(null);
        return;
      }
      const bobbins = res.data || [];
      if (bobbins.length === 0) {
        showError('No bobbins pending final grade for this batch');
        setExporting(null);
        return;
      }

      // Build Excel data
      const headers = ['Bobbin No', 'FID', 'Product Type', 'Temp Grade'];
      const rows = bobbins.map((b) => [
        b.bobbin_no || '',
        b.fid || '',
        b.product_type || '',
        b.temp_grade || '',
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        { wch: 14 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Final Grade');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `D2_FinalGrade_${batchId}.xlsx`);
      showSuccess(`Exported ${bobbins.length} bobbin(s) for batch ${batchId}`);
    } catch (e) {
      showError(e?.response?.data?.message || 'Export failed');
    }
    setExporting(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">

      {/* ── Filter Section ── */}
      <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Date Range</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold text-slate-500">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold text-slate-500">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
          >
            <Search size={12} />
            Search
          </button>

          {/* Quick filter buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[9px] text-slate-400 font-medium">Quick:</span>
            <button
              onClick={() => { setFromDate(daysAgo(7)); setToDate(today); }}
              className="px-2 py-1 text-[9px] font-bold bg-slate-100 text-slate-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              7 Days
            </button>
            <button
              onClick={() => { setFromDate(daysAgo(15)); setToDate(today); }}
              className="px-2 py-1 text-[9px] font-bold bg-slate-100 text-slate-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              15 Days
            </button>
            <button
              onClick={() => { setFromDate(daysAgo(30)); setToDate(today); }}
              className="px-2 py-1 text-[9px] font-bold bg-slate-100 text-slate-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Section ── */}
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading batches...</span>
            </div>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Database size={32} className="opacity-40" />
              <span className="text-xs font-medium">No D2 batches found for selected date range</span>
              <span className="text-[10px]">Try adjusting the date filters above</span>
            </div>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            {/* ── Table ── */}
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Hash size={10} />
                      Batch ID
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Layers size={10} />
                      Chamber
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} />
                      Start Date
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} />
                      End Date
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} />
                      Process Hrs
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <User size={10} />
                      Start Op.
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <User size={10} />
                      End Op.
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Bobbins
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    D2 Type
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    H2
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Export
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch, idx) => (
                  <tr
                    key={`${batch.d2_batch_id}-${idx}`}
                    className={`transition-all ${
                      idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 hover:bg-slate-100/60'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {batch.d2_batch_id}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        {batch.chamber}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-700">
                      {batch.d2_start_date || '—'}
                      {batch.d2_start_time && <span className="text-slate-400 ml-1">{batch.d2_start_time}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-700">
                      {batch.d2_end_date || '—'}
                      {batch.d2_end_time && <span className="text-slate-400 ml-1">{batch.d2_end_time}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-600 font-medium">
                      {batch.process_hours || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-700">
                      {batch.start_operator || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-700">
                      {batch.end_operator || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-1.5">
                        {batch.bobbin_count || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        batch.d2_type === 'restricted'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {batch.d2_type || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {batch.is_h2 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700">Yes</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => handleExportGrade(batch, e)}
                        disabled={exporting === batch.d2_batch_id}
                        title="Export bobbins pending final grade"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all disabled:opacity-50"
                      >
                        <Download size={10} />
                        {exporting === batch.d2_batch_id ? '...' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Summary bar ── */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-700">{batches.length}</span> batch(es) from {fromDate} to {toDate}
              </span>
              <span className="text-[10px] text-slate-400">
                Only batches with completed D2 end date are shown
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default D2Batches;
