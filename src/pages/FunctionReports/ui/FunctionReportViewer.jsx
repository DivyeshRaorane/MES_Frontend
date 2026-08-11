/**
 * Function Report Viewer — User-facing
 * 
 * Displays registered function reports the current user can access.
 * Detects required parameters, shows input form, executes the function,
 * and renders the result as a table.
 * 
 * When accessed via /dynamicreports/function/:reportId, it auto-loads
 * that specific report directly into execution mode.
 */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileBarChart2, Search, Play, Loader2, ArrowLeft,
  Download, RefreshCw, Filter, Table2, X,
} from 'lucide-react';
import {
  getUserFunctionReports,
  runFunctionReport,
  setActiveReport,
  clearReportResult,
} from '../controller/functionReports.slice';
import { exportFunctionReportExcel, exportFunctionReportCSV, fetchFunctionReportById } from '../services/functionReports.api';
import { showError, showSuccess } from '../../../utils/toastService';

/* ══════════════════════════════════════════════════════════
   REPORT LIST VIEW
   ══════════════════════════════════════════════════════════ */
const FunctionReportViewer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reportId } = useParams();
  const {
    userReports, activeReport, reportResult, resultColumns,
    totalRows, executionTime, loading, error,
  } = useSelector(state => state.functionReports);

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    dispatch(getUserFunctionReports());
  }, [dispatch]);

  // If accessed via route param (e.g., /dynamicreports/function/:reportId),
  // auto-load that report into active state
  useEffect(() => {
    if (!reportId) return;
    // Try to find it in already-loaded userReports
    const found = userReports.find(r => String(r.id) === String(reportId));
    if (found) {
      dispatch(setActiveReport(found));
    } else if (!activeReport || String(activeReport.id) !== String(reportId)) {
      // Fetch directly from API
      setDirectLoading(true);
      fetchFunctionReportById(reportId)
        .then(res => {
          const report = res?.data || res;
          if (report && report.id) {
            // Parse param_config if it comes as a JSON string
            let config = report.param_config;
            if (typeof config === 'string') {
              try { config = JSON.parse(config); } catch { config = []; }
            }
            if (!Array.isArray(config)) config = [];
            config = config.map(p => {
              let opts = p.dropdown_options;
              if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch { opts = []; }
              }
              return { ...p, dropdown_options: opts };
            });
            dispatch(setActiveReport({ ...report, param_config: config }));
          }
        })
        .catch(() => {})
        .finally(() => setDirectLoading(false));
    }
  }, [reportId, userReports]);

  const reports = Array.isArray(userReports) ? userReports : [];
  const sections = [...new Set(reports.map(r => r.section).filter(Boolean))];

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.report_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchSection = !sectionFilter || r.section === sectionFilter;
    return matchSearch && matchSection;
  });

  const handleOpenReport = (report) => {
    dispatch(setActiveReport(report));
  };

  const handleBack = () => {
    dispatch(setActiveReport(null));
    dispatch(clearReportResult());
    // If accessed via direct route, go back to previous page
    if (reportId) {
      navigate(-1);
    }
  };

  // If a report is active, show the execution panel
  if (activeReport) {
    return <ReportExecutionPanel report={activeReport} onBack={handleBack} />;
  }

  // If loading a direct-linked report
  if (directLoading || (reportId && !activeReport)) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 size={20} className="text-violet-500 animate-spin" />
        <span className="ml-3 text-sm text-slate-500">Loading report...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-violet-50 via-white to-indigo-50 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileBarChart2 size={18} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Function Reports</h1>
              <p className="text-[10px] text-slate-500">{reports.length} reports available</p>
            </div>
          </div>
          <button type="button" onClick={() => dispatch(getUserFunctionReports())}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <RefreshCw size={10} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>
          {sections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-slate-400" />
              <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none appearance-none cursor-pointer">
                <option value="">All Sections</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading.userList ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={18} className="text-violet-500 animate-spin" />
            <span className="text-xs text-slate-400">Loading reports...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileBarChart2 size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No reports found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(report => (
              <button key={report.id} type="button" onClick={() => handleOpenReport(report)}
                className="text-left p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-violet-200 hover:bg-violet-50/20 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Table2 size={16} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-700 truncate">{report.report_name}</h3>
                    {report.description && (
                      <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{report.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {report.section || 'General'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {report.schema_name}.{report.function_name}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   REPORT EXECUTION PANEL
   Shows parameter inputs, executes function, displays results
   ══════════════════════════════════════════════════════════ */

/**
 * Normalizes default values from the report registration.
 * Values like "NULL::date", "NULL::varchar", "—", etc. are treated as empty
 * so the UI starts with blank inputs instead of passing invalid strings to the API.
 */
const normalizeDefaultValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === '—' ||
    value === 'NULL' ||
    value === 'null' ||
    value === 'NULL::date' ||
    value === 'NULL::varchar' ||
    value === 'NULL::character varying'
  ) {
    return '';
  }
  return value;
};

/**
 * Normalizes a parameter value before sending to the API.
 * Empty strings and NULL-placeholder strings become actual JavaScript null
 * so the backend passes NULL to the PostgreSQL function.
 */
const normalizeParamForExecution = (value) => {
  if (
    value === '' ||
    value === '—' ||
    value === 'NULL' ||
    value === 'null' ||
    value === 'NULL::date' ||
    value === 'NULL::varchar' ||
    value === 'NULL::character varying'
  ) {
    return null;
  }
  return value;
};

const ReportExecutionPanel = ({ report, onBack }) => {
  const dispatch = useDispatch();
  const { reportResult, resultColumns, totalRows, executionTime, loading } = useSelector(state => state.functionReports);

  // Parse param_config — it may come as a JSON string from the API
  const paramConfig = (() => {
    let config = report.param_config || [];
    if (typeof config === 'string') {
      try { config = JSON.parse(config); } catch { config = []; }
    }
    if (!Array.isArray(config)) config = [];
    // Ensure dropdown_options is properly parsed for each param
    return config.map(p => {
      let opts = p.dropdown_options;
      if (typeof opts === 'string') {
        try { opts = JSON.parse(opts); } catch { opts = []; }
      }
      return { ...p, dropdown_options: Array.isArray(opts) ? opts : [] };
    });
  })();
  const [paramValues, setParamValues] = useState(() => {
    const initial = {};
    paramConfig.forEach(p => {
      initial[p.param_name] = normalizeDefaultValue(p.default_value);
    });
    return initial;
  });
  const [exporting, setExporting] = useState(false);

  // Re-initialize paramValues when report/paramConfig changes (prevents stale values from previous report)
  useEffect(() => {
    const initial = {};
    paramConfig.forEach(p => {
      initial[p.param_name] = normalizeDefaultValue(p.default_value);
    });
    setParamValues(initial);
  }, [report.id]);

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({ ...prev, [paramName]: value }));
  };

  const handleExecute = () => {
    // Validate required params
    for (const p of paramConfig) {
      if (p.is_required && !paramValues[p.param_name]) {
        showError(`"${p.display_label || p.param_name}" is required`);
        return;
      }
    }

    // Normalize parameter values before dispatch:
    // Empty strings and NULL placeholders become actual null for the PostgreSQL function
    const normalizedParams = {};
    paramConfig.forEach(p => {
      normalizedParams[p.param_name] = normalizeParamForExecution(paramValues[p.param_name]);
    });

    console.log('REPORT PARAMS:', normalizedParams);

    dispatch(runFunctionReport({ reportId: report.id, params: normalizedParams }));
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await exportFunctionReportExcel(report.id, paramValues);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.report_name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel exported');
    } catch (e) {
      showError('Export failed');
    }
    setExporting(false);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await exportFunctionReportCSV(report.id, paramValues);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.report_name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('CSV exported');
    } catch (e) {
      showError('Export failed');
    }
    setExporting(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 text-[9px] text-violet-600 font-bold hover:underline">
            <ArrowLeft size={11} /> Back to Reports
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Table2 size={14} className="text-violet-600" />
            <span className="text-xs font-bold text-slate-700">{report.report_name}</span>
          </div>
          <span className="text-[8px] text-slate-400 font-mono">
            ({report.schema_name}.{report.function_name})
          </span>
        </div>
        {reportResult && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-400">
              {totalRows} rows • {executionTime}ms
            </span>
            <button type="button" onClick={handleExportExcel} disabled={exporting}
              className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100">
              <Download size={9} /> Excel
            </button>
            <button type="button" onClick={handleExportCSV} disabled={exporting}
              className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
              <Download size={9} /> CSV
            </button>
          </div>
        )}
      </div>

      {/* Parameter Inputs */}
      {paramConfig.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-end gap-3 flex-wrap">
            {paramConfig.map(param => (
              <div key={param.param_name} className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-slate-600 uppercase">
                  {param.display_label || param.param_name}
                  {param.is_required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <ParamInput
                  param={param}
                  value={paramValues[param.param_name] || ''}
                  onChange={(val) => handleParamChange(param.param_name, val)}
                />
              </div>
            ))}
            <button type="button" onClick={handleExecute} disabled={loading.execution}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all">
              {loading.execution ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              Run Report
            </button>
          </div>
        </div>
      )}

      {/* No params — single execute button */}
      {paramConfig.length === 0 && !reportResult && (
        <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200">
          <button type="button" onClick={handleExecute} disabled={loading.execution}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all">
            {loading.execution ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run Report
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {loading.execution ? (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={18} className="text-violet-500 animate-spin" />
            <span className="text-xs text-slate-400">Executing report...</span>
          </div>
        ) : reportResult && reportResult.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                <th className="px-3 py-2 text-[8px] font-bold text-slate-300 uppercase border-r border-slate-700">#</th>
                {resultColumns.map(col => (
                  <th key={col.field} className="px-3 py-2 text-[8px] font-bold text-slate-300 uppercase border-r border-slate-700 whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportResult.map((row, idx) => (
                <tr key={idx} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-3 py-2 text-[9px] text-slate-400 border-r border-slate-100">{idx + 1}</td>
                  {resultColumns.map(col => (
                    <td key={col.field} className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 whitespace-nowrap">
                      {formatCellValue(row[col.field])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : reportResult && reportResult.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-slate-400">No data returned for the given parameters</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Table2 size={36} className="text-slate-200 mb-3" />
            <p className="text-xs text-slate-400">
              {paramConfig.length > 0 ? 'Enter parameters and click "Run Report"' : 'Click "Run Report" to execute'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Param Input Component ─── */
const ParamInput = ({ param, value, onChange }) => {
  const baseClass = "px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500";

  switch (param.input_type) {
    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={`${baseClass} w-40`} />;
    case 'datetime':
      return <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)} className={`${baseClass} w-48`} />;
    case 'number':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} className={`${baseClass} w-32`} />;
    case 'boolean':
      return (
        <select value={value} onChange={e => onChange(e.target.value)} className={`${baseClass} w-28 appearance-none cursor-pointer`}>
          <option value="">—</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    case 'select':
      return (
        <select value={value} onChange={e => onChange(e.target.value)} className={`${baseClass} w-40 appearance-none cursor-pointer`}>
          <option value="">— Select —</option>
          {(param.dropdown_options || []).map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label || opt.value}</option>
          ))}
        </select>
      );
    default:
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Enter value" className={`${baseClass} w-40`} />;
  }
};

/* ── Helper to format cell values ─── */
const formatCellValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleString('en-IN');
  if (typeof value === 'object') return JSON.stringify(value);
  // Check if it's a date string
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && value.includes('T')) {
    return new Date(value).toLocaleString('en-IN');
  }
  return String(value);
};

export default FunctionReportViewer;
