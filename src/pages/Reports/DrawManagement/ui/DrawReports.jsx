import { useState, useEffect } from 'react';
import { BarChart3, Layers, Box, AlertTriangle, Zap, Users, Clock, GitBranch, Settings2, Trash2, LayoutDashboard } from 'lucide-react';
import StatCard from '../components/StatCard';
import ReportFilters from '../components/ReportFilters';
import ReportTable from '../components/ReportTable';
import { showError } from '../../../../utils/toastService';
import {
  getDashboardSummary, getProductionSummary, getPreformReport, getSpoolReport,
  getFlawReport, getBreakReport, getTowerPerformance, getShiftPerformance,
  getOperatorPerformance, getTraceability, getDrawParameters, getScrapAnalysis, exportDrawReport,
} from '../services/drawReport.api';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'production', label: 'Production', icon: BarChart3 },
  { key: 'preform', label: 'Preform', icon: Layers },
  { key: 'spool', label: 'Spool', icon: Box },
  { key: 'flaw', label: 'Flaws', icon: AlertTriangle },
  { key: 'break', label: 'Breaks', icon: Zap },
  { key: 'tower', label: 'Tower', icon: GitBranch },
  { key: 'shift', label: 'Shift', icon: Clock },
  { key: 'operator', label: 'Operator', icon: Users },
  { key: 'parameters', label: 'Parameters', icon: Settings2 },
  { key: 'scrap', label: 'Scrap', icon: Trash2 },
];

const DrawReports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [reportData, setReportData] = useState([]);

  const fetchDashboard = async (f = filters) => {
    setLoading(true);
    try {
      const res = await getDashboardSummary(f);
      if (res?.success) setDashboard(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchReport = async (tab, f = filters) => {
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'production': res = await getProductionSummary(f); break;
        case 'preform': res = await getPreformReport(f); break;
        case 'spool': res = await getSpoolReport(f); break;
        case 'flaw': res = await getFlawReport(f); break;
        case 'break': res = await getBreakReport(f); break;
        case 'tower': res = await getTowerPerformance(f); break;
        case 'shift': res = await getShiftPerformance(f); break;
        case 'operator': res = await getOperatorPerformance(f); break;
        case 'parameters': res = await getDrawParameters(f); break;
        case 'scrap': res = await getScrapAnalysis(f); break;
        default: res = null;
      }
      if (res?.success) setReportData(res.data || []);
      else setReportData([]);
    } catch (e) { showError('Failed to load report'); setReportData([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
    else fetchReport(activeTab);
  }, [activeTab]);

  const handleApply = (f) => {
    setFilters(f);
    if (activeTab === 'dashboard') fetchDashboard(f);
    else fetchReport(activeTab, f);
  };

  const handleReset = () => {
    setFilters({});
    if (activeTab === 'dashboard') fetchDashboard({});
    else fetchReport(activeTab, {});
  };

  const handleExport = async () => {
    try {
      const blob = await exportDrawReport(activeTab, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `draw_${activeTab}_report.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { showError('Export failed'); }
  };

  /* ── Column definitions per tab ── */
  const getColumns = () => {
    switch (activeTab) {
      case 'production': return [
        { key: 'date', label: 'Date' }, { key: 'total_preforms', label: 'Preforms' },
        { key: 'total_drawn_length', label: 'Drawn (km)' }, { key: 'total_drawn_weight', label: 'Weight (kg)' },
        { key: 'total_spools', label: 'Spools' }, { key: 'avg_spool_length', label: 'Avg Length' },
        { key: 'break_count', label: 'Breaks' }, { key: 'flaw_count', label: 'Flaws' },
        { key: 'total_scrap', label: 'Scrap' }, { key: 'yield_pct', label: 'Yield %', render: v => v ? `${v}%` : '—' },
      ];
      case 'preform': return [
        { key: 'preform_id', label: 'Preform ID' }, { key: 'material_code', label: 'Mat Code' },
        { key: 'preform_weight', label: 'Weight' }, { key: 'drawing_length', label: 'Expected' },
        { key: 'actual_length', label: 'Actual' }, { key: 'total_spools', label: 'Spools' },
        { key: 'total_breaks', label: 'Breaks' }, { key: 'total_flaws', label: 'Flaws' },
        { key: 'yield_pct', label: 'Yield %', render: v => v ? `${v}%` : '—' },
      ];
      case 'spool': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'spool_fid', label: 'FID' },
        { key: 'preform_id', label: 'Preform' }, { key: 'start_date', label: 'Date' },
        { key: 'tower_no', label: 'Tower' }, { key: 'shift', label: 'Shift' },
        { key: 'drawn_length', label: 'Length' }, { key: 'drawn_weight', label: 'Weight' },
        { key: 'spool_status', label: 'Status' }, { key: 'is_pt_allocate', label: 'PT', render: v => v ? '✓' : '—' },
      ];
      case 'flaw': return [
        { key: 'entry_date', label: 'Date' }, { key: 'spool_id', label: 'Spool' },
        { key: 'preform_id', label: 'Preform' }, { key: 'reason', label: 'Reason' },
        { key: 'pos1', label: 'From' }, { key: 'pos2', label: 'To' },
        { key: 'defect_length', label: 'Defect Len' }, { key: 'actual_cutting', label: 'Cutting' },
      ];
      case 'break': return [
        { key: 'fiber_id', label: 'Fiber ID' }, { key: 'machine_no', label: 'Machine' },
        { key: 'break_length', label: 'Break Len' }, { key: 'break_type', label: 'Type' },
        { key: 'break_category', label: 'Category' }, { key: 'main_break_type', label: 'Main Type' },
        { key: 'sub_reason', label: 'Sub Reason' }, { key: 'bsa_done_by', label: 'Analyst' },
        { key: 'created_at', label: 'Date', render: v => v ? v.split('T')[0] : '—' },
      ];
      case 'tower': return [
        { key: 'tower_no', label: 'Tower' }, { key: 'total_preforms', label: 'Preforms' },
        { key: 'total_drawn', label: 'Drawn (km)' }, { key: 'total_spools', label: 'Spools' },
        { key: 'breaks', label: 'Breaks' }, { key: 'flaws', label: 'Flaws' },
        { key: 'avg_speed', label: 'Avg Speed' }, { key: 'yield_pct', label: 'Yield %', render: v => v ? `${v}%` : '—' },
      ];
      case 'shift': return [
        { key: 'shift', label: 'Shift' }, { key: 'drawn_length', label: 'Drawn (km)' },
        { key: 'total_spools', label: 'Spools' }, { key: 'breaks', label: 'Breaks' },
        { key: 'flaws', label: 'Flaws' }, { key: 'yield_pct', label: 'Yield %', render: v => v ? `${v}%` : '—' },
      ];
      case 'operator': return [
        { key: 'operator', label: 'Operator' }, { key: 'tower_no', label: 'Tower' },
        { key: 'total_drawn', label: 'Drawn (km)' }, { key: 'total_spools', label: 'Spools' },
        { key: 'breaks', label: 'Breaks' }, { key: 'flaws', label: 'Flaws' },
        { key: 'yield_pct', label: 'Yield %', render: v => v ? `${v}%` : '—' },
      ];
      case 'parameters': return [
        { key: 'group_key', label: 'Group' }, { key: 'avg_speed', label: 'Avg Speed' },
        { key: 'avg_tension', label: 'Avg Tension' }, { key: 'avg_furnace_power', label: 'Furnace' },
        { key: 'avg_argon', label: 'Argon' }, { key: 'avg_he', label: 'Helium' },
        { key: 'avg_co2', label: 'CO₂' }, { key: 'avg_n2', label: 'N₂' },
        { key: 'avg_pri_pressure', label: 'Pri Press' }, { key: 'avg_sec_pressure', label: 'Sec Press' },
      ];
      case 'scrap': return [
        { key: 'group_key', label: 'Group' }, { key: 'top_scrap', label: 'Top Scrap' },
        { key: 'bottom_scrap', label: 'Bottom Scrap' }, { key: 'total_scrap', label: 'Total' },
        { key: 'scrap_pct', label: 'Scrap %', render: v => v ? `${v}%` : '—' },
      ];
      default: return [];
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab bar ── */}
        <div className="flex items-center border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 px-3 flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 mr-3">
            <BarChart3 size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">Draw Reports</span>
          </div>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1 px-2.5 py-2 text-[9px] font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === t.key ? 'border-blue-600 text-blue-700 bg-white/60' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                <Icon size={10} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <div className="px-3 py-1.5 flex-shrink-0">
          <ReportFilters onApply={handleApply} onReset={handleReset} onExport={activeTab !== 'dashboard' ? handleExport : null} loading={loading} hideFields={activeTab === 'dashboard' ? ['preform_id', 'spool_id'] : []} />
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden px-3 pb-2 flex flex-col gap-2 min-h-0">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-4 gap-3">
              <StatCard title="Total Drawn" value={dashboard?.total_drawn_length != null ? Number(dashboard.total_drawn_length).toFixed(1) : '—'} unit="km" color="blue" />
              <StatCard title="Total Preforms" value={dashboard?.total_preforms ?? '—'} color="emerald" />
              <StatCard title="Total Spools" value={dashboard?.total_spools ?? '—'} color="indigo" />
              <StatCard title="Avg Spool Length" value={dashboard?.avg_spool_length != null ? Number(dashboard.avg_spool_length).toFixed(1) : '—'} unit="km" color="cyan" />
              <StatCard title="Total Breaks" value={dashboard?.total_breaks ?? '—'} color="rose" />
              <StatCard title="Total Flaws" value={dashboard?.total_flaws ?? '—'} color="amber" />
              <StatCard title="Total Scrap" value={dashboard?.total_scrap != null ? Number(dashboard.total_scrap).toFixed(1) : '—'} unit="km" color="orange" />
              <StatCard title="Yield" value={dashboard?.yield_pct != null ? Number(dashboard.yield_pct).toFixed(1) : '—'} unit="%" color="purple" />
            </div>
          )}

          {/* Report Tables */}
          {activeTab !== 'dashboard' && (
            <ReportTable columns={getColumns()} data={reportData} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawReports;
