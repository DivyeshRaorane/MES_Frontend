import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, Zap } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getAatEntries } from '../services/aatEntryService';
import AATForm from './AATForm';
import AATView from './AATView';

const today = new Date().toISOString().split('T')[0];
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

const AATList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.bobbin_no = search;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      const res = await getAatEntries(filters);
      if (res?.success) setEntries(res.data || []);
    } catch (e) { showError('Failed to load entries'); }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  if (viewId) return <AATView entryId={viewId} onBack={() => setViewId(null)} />;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Accelerated Aging Entries</span>
            <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{entries.length}</span>
          </div>
          <button onClick={() => { setEditId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-all shadow-sm">
            <Plus size={12} /> New Entry
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Bobbin No..."
            onKeyDown={e => e.key === 'Enter' && fetchEntries()}
            className="border border-slate-200 rounded px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-amber-300 w-40" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-slate-200 rounded px-2 py-1.5 text-[10px] outline-none w-28" />
          <span className="text-[9px] text-slate-400">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-slate-200 rounded px-2 py-1.5 text-[10px] outline-none w-28" />
          <button onClick={fetchEntries} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-[9px] font-bold rounded hover:bg-amber-700">
            <Search size={10} /> Search
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">Loading...</span></div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">No entries found</span></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 text-white z-10">
                <tr>{['#', 'Bobbin No', 'Fiber Length', 'Temperature', 'Tested By', 'Checked By', 'Start Date', 'End Date', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e, i) => (
                  <tr key={e.aat_entry_id} className="hover:bg-amber-50/30">
                    <td className="px-3 py-2 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-amber-700">{e.bobbin_no || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono">{e.fiber_length || '—'}</td>
                    <td className="px-3 py-2 text-[10px] text-slate-600">{e.temp ? `${e.temp}°C` : '—'}</td>
                    <td className="px-3 py-2 text-[10px] text-slate-600">{e.tested_by || '—'}</td>
                    <td className="px-3 py-2 text-[10px] text-slate-600">{e.checked_by || '—'}</td>
                    <td className="px-3 py-2 text-[9px] text-slate-500">{e.start_date?.split('T')[0] || '—'}</td>
                    <td className="px-3 py-2 text-[9px] text-slate-500">{e.end_date?.split('T')[0] || '—'}</td>
                    <td className="px-3 py-2 text-[9px] text-slate-400">{e.created_at?.split('T')[0] || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(e.aat_entry_id); setShowForm(true); }} className="px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold rounded hover:bg-blue-100"><Edit2 size={9} className="inline mr-0.5" />Edit</button>
                        <button onClick={() => setViewId(e.aat_entry_id)} className="px-2 py-1 bg-amber-50 text-amber-700 text-[8px] font-bold rounded hover:bg-amber-100"><Eye size={9} className="inline mr-0.5" />View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showForm && <AATForm entryId={editId} onClose={() => { setShowForm(false); setEditId(null); fetchEntries(); }} />}
    </div>
  );
};

export default AATList;
