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
import {
  REPORT_TYPES, REPORT_TYPE_LABELS, getReportType, isMultiType, getFunctionLabel,
} from '../utils/reportType';

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
                      {isMultiType(getReportType(report)) && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                          {REPORT_TYPE_LABELS[getReportType(report)]}
                        </span>
                      )}
                      <span className="text-[8px] text-slate-400 font-mono">
                        {getFunctionLabel(report)}
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
  const {
    reportResult, resultColumns, resultType, reportItems, totalRows, executionTime, loading,
  } = useSelector(state => state.functionReports);

  const isMultiResult = isMultiType(resultType);
  const hasResult = isMultiResult ? reportItems.length > 0 : reportResult !== null && reportResult !== undefined;
  const reportType = getReportType(report);

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
          {reportType !== REPORT_TYPES.SINGLE && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
              {REPORT_TYPE_LABELS[reportType]}
            </span>
          )}
          <span className="text-[8px] text-slate-400 font-mono">
            ({getFunctionLabel(report)})
          </span>
        </div>
        {hasResult && (
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
      {paramConfig.length === 0 && !hasResult && (
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
        ) : isMultiResult && reportItems.length > 0 ? (
          resultType === REPORT_TYPES.MULTI_SHEET
            ? <MultiSheetResult items={reportItems} />
            : <MultiTableResult items={reportItems} />
        ) : !isMultiResult && reportResult && reportResult.length > 0 ? (
          <ResultTable columns={resultColumns} rows={reportResult} />
        ) : !isMultiResult && reportResult && reportResult.length === 0 ? (
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

/* ── Result table (columns are always taken from the data set being rendered) ─── */
const ResultTable = ({ columns, rows }) => (
  <table className="w-full text-left border-collapse min-w-max">
    <thead className="sticky top-0 bg-slate-800 z-10">
      <tr>
        <th className="px-3 py-2 text-[8px] font-bold text-slate-300 uppercase border-r border-slate-700">#</th>
        {columns.map(col => (
          <th key={col.field} className="px-3 py-2 text-[8px] font-bold text-slate-300 uppercase border-r border-slate-700 whitespace-nowrap">
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.map((row, idx) => (
        <tr key={idx} className="hover:bg-violet-50/30 transition-colors">
          <td className="px-3 py-2 text-[9px] text-slate-400 border-r border-slate-100">{idx + 1}</td>
          {columns.map(col => (
            <td key={col.field} className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 whitespace-nowrap">
              {formatCellValue(row[col.field])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const getItemTitle = (item, idx) =>
  item.title || item.sheet_name || item.function_name || `Result ${idx + 1}`;

const getItemError = (item) => {
  if (!item.error) return null;
  return typeof item.error === 'string' ? item.error : (item.error.message || JSON.stringify(item.error));
};

const ItemMeta = ({ item }) => (
  <span className="text-[9px] text-slate-400">
    {item.totalRows} rows{item.executionTime ? ` • ${item.executionTime}ms` : ''}
  </span>
);

/** Body of a single function result: error (if any), table, or empty message. */
const ItemBody = ({ item }) => {
  const error = getItemError(item);
  const hasRows = item.data.length > 0;
  return (
    <>
      {error && (
        <div role="alert" className="m-3 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {hasRows ? (
        <ResultTable columns={item.columns} rows={item.data} />
      ) : !error ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-xs text-slate-400">No data returned for this function</p>
        </div>
      ) : null}
    </>
  );
};

/** multi_table: one section per function, stacked in order. */
const MultiTableResult = ({ items }) => (
  <div className="p-4 space-y-5">
    {items.map((item, idx) => (
      <section key={`${item.sequence ?? idx}-${item.function_name}`}
        aria-label={getItemTitle(item, idx)}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-700">{getItemTitle(item, idx)}</h2>
          <ItemMeta item={item} />
        </div>
        <div className="max-h-[28rem] overflow-auto">
          <ItemBody item={item} />
        </div>
      </section>
    ))}
  </div>
);

/** multi_sheet: tab bar, one function result per tab. */
const MultiSheetResult = ({ items }) => {
  // Tab state is tied to the result set, so a new run goes back to the first tab
  const [tab, setTab] = useState({ items, index: 0 });
  const active = tab.items === items ? tab.index : 0;
  const setActive = (index) => setTab({ items, index });

  const current = Math.min(active, items.length - 1);
  const item = items[current];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') setActive((current + 1) % items.length);
    else if (e.key === 'ArrowLeft') setActive((current - 1 + items.length) % items.length);
    else return;
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col">
      <div role="tablist" aria-label="Report sheets" onKeyDown={handleKeyDown}
        className="flex-shrink-0 flex items-end gap-1 px-4 pt-2 bg-white border-b border-slate-200 overflow-x-auto">
        {items.map((it, idx) => {
          const selected = idx === current;
          return (
            <button key={`${it.sequence ?? idx}-${it.function_name}`} type="button" role="tab"
              id={`fn-tab-${idx}`} aria-selected={selected} aria-controls="fn-tabpanel"
              tabIndex={selected ? 0 : -1} onClick={() => setActive(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold whitespace-nowrap rounded-t-lg border border-b-0 transition-colors ${
                selected
                  ? 'bg-slate-50 text-violet-700 border-slate-200 -mb-px'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {getItemTitle(it, idx)}
              {it.error && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="This sheet has an error" />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id="fn-tabpanel" aria-labelledby={`fn-tab-${current}`} className="flex-1 overflow-auto">
        <div className="flex items-center justify-end px-4 py-1.5">
          <ItemMeta item={item} />
        </div>
        <ItemBody item={item} />
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
