/**
 * Report Viewer - Light theme matching the app
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Download, Printer, Search, Filter,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Columns3, Eye, EyeOff,
  FileSpreadsheet, FileText, FileDown, AlertCircle,
} from 'lucide-react';
import {
  runReport, setActiveReport, setCurrentPage, setPageSize,
  setFilters, clearFilters, setSorting, setSearchQuery, clearReportData,
} from '../controller/dynamicReports.slice';
import { fetchReportById, executeMultiSheetReport } from '../services/reportBuilder.api';
import { exportToExcel, exportToCSV, exportToPDF, printReport, exportMultiSheetToExcel } from '../utils/exportUtils';

function parseJsonField(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch (e) { return fallback; } }
  return fallback;
}

const ReportViewer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reportId } = useParams();
  const {
    activeReport, reportData, responseColumns, totalRows, executionTime,
    currentPage, pageSize, filters, sorting, searchQuery, loading, error,
  } = useSelector((state) => state.dynamicReports);

  const [showFilters, setShowFilters] = useState(true);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [reportLoaded, setReportLoaded] = useState(false);

  useEffect(() => {
    if (reportId && !activeReport) {
      fetchReportById(reportId).then((res) => {
        const data = res?.data || res;
        if (data) { dispatch(setActiveReport(data)); setReportLoaded(true); }
      }).catch(() => navigate(-1));
    } else if (activeReport) { setReportLoaded(true); }
  }, [reportId, activeReport, dispatch, navigate]);

  useEffect(() => {
    if (reportLoaded && activeReport?.id) {
      dispatch(runReport({ reportId: activeReport.id, params: { page: currentPage, pageSize, filters, sorting, search: searchQuery } }));
    }
  }, [dispatch, reportLoaded, activeReport?.id, currentPage, pageSize, filters, sorting, searchQuery]);

  const columns = useMemo(() => {
    if (responseColumns && responseColumns.length > 0) {
      return responseColumns.map((col) => ({ key: col.field || col.key, field: col.field || col.key, label: col.header || col.label || col.field }));
    }
    if (reportData && reportData.length > 0) {
      const firstRow = reportData[0];
      const rowKeys = Object.keys(firstRow);
      const displayNames = activeReport?.column_display_names
        ? (typeof activeReport.column_display_names === 'string' ? JSON.parse(activeReport.column_display_names) : activeReport.column_display_names) : {};
      const columnOrder = parseJsonField(activeReport?.column_order, []);
      if (columnOrder.length > 0) {
        const orderedCols = [];
        for (const key of columnOrder) {
          const field = key.split('.').pop();
          if (rowKeys.includes(field)) {
            orderedCols.push({ key, field, label: displayNames[key] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) });
          }
        }
        for (const field of rowKeys) {
          if (!orderedCols.find((c) => c.field === field)) {
            orderedCols.push({ key: field, field, label: displayNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) });
          }
        }
        return orderedCols;
      }
      return rowKeys.map((field) => ({
        key: field, field,
        label: displayNames[field] || displayNames[`${activeReport?.main_table}.${field}`] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }));
    }
    if (activeReport) {
      const columnOrder = parseJsonField(activeReport.column_order, []);
      const displayNames = typeof activeReport.column_display_names === 'string' ? JSON.parse(activeReport.column_display_names || '{}') : (activeReport.column_display_names || {});
      if (columnOrder.length > 0) {
        const cols = columnOrder.map((key) => ({ key, field: key.split('.').pop(), label: displayNames[key] || key.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));
        const expressions = parseJsonField(activeReport.expressions, []);
        expressions.forEach((expr) => { cols.push({ key: expr.alias, field: expr.alias, label: expr.displayName || expr.name }); });
        return cols;
      }
    }
    return [];
  }, [activeReport, reportData, responseColumns]);

  const visibleColumns = columns.filter((c) => !hiddenColumns.includes(c.key));
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = reportData && reportData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  const handleApplyFilters = () => dispatch(setFilters(localFilters));
  const handleResetFilters = () => { setLocalFilters({}); dispatch(clearFilters()); };

  const handleSort = (columnKey) => {
    const existing = sorting.find((s) => s.column === columnKey);
    if (existing) {
      if (existing.direction === 'ASC') dispatch(setSorting(sorting.map((s) => s.column === columnKey ? { ...s, direction: 'DESC' } : s)));
      else dispatch(setSorting(sorting.filter((s) => s.column !== columnKey)));
    } else { dispatch(setSorting([...sorting, { column: columnKey, direction: 'ASC' }])); }
  };
  const getSortDirection = (columnKey) => sorting.find((s) => s.column === columnKey)?.direction || null;
  const toggleColumnVisibility = (key) => setHiddenColumns((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleExport = (type) => {
    if (!reportData || reportData.length === 0) return;
    const title = activeReport?.report_name || 'Report';
    switch (type) {
      case 'excel': exportToExcel(reportData, visibleColumns, title); break;
      case 'csv': exportToCSV(reportData, visibleColumns, title); break;
      case 'pdf': exportToPDF(reportData, visibleColumns, title); break;
      case 'print': printReport(reportData, visibleColumns, title); break;
    }
    setShowExportMenu(false);
  };

  const handleRefresh = () => { if (activeReport?.id) dispatch(runReport({ reportId: activeReport.id, params: { page: currentPage, pageSize, filters, sorting, search: searchQuery } })); };

  if (!activeReport && !reportLoaded) {
    return (<div className="h-full flex items-center justify-center bg-slate-50"><RefreshCw size={20} className="animate-spin text-blue-500" /><span className="ml-2 text-sm text-slate-500">Loading report...</span></div>);
  }

  // ── Multi-Sheet Report Detection ──────────────────────────────────────
  if (activeReport?.is_multi_sheet) {
    return <MultiSheetView report={activeReport} navigate={navigate} dispatch={dispatch} />;
  }

  const reportFilters = parseJsonField(activeReport?.filters, []);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { dispatch(clearReportData()); navigate(-1); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="text-xs font-bold text-slate-800">{activeReport?.report_name || 'Report'}</h1>
            <p className="text-[9px] text-slate-500">{activeReport?.module} • {activeReport?.main_table}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => dispatch(setSearchQuery(e.target.value))} placeholder="Search..."
              className="pl-7 pr-3 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 w-40" />
          </div>
          {reportFilters.length > 0 && (
            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-md transition-colors ${showFilters ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><Filter size={14} /></button>
          )}
          <button onClick={() => setShowColumnPicker(!showColumnPicker)}
            className={`p-1.5 rounded-md transition-colors ${showColumnPicker ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}><Columns3 size={14} /></button>
          <button onClick={handleRefresh} disabled={loading.data}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors"><RefreshCw size={14} className={loading.data ? 'animate-spin' : ''} /></button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm">
              <Download size={12} /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                <button onClick={() => handleExport('excel')} className="w-full text-left px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"><FileSpreadsheet size={12} className="text-emerald-500" /> Excel</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"><FileText size={12} className="text-blue-500" /> CSV</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"><FileDown size={12} className="text-rose-500" /> PDF</button>
                <button onClick={() => handleExport('print')} className="w-full text-left px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Printer size={12} className="text-amber-500" /> Print</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && reportFilters.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-2.5">
          <div className="flex flex-wrap items-end gap-3">
            {reportFilters.filter((f) => f.visible !== false).map((filter, idx) => (
              <FilterInput key={idx} filter={filter} value={localFilters[filter.column] || ''} onChange={(val) => setLocalFilters({ ...localFilters, [filter.column]: val })} />
            ))}
            <div className="flex items-center gap-2">
              <button onClick={handleApplyFilters} className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700">Generate</button>
              <button onClick={handleResetFilters} className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Column Picker */}
      {showColumnPicker && columns.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-2">
          <div className="flex flex-wrap gap-1.5">
            {columns.map((col) => {
              const hidden = hiddenColumns.includes(col.key);
              return (
                <button key={col.key} onClick={() => toggleColumnVisibility(col.key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors border
                    ${hidden ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                  {hidden ? <EyeOff size={10} /> : <Eye size={10} />} {col.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" /><span className="text-[11px] text-red-600">{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        {loading.data ? (
          <div className="flex items-center justify-center py-16"><RefreshCw size={20} className="animate-spin text-blue-500" /><span className="ml-3 text-sm text-slate-500">Loading data...</span></div>
        ) : !reportData || reportData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center"><FileText size={36} className="mx-auto text-slate-300 mb-3" /><p className="text-sm text-slate-500">No records found</p><p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search criteria</p></div>
          </div>
        ) : (
          <table className="w-full text-[11px] border-collapse bg-white">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[9px] text-slate-500 font-bold uppercase tracking-wider w-10">#</th>
                {visibleColumns.map((col) => {
                  const sortDir = getSortDirection(col.key);
                  return (
                    <th key={col.key} onClick={() => handleSort(col.key)}
                      className="px-3 py-2 text-left text-[9px] text-slate-500 font-bold uppercase tracking-wider cursor-pointer hover:text-blue-600 hover:bg-blue-50/50 transition-colors whitespace-nowrap select-none">
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortDir === 'ASC' && <ArrowUp size={9} className="text-blue-500" />}
                        {sortDir === 'DESC' && <ArrowDown size={9} className="text-blue-500" />}
                        {!sortDir && <ArrowUpDown size={8} className="text-slate-300" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="px-3 py-1.5 text-slate-400 font-mono text-[10px]">{startRow + idx}</td>
                  {visibleColumns.map((col) => {
                    const val = row[col.field] !== undefined ? row[col.field] : row[col.key];
                    return (
                      <td key={col.key} className="px-3 py-1.5 text-slate-700 whitespace-nowrap max-w-[220px] truncate">
                        {val === null || val === undefined ? <span className="text-slate-300 italic">null</span> : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>Showing <strong className="text-slate-700">{startRow}</strong>-<strong className="text-slate-700">{endRow}</strong> of <strong className="text-slate-700">{totalRows}</strong></span>
          {executionTime > 0 && <span className="text-slate-400">• {executionTime}ms</span>}
        </div>
        <div className="flex items-center gap-2">
          <select value={pageSize} onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 focus:outline-none">
            <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={200}>200</option><option value={500}>500</option>
          </select>
          <div className="flex items-center gap-0.5">
            <button onClick={() => dispatch(setCurrentPage(1))} disabled={currentPage === 1} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30"><ChevronsLeft size={14} /></button>
            <button onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30"><ChevronLeft size={14} /></button>
            <span className="px-2 text-[10px] text-slate-600 font-medium">{currentPage} / {totalPages}</span>
            <button onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={currentPage >= totalPages} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30"><ChevronRight size={14} /></button>
            <button onClick={() => dispatch(setCurrentPage(totalPages))} disabled={currentPage >= totalPages} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30"><ChevronsRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterInput = ({ filter, value, onChange }) => {
  const base = "px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors";
  switch (filter.filterType) {
    case 'text': case 'autocomplete':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}{filter.required && <span className="text-red-400"> *</span>}</label><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={filter.label} className={`${base} w-36`} /></div>);
    case 'number':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}{filter.required && <span className="text-red-400"> *</span>}</label><input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={filter.label} className={`${base} w-28`} /></div>);
    case 'date':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}{filter.required && <span className="text-red-400"> *</span>}</label><input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={`${base} w-36`} /></div>);
    case 'daterange':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}{filter.required && <span className="text-red-400"> *</span>}</label><div className="flex items-center gap-1"><input type="date" value={value?.from||''} onChange={(e) => onChange({...(value||{}), from: e.target.value})} className={`${base} w-32`} /><span className="text-[9px] text-slate-400">to</span><input type="date" value={value?.to||''} onChange={(e) => onChange({...(value||{}), to: e.target.value})} className={`${base} w-32`} /></div></div>);
    case 'dropdown':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}{filter.required && <span className="text-red-400"> *</span>}</label><select value={value} onChange={(e) => onChange(e.target.value)} className={`${base} w-36`}><option value="">All</option>{(filter.options||[]).map((opt) => (<option key={opt} value={opt}>{opt}</option>))}</select></div>);
    case 'checkbox':
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}</label><label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={value===true||value==='true'} onChange={(e) => onChange(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-blue-500" /><span className="text-[11px] text-slate-600">Yes</span></label></div>);
    default:
      return (<div className="space-y-1"><label className="text-[9px] text-slate-500 font-semibold uppercase">{filter.label}</label><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={filter.label} className={`${base} w-36`} /></div>);
  }
};

// ─── Multi-Sheet View (inline within ReportViewer) ──────────────────────────

const MultiSheetView = ({ report, navigate, dispatch }) => {
  const [executionResult, setExecutionResult] = useState(null);
  const [activeSheetTab, setActiveSheetTab] = useState(0);
  const [msLoading, setMsLoading] = useState(false);
  const [msError, setMsError] = useState(null);

  useEffect(() => {
    if (report?.id) {
      setMsLoading(true);
      executeMultiSheetReport(report.id, {})
        .then((data) => { setExecutionResult(data); setMsLoading(false); })
        .catch((err) => { setMsError(err?.response?.data?.message || err.message); setMsLoading(false); });
    }
  }, [report?.id]);

  const handleRefresh = () => {
    setMsLoading(true);
    setMsError(null);
    executeMultiSheetReport(report.id, {})
      .then((data) => { setExecutionResult(data); setMsLoading(false); })
      .catch((err) => { setMsError(err?.response?.data?.message || err.message); setMsLoading(false); });
  };

  const handleExport = () => {
    if (executionResult) exportMultiSheetToExcel(executionResult, report.report_name || 'Report');
  };

  const sheetTabs = executionResult?.sheets?.map(s => s.sheetName || s.sheet_name || 'Sheet') || [];
  const currentSheet = executionResult?.sheets?.[activeSheetTab] || null;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { dispatch(clearReportData()); navigate(-1); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xs font-bold text-slate-800">{report.report_name}</h1>
            <p className="text-[9px] text-slate-500">{report.module} • Multi-Sheet Report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={msLoading}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors">
            <RefreshCw size={14} className={msLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} disabled={!executionResult}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            <Download size={12} /> Export Excel
          </button>
        </div>
      </div>

      {/* Sheet Tabs */}
      {sheetTabs.length > 1 && (
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-1 overflow-x-auto">
          <div className="flex items-center gap-1">
            {sheetTabs.map((tabName, idx) => (
              <button key={idx} onClick={() => setActiveSheetTab(idx)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all
                  ${idx === activeSheetTab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                {tabName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {msError && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" /><span className="text-[11px] text-red-600">{msError}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {msLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            <span className="ml-3 text-sm text-slate-500">Executing report...</span>
          </div>
        ) : !currentSheet ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No data available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {(currentSheet.tables || []).map((table, tIdx) => (
              <div key={tIdx} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-700">{table.title || table.table_name || `Table ${tIdx + 1}`}</h3>
                  <span className="text-[9px] text-slate-400">{(table.data || []).length} record(s)</span>
                </div>
                {(!table.data || table.data.length === 0) ? (
                  <div className="px-4 py-6 text-center"><p className="text-xs text-slate-400">No records</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[9px] text-slate-500 font-bold uppercase w-10">#</th>
                          {(table.columns || []).map(col => (
                            <th key={col.field} className="px-3 py-2 text-left text-[9px] text-slate-500 font-bold uppercase whitespace-nowrap">
                              {col.header || col.field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.data.map((row, rIdx) => (
                          <tr key={rIdx} className={`border-b border-slate-50 hover:bg-blue-50/30 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <td className="px-3 py-1.5 text-slate-400 font-mono text-[10px]">{rIdx + 1}</td>
                            {(table.columns || []).map(col => (
                              <td key={col.field} className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                                {row[col.field] === null || row[col.field] === undefined ? <span className="text-slate-300">—</span> : String(row[col.field])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;
