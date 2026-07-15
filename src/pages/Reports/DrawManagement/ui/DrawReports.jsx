import { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, Link2, GitBranch, Box, AlertTriangle, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import ReportFilters from '../components/ReportFilters';
import ReportTable from '../components/ReportTable';
import { showError } from '../../../../utils/toastService';
import {
  getDashboardSummary, exportDrawReport,
  getPreformAcceptReport, getHandleJoinReport, getPreformAllocReport, getDrawEntryReport,
  getFlawReport,
} from '../services/drawReport.api';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'preform_accept', label: 'Preform Accept', icon: ClipboardCheck },
  { key: 'handle_join', label: 'Handle Join', icon: Link2 },
  { key: 'preform_alloc', label: 'Allocation', icon: GitBranch },
  { key: 'draw_entry', label: 'Draw Entry', icon: Box },
  { key: 'flaws', label: 'Flaws', icon: AlertTriangle },
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
        case 'preform_accept': res = await getPreformAcceptReport(f); break;
        case 'handle_join': res = await getHandleJoinReport(f); break;
        case 'preform_alloc': res = await getPreformAllocReport(f); break;
        case 'draw_entry': res = await getDrawEntryReport(f); break;
        case 'flaws': res = await getFlawReport(f); break;
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
      case 'preform_accept': return [
        { key: 'preform_id', label: 'Preform ID' }, { key: 'preform_weight', label: 'Weight (kg)' },
        { key: 'charge_weight', label: 'Charge Wt' }, { key: 'preform_length', label: 'Preform Len' },
        { key: 'charge_length', label: 'Charge Len' }, { key: 'drawing_length', label: 'Drawing Len' },
        { key: 'material_code', label: 'Mat Code' }, { key: 'preform_type', label: 'Type' },
        { key: 'product_type', label: 'Product' }, { key: 'acceptance_status', label: 'Status' },
        { key: 'accepted_by', label: 'Accepted By' }, { key: 'entry_date', label: 'Date' },
      ];
      case 'handle_join': return [
        { key: 'preform_id', label: 'Preform ID' }, { key: 'handle_number', label: 'Handle No' },
        { key: 'handle_length', label: 'Handle Len' }, { key: 'handle_diameter', label: 'Handle Dia' },
        { key: 'cone_length', label: 'Cone Len' },
        { key: 'dia1', label: 'Dia1' }, { key: 'dia2', label: 'Dia2' }, { key: 'dia3', label: 'Dia3' },
        { key: 'dia4', label: 'Dia4' }, { key: 'dia5', label: 'Dia5' },
        { key: 'is_allocate', label: 'Allocated', render: v => v ? '✓' : '—' },
        { key: 'handle_rejected', label: 'Rejected', render: v => v ? 'Yes' : '—' },
        { key: 'entry_date', label: 'Date' },
      ];
      case 'preform_alloc': return [
        { key: 'preform_id', label: 'Preform ID' }, { key: 'allocation_date', label: 'Alloc Date' },
        { key: 'tower_no', label: 'Tower' }, { key: 'shift', label: 'Shift' },
        { key: 'operator', label: 'Operator' }, { key: 'preform_type', label: 'Preform Type' },
        { key: 'product_type', label: 'Product Type' }, { key: 'process_type', label: 'Process Type' },
        { key: 'preform_draw', label: 'Draw Done', render: v => v ? '✓' : '—' },
        { key: 'average_diameter', label: 'Avg Dia' },
        { key: 'draw_instruction', label: 'Instruction' }, { key: 'process_remarks', label: 'Remarks' },
      ];
      case 'draw_entry': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'spool_fid', label: 'Spool FID' },
        { key: 'preform_id', label: 'Preform' }, { key: 'tower_no', label: 'Tower' },
        { key: 'start_date', label: 'Start Date' }, { key: 'shift', label: 'Shift' },
        { key: 'drawn_length', label: 'Length (km)' }, { key: 'drawn_weight', label: 'Weight (kg)' },
        { key: 'balance_weight', label: 'Balance' }, { key: 'drawn_line_speed', label: 'Speed' },
        { key: 'indication_fiber_cut', label: 'Indication' }, { key: 'spool_status', label: 'Status' },
        { key: 'is_pt_allocate', label: 'PT', render: v => v ? '✓' : '—' },
        { key: 'shift_incharge', label: 'Incharge' },
      ];
      case 'flaws': return [
        { key: 'spool_id', label: 'Spool ID' }, { key: 'reason', label: 'Reason' },
        { key: 'pos1', label: 'Pos 1' }, { key: 'pos2', label: 'Pos 2' },
        { key: 'defect_length', label: 'Defect Length' }, { key: 'actual_cutting', label: 'Actual Cutting' },
        { key: 'entry_date', label: 'Date' },
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
          <ReportFilters onApply={handleApply} onReset={handleReset} onExport={activeTab !== 'dashboard' ? handleExport : null} loading={loading}
            hideFields={activeTab === 'dashboard' ? ['preform_id', 'spool_id'] : (activeTab === 'preform_accept' || activeTab === 'handle_join') ? ['tower_no', 'shift', 'preform_id', 'spool_id'] : activeTab === 'preform_alloc' ? ['spool_id'] : activeTab === 'flaws' ? ['tower_no', 'shift', 'preform_id'] : []} />
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
