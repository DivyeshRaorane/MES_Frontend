import { useState, useEffect } from 'react';
import { CheckCircle2, Search, Filter, RotateCcw, Download } from 'lucide-react';
import { showError } from '../../../../utils/toastService';
import { getQualityEntryReport, exportQualityReport } from '../services/qualityReport.api';

const today = new Date().toISOString().split('T')[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

const TABS = [
  { key: 'quality_entry', label: 'Quality Entry' },
];

const QualityReports = () => {
  const [activeTab, setActiveTab] = useState('quality_entry');
  const [filters, setFilters] = useState({ date_from: weekAgo, date_to: today, bobbin_no: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (f = filters) => {
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(f).filter(([_, v]) => v));
      let res;
      switch (activeTab) {
        case 'quality_entry': res = await getQualityEntryReport(cleaned); break;
        default: res = null;
      }
      if (res?.success) setData(res.data || []);
      else setData([]);
    } catch (e) { showError('Failed to load report'); setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [activeTab]);

  const handleApply = () => fetchReport();
  const handleReset = () => { setFilters({ date_from: weekAgo, date_to: today, bobbin_no: '' }); fetchReport({ date_from: weekAgo, date_to: today }); };

  const handleExport = async () => {
    try {
      const cleaned = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const blob = await exportQualityReport(activeTab, cleaned);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `quality_${activeTab}_report.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { showError('Export failed'); }
  };

  const columns = [
    { key: 'bobbin_no', label: 'Bobbin No' },
    { key: 'bobbin_fid', label: 'FID' },
    { key: 'product_type', label: 'Product Type' },
    { key: 'temp_grade', label: 'Temp Grade' },
    { key: 'final_grade', label: 'Final Grade' },
    { key: 'avg_lsa_atn_1310', label: 'Avg 1310' },
    { key: 'avg_lsa_atn_1550', label: 'Avg 1550' },
    { key: 'avg_lsa_atn_1625', label: 'Avg 1625' },
    { key: 'mfd_1310_top', label: 'MFD 1310 T' },
    { key: 'mfd_1550_top', label: 'MFD 1550 T' },
    { key: 'cut_off_top', label: 'Cut Off T' },
    { key: 'cable_cut_off', label: 'Cable Cut' },
    { key: 'mac_value', label: 'MAC' },
    { key: 'clad_dia_top', label: 'Clad Dia T' },
    { key: 'pmd_1310', label: 'PMD 1310' },
    { key: 'pmd_1550', label: 'PMD 1550' },
    { key: 'remark', label: 'Remark' },
  ];

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/30 px-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 mr-3">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">Quality Reports</span>
          </div>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.key ? 'border-emerald-600 text-emerald-700 bg-white/60' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0 border-b border-slate-100">
          <Filter size={12} className="text-slate-500" />
          <input type="date" value={filters.date_from} onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-emerald-300 w-28" />
          <span className="text-[9px] text-slate-400">to</span>
          <input type="date" value={filters.date_to} onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-emerald-300 w-28" />
          <input value={filters.bobbin_no} onChange={e => setFilters(p => ({ ...p, bobbin_no: e.target.value }))} placeholder="Bobbin No"
            className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none w-28" />
          <button onClick={handleApply} disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700 disabled:opacity-50">
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
            <table className="w-full text-left border-collapse" style={{ minWidth: '1200px' }}>
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
                  <tr key={idx} className="hover:bg-emerald-50/30">
                    <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">{idx + 1}</td>
                    {columns.map((col, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-[10px] text-slate-700 whitespace-nowrap">
                        {row[col.key] ?? '—'}
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

export default QualityReports;
