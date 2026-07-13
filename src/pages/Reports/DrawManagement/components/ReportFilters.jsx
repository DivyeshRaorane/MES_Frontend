import { useState } from 'react';
import { Filter, RotateCcw, Download, Search } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

const ReportFilters = ({ onApply, onReset, onExport, loading = false, hideFields = [] }) => {
  const [filters, setFilters] = useState({
    date_from: weekAgo,
    date_to: today,
    tower_no: '',
    shift: '',
    operator: '',
    preform_type: '',
    product_type: '',
    preform_id: '',
    spool_id: '',
  });

  const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleApply = () => {
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
    onApply(cleaned);
  };

  const handleReset = () => {
    const defaultFilters = { date_from: weekAgo, date_to: today, tower_no: '', shift: '', operator: '', preform_type: '', product_type: '', preform_id: '', spool_id: '' };
    setFilters(defaultFilters);
    onReset();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap flex-shrink-0">
      <Filter size={12} className="text-slate-500" />
      <input type="date" value={filters.date_from} onChange={e => handleChange('date_from', e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 w-28" />
      <span className="text-[9px] text-slate-400">to</span>
      <input type="date" value={filters.date_to} onChange={e => handleChange('date_to', e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 w-28" />
      <select value={filters.tower_no} onChange={e => handleChange('tower_no', e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-20">
        <option value="">Tower</option>
        {[1, 2, 3, 4].map(t => <option key={t} value={t}>DT{t}</option>)}
      </select>
      <select value={filters.shift} onChange={e => handleChange('shift', e.target.value)}
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-20">
        <option value="">Shift</option>
        {['Morning', 'Evening', 'Night'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <input value={filters.preform_id} onChange={e => handleChange('preform_id', e.target.value)} placeholder="Preform ID"
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-24" style={{ display: hideFields.includes('preform_id') ? 'none' : undefined }} />
      <input value={filters.spool_id} onChange={e => handleChange('spool_id', e.target.value)} placeholder="Spool ID"
        className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-24" style={{ display: hideFields.includes('spool_id') ? 'none' : undefined }} />
      <button onClick={handleApply} disabled={loading}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 disabled:opacity-50">
        <Search size={10} /> Apply
      </button>
      <button onClick={handleReset}
        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-200">
        <RotateCcw size={10} /> Reset
      </button>
      {onExport && (
        <button onClick={onExport} disabled={loading}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700 disabled:opacity-50 ml-auto">
          <Download size={10} /> Excel
        </button>
      )}
    </div>
  );
};

export default ReportFilters;
