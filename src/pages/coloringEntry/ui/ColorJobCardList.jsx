import { useState, useEffect, Fragment } from 'react';
import { ChevronDown, ChevronRight, RefreshCw, ClipboardList, Download } from 'lucide-react';
import { getColorJobCards, getColorJobCardBobbins } from '../services/coloring.api';
import { showError, showSuccess } from '../../../utils/toastService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/* ══════════════════════════════════════════════════════════
   COLOR JOB CARD LIST
   Shows per-job-card progress with expandable bobbin rows
   ══════════════════════════════════════════════════════════ */
const ColorJobCardList = () => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null); // col_jcard_no
  const [bobbins, setBobbins] = useState([]);
  const [bobbinLoading, setBobbinLoading] = useState(false);

  const fetchJobCards = async () => {
    setLoading(true);
    try {
      const res = await getColorJobCards();
      if (res?.success) setJobCards(res.data || []);
      else showError(res?.message || 'Failed to load job cards');
    } catch (e) { showError(e?.response?.data?.message || 'Failed to load job cards'); }
    setLoading(false);
  };

  useEffect(() => { fetchJobCards(); }, []);

  const handleRowClick = async (col_jcard_no) => {
    if (expandedCard === col_jcard_no) { setExpandedCard(null); setBobbins([]); return; }
    setExpandedCard(col_jcard_no);
    setBobbinLoading(true);
    try {
      const res = await getColorJobCardBobbins(col_jcard_no);
      if (res?.success) setBobbins(res.data || []);
      else { showError(res?.message || 'Failed to load bobbins'); setBobbins([]); }
    } catch (e) { showError(e?.response?.data?.message || 'Failed to load bobbins'); setBobbins([]); }
    setBobbinLoading(false);
  };

  /* Export bobbins for a job card to Excel */
  const handleExportExcel = async (e, col_jcard_no) => {
    e.stopPropagation(); // prevent row expand/collapse
    try {
      const res = await getColorJobCardBobbins(col_jcard_no);
      if (!res?.success || !res.data?.length) {
        showError('No bobbin data available to export');
        return;
      }
      const bobbinData = res.data;
      const headers = ['#', 'Bobbin No', 'Bobbin FID', 'Current Color', 'Require Color', 'Total Length', 'Balance Length', 'Status'];
      const rows = bobbinData.map((b, i) => [
        i + 1,
        b.bobbin_no || '',
        b.bobbin_fid || '',
        b.current_color || '',
        b.require_color || '',
        b.total_length || '',
        b.balance_length ?? b.total_length ?? '',
        b.is_done ? 'Done' : 'Pending',
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 14) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bobbins');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${col_jcard_no}_Bobbins.xlsx`);
      showSuccess('Excel exported successfully');
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to export Excel');
    }
  };

  /* Progress bar renderer */
  const ProgressBar = ({ total, completed }) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = pct === 100;
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-[9px] font-bold min-w-[36px] text-right ${isComplete ? 'text-emerald-700' : 'text-rose-700'}`}>
          {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <ClipboardList size={14} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Color Job Cards</h2>
            <p className="text-[9px] text-slate-400">Click a row to see bobbin details</p>
          </div>
        </div>
        <button type="button" onClick={fetchJobCards} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 transition-all disabled:opacity-50">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        {loading && jobCards.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-400">Loading job cards...</p>
          </div>
        ) : jobCards.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-400">No job cards found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase w-8"></th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Job Card No</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-center">Total Bobbins</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-center">Completed</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-center">Pending</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase w-48">Progress</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Status</th>
                <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-center">Export</th>
              </tr>
            </thead>
            <tbody>
              {jobCards.map((jc) => {
                const isExpanded = expandedCard === jc.col_jcard_no;
                const isComplete = jc.completed === jc.total;
                return (
                  <Fragment key={jc.col_jcard_no}>
                    <tr
                      onClick={() => handleRowClick(jc.col_jcard_no)}
                      className={`border-b cursor-pointer transition-all ${
                        isExpanded ? 'bg-indigo-50/60 border-indigo-200' : 'border-slate-100 hover:bg-blue-50/30'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-slate-400">
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-bold text-indigo-700 font-mono">{jc.col_jcard_no}</td>
                      <td className="px-3 py-2.5 text-xs font-bold text-slate-700 text-center">{jc.total}</td>
                      <td className="px-3 py-2.5 text-xs font-bold text-emerald-700 text-center">{jc.completed}</td>
                      <td className="px-3 py-2.5 text-xs font-bold text-rose-700 text-center">{jc.pending}</td>
                      <td className="px-3 py-2.5">
                        <ProgressBar total={jc.total} completed={jc.completed} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isComplete ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleExportExcel(e, jc.col_jcard_no)}
                          title="Export bobbins to Excel"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-md border border-emerald-200 transition-all"
                        >
                          <Download size={10} /> Excel
                        </button>
                      </td>
                    </tr>

                    {/* Expanded bobbin detail */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-slate-50 border-b border-indigo-200 px-6 py-3">
                            {bobbinLoading ? (
                              <p className="text-[10px] text-slate-400 py-2">Loading bobbins...</p>
                            ) : bobbins.length === 0 ? (
                              <p className="text-[10px] text-slate-400 py-2">No bobbins found</p>
                            ) : (
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200">
                                    {['#', 'Bobbin No', 'Bobbin FID', 'Current Color', 'Require Color', 'Total Length', 'Balance Length', 'Status'].map(h => (
                                      <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {bobbins.map((b, i) => (
                                    <tr key={b.fg_color_id || i} className="border-b border-slate-100 hover:bg-white/60">
                                      <td className="px-2 py-1.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                                      <td className="px-2 py-1.5 text-[9px] font-mono font-bold text-blue-700">{b.bobbin_no}</td>
                                      <td className="px-2 py-1.5 text-[9px] font-mono text-slate-600">{b.bobbin_fid || '—'}</td>
                                      <td className="px-2 py-1.5 text-[9px] text-slate-600">{b.current_color || '—'}</td>
                                      <td className="px-2 py-1.5 text-[9px] font-bold text-indigo-700">{b.require_color || '—'}</td>
                                      <td className="px-2 py-1.5 text-[9px] font-mono text-slate-600">{b.total_length || '—'}</td>
                                      <td className="px-2 py-1.5 text-[9px] font-mono text-slate-600">{b.balance_length ?? b.total_length ?? '—'}</td>
                                      <td className="px-2 py-1.5">
                                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                          b.is_done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                          {b.is_done ? 'Done' : 'Pending'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ColorJobCardList;
