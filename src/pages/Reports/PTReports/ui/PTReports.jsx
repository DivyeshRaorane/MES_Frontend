import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RotateCcw, Download } from 'lucide-react';
import { showError } from '../../../../utils/toastService';
import { getPtAllocationReport, getPtEntryReport, getPtFlawsReport, getFiberEntryReport, getColoringReport, getRewindingReport, exportPtReport } from '../services/ptReport.api';

const today = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

const TABS = [
  { key: 'allocation', label: 'PT Allocation' },
  { key: 'pt_entry', label: 'PT Entry' },
  { key: 'pt_flaws', label: 'PT Flaws' },
  { key: 'fiber_entry', label: 'Fiber Entry' },
  { key: 'coloring', label: 'Coloring Entry' },
  { key: 'rewinding', label: 'Rewinding Entry' },
];

const PTReports = () => {
  const [activeTab, setActiveTab] = useState('allocation');
  const [filters, setFilters] = useState({ date_from: weekAgo, date_to: today, spool_id: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (f = filters) => {
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(f).filter(([_, v]) => v));
      let res;
      switch (activeTab) {
        case 'allocation': res = await getPtAllocationReport(cleaned); break;
        case 'pt_entry': res = await getPtEntryReport(cleaned); break;
        case 'pt_flaws': res = await getPtFlawsReport(cleaned); break;
        case 'fiber_entry': res = await getFiberEntryReport(cleaned); break;
        case 'coloring': res = await getColoringReport(cleaned); break;
        case 'rewinding': res = await getRewindingReport(cleaned); break;
        default: res = null;
      }
      if (res?.success) setData(res.data || []);
      else setData([]);
    } catch (e) { showError('Failed to load report'); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [activeTab]);

  const handleApply = () => fetchReport();
  const handleReset = () => { setFilters({ date_from: weekAgo, date_to: today, spool_id: '' }); fetchReport({ date_from: weekAgo, date_to: today }); };

  const handleExport = async () => {
    try {
      const cleaned = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const blob = await exportPtReport(activeTab, cleaned);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `pt_${activeTab}_report.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { showError('Export failed'); }
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'allocation': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'preform_id', label: 'Preform' },
        { key: 'allocation_date', label: 'Alloc Date', render: v => v?.split('T')[0] || '—' },
        { key: 'tower_no', label: 'Tower' }, { key: 'drawn_length', label: 'Drawn Length' },
        { key: 'product_type', label: 'Product' }, { key: 'pt_strain', label: 'PT Strain' },
        { key: 'pt_machine_no', label: 'Machine' }, { key: 'allocated_by', label: 'Allocated By' },
        { key: 'shift_incharge', label: 'Shift Incharge' },
        { key: 'is_pt_complete', label: 'Complete', render: v => v ? '✓' : '—' },
        { key: 'is_reject', label: 'Rejected', render: v => v ? 'Yes' : '—' },
      ];
      case 'pt_entry': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'fid', label: 'FID' },
        { key: 'bobbin_no', label: 'Bobbin No' }, { key: 'preform_id', label: 'Preform' },
        { key: 'tower_no', label: 'Tower' }, { key: 'pt_machine', label: 'Machine' },
        { key: 'pt_length', label: 'PT Length' }, { key: 'operator_name', label: 'Operator' },
        { key: 'shift_incharge', label: 'Incharge' }, { key: 'bobbin_color', label: 'Color' },
        { key: 'status', label: 'Status' },
        { key: 'active_rejection_type', label: 'Rejection', render: v => v || '—' },
        { key: 'is_break', label: 'Break', render: v => v ? 'Yes' : '—' },
        { key: 'created_at', label: 'Date', render: v => v?.split('T')[0] || '—' },
      ];
      case 'pt_flaws': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'reason', label: 'Reason' },
        { key: 'pos1', label: 'Pos 1' }, { key: 'pos2', label: 'Pos 2' },
        { key: 'defect_length', label: 'Defect Length' }, { key: 'actual_cutting', label: 'Actual Cutting' },
        { key: 'is_done', label: 'Done', render: v => v ? '✓' : '—' },
        { key: 'entry_date', label: 'Date' },
      ];
      case 'fiber_entry': return [
        { key: 'bobbin_no', label: 'Bobbin No' }, { key: 'fid', label: 'FID' },
        { key: 'spool_id', label: 'Spool ID' }, { key: 'preform_id', label: 'Preform' },
        { key: 'tower_no', label: 'Tower' }, { key: 'pt_machine_no', label: 'PT Machine' },
        { key: 'fiber_length', label: 'Fiber Len' }, { key: 'fiber_color', label: 'Color' },
        { key: 'product_type', label: 'Product' }, { key: 'pt_strain', label: 'PT Strain' },
        { key: 'temp_grade', label: 'Temp Grade' }, { key: 'final_grade', label: 'Final Grade' },
        { key: 'is_qc_out', label: 'QC Out', render: v => v ? '✓' : '—' },
        { key: 'dispatch_status', label: 'Dispatch' },
        { key: 'created_at', label: 'Date', render: v => v?.split('T')[0] || '—' },
      ];
      case 'coloring': return [
        { key: 'bobbin_no', label: 'Bobbin No' }, { key: 'fid', label: 'FID' },
        { key: 'original_color', label: 'Original Color' }, { key: 'current_color', label: 'Current Color' },
        { key: 'color_batch_code', label: 'Batch Code' }, { key: 'fiber_length', label: 'Length' },
        { key: 'machine_no', label: 'Machine' }, { key: 'operator', label: 'Operator' },
        { key: 'bobbin_type', label: 'Bobbin Type' }, { key: 'is_scrap', label: 'Scrap', render: v => v ? 'Yes' : '—' },
        { key: 'die_change', label: 'Die Change' },
        { key: 'entry_date', label: 'Date' },
      ];
      case 'rewinding': return [
        { key: 'bobbin_no', label: 'Bobbin No' }, { key: 'parent_bobbin_no', label: 'Parent Bobbin' },
        { key: 'fid', label: 'FID' }, { key: 'fiber_length', label: 'Length' },
        { key: 'machine_no', label: 'Machine' }, { key: 'rew_reason', label: 'Reason' },
        { key: 'rew_type', label: 'Type' }, { key: 'is_scrap', label: 'Scrap', render: v => v ? 'Yes' : '—' },
        { key: 'bobbin_type', label: 'Bobbin Type' }, { key: 'operator', label: 'Operator' },
        { key: 'bobbin_colour', label: 'Color' }, { key: 'entry_date', label: 'Date' },
      ];
      default: return [];
    }
  };

  const columns = getColumns();

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50/30 px-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 mr-3">
            <ShieldCheck size={14} className="text-purple-600" />
            <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">PT Reports</span>
          </div>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.key ? 'border-purple-600 text-purple-700 bg-white/60' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0 border-b border-slate-100">
          <Filter size={12} className="text-slate-500" />
          <input type="date" value={filters.date_from} onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-purple-300 w-28" />
          <span className="text-[9px] text-slate-400">to</span>
          <input type="date" value={filters.date_to} onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-purple-300 w-28" />
          <input value={filters.spool_id} onChange={e => setFilters(p => ({ ...p, spool_id: e.target.value }))} placeholder="Spool ID"
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-28" />
          <button onClick={handleApply} disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-[9px] font-bold rounded hover:bg-purple-700 disabled:opacity-50">
            <Search size={10} /> Apply
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-200">
            <RotateCcw size={10} /> Reset
          </button>
          <button onClick={handleExport} disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700 disabled:opacity-50 ml-auto">
            <Download size={10} /> Excel
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">Loading...</span></div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">No data available</span></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 text-white z-10">
                <tr>
                  <th className="px-3 py-2 text-[9px] font-bold uppercase">#</th>
                  {columns.map((col, i) => (
                    <th key={i} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30">
                    <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">{idx + 1}</td>
                    {columns.map((col, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-[10px] text-slate-700 whitespace-nowrap">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PTReports;
