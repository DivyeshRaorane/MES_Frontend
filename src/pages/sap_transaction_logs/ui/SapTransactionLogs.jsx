import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Search, X, RotateCcw, Loader2, Database, Eye,
  ChevronUp, ChevronDown, ChevronsUpDown, ShieldAlert, Filter,
} from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getSapTransactionLogs } from '../services/sapTransactionLogs.api';

/* Common SAP operations — free text is still allowed via the "Other" input. */
const OPERATION_OPTIONS = [
  'FG_CONFIRMATION',
  'SCRAP_GOODS_ISSUE',
  'STOCK_TRANSFER_MTM',
  'GOODS_RECEIPT',
  'GOODS_ISSUE',
  'PROD_ORDER_CONFIRMATION',
];

const PAGE_SIZE_OPTIONS = [25, 50, 100];

/* Format a Date into the `YYYY-MM-DDTHH:mm` string a datetime-local input
   expects, using LOCAL time (not UTC) so the day/hour don't shift. */
const toLocalInput = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* Default date range = today 12:00 AM → today 11:55 PM (local time). */
const defaultDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 55, 0, 0);
  return { from_date: toLocalInput(start), to_date: toLocalInput(end) };
};

/* Build a fresh baseline filter set. Computed per call so the current day is
   always used on mount and on every "Clear". */
const buildDefaultFilters = () => ({
  prod_order: '',
  batch: '',
  status: 'All',
  operation: '',
  ...defaultDateRange(),
});

/* Columns that participate in header-click sorting. */
const COLUMNS = [
  { key: 'created_at', label: 'Created At', sortable: true },
  { key: 'log_id', label: 'Log ID', sortable: true },
  { key: 'operation', label: 'Operation', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'prod_order', label: 'Prod Order', sortable: true },
  { key: 'batch', label: 'Batch', sortable: true },
  { key: 'material_document', label: 'Material Doc', sortable: true },
  { key: 'inspection_lot', label: 'Inspection Lot', sortable: true },
  { key: 'http_status_code', label: 'HTTP', sortable: true },
  { key: 'duration_ms', label: 'Duration', sortable: true },
  { key: 'message', label: 'Message', sortable: false },
  { key: '__actions', label: '', sortable: false },
];

const fmtDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const StatusBadge = ({ status }) => {
  const s = (status || '').toUpperCase();
  const cls = s === 'SUCCESS'
    ? 'bg-emerald-100 text-emerald-700'
    : s === 'FAILED'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-slate-100 text-slate-600';
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {status || '—'}
    </span>
  );
};

/* ── Collapsible pretty-printed JSON block ── */
const JsonBlock = ({ label, value, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const isEmpty = value === null || value === undefined
    || (typeof value === 'object' && Object.keys(value).length === 0);
  const pretty = useMemo(() => {
    if (isEmpty) return null;
    try {
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value, isEmpty]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        <span className="flex items-center gap-2">
          {isEmpty && <span className="text-[9px] text-slate-400 font-medium">empty</span>}
          {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
        </span>
      </button>
      {open && (
        <div className="bg-slate-900 max-h-72 overflow-auto">
          {isEmpty ? (
            <p className="px-3 py-3 text-[10px] text-slate-500 font-mono">null</p>
          ) : (
            <pre className="px-3 py-3 text-[10px] leading-relaxed text-emerald-200 font-mono whitespace-pre">{pretty}</pre>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Detail drawer (slides in from the right) ── */
const LogDetailDrawer = ({ log, onClose }) => {
  if (!log) return null;

  const fields = [
    ['Log ID', log.log_id],
    ['Operation', log.operation],
    ['Status', log.status],
    ['SAP Status', log.sap_status],
    ['HTTP Method', log.http_method],
    ['HTTP Status Code', log.http_status_code],
    ['SAP Endpoint', log.sap_endpoint],
    ['SAP URL', log.sap_url],
    ['Movement Type', log.movement_type],
    ['Reference Type', log.reference_type],
    ['Reference ID', log.reference_id],
    ['Material Document', log.material_document],
    ['Material Code', log.material_code],
    ['Batch', log.batch],
    ['Inspection Lot', log.inspection_lot],
    ['Prod Order', log.prod_order],
    ['Correlation ID', log.correlation_id],
    ['Source Table', log.source_table],
    ['Source IDs', Array.isArray(log.source_ids) ? log.source_ids.join(', ') : log.source_ids],
    ['Triggered By', log.triggered_by],
    ['Duration (ms)', log.duration_ms],
    ['Created At', fmtDate(log.created_at)],
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-sky-600" />
            <span className="text-sm font-bold text-slate-700">Log #{log.log_id}</span>
            <StatusBadge status={log.status} />
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {fields.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{k}</span>
                <span className="text-[10px] text-slate-700 font-mono break-all">
                  {v === null || v === undefined || v === '' ? '—' : String(v)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Message</span>
            <p className="text-[10px] text-slate-700 break-words">{log.message || '—'}</p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <JsonBlock label="Request Payload" value={log.request_payload} />
            <JsonBlock label="Response Payload" value={log.response_payload} />
            <JsonBlock label="Error Detail" value={log.error_detail} defaultOpen={!!log.error_detail} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SortHeader = ({ col, sortKey, sortDir, onSort }) => {
  if (!col.sortable) {
    return <th className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap text-slate-300">{col.label}</th>;
  }
  const active = sortKey === col.key;
  return (
    <th
      onClick={() => onSort(col.key)}
      className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap text-slate-300 cursor-pointer select-none hover:text-white"
    >
      <span className="inline-flex items-center gap-1">
        {col.label}
        {active ? (
          sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
        ) : (
          <ChevronsUpDown size={11} className="opacity-40" />
        )}
      </span>
    </th>
  );
};

/**
 * SAP Transaction Logs page. Admin-only.
 *
 * `onBack` is optional — when rendered inside the General Admin card shell it
 * receives an onBack handler; when hit directly via route it falls back to
 * browser navigation.
 */
const SapTransactionLogs = ({ onBack }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === 'admin';

  const [filters, setFilters] = useState(buildDefaultFilters);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Post-fetch free-text filter across message / request_payload / response_payload.
  const [textFilter, setTextFilter] = useState('');

  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [selected, setSelected] = useState(null);

  const handleAuthError = useCallback((error) => {
    const code = error?.response?.status;
    if (code === 401) {
      showError('Session expired. Please log in again.');
      navigate('/', { replace: true });
      return true;
    }
    if (code === 403) {
      setAccessDenied(true);
      showError("You don't have access, admin only");
      return true;
    }
    return false;
  }, [navigate]);

  const fetchLogs = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const res = await getSapTransactionLogs({
        ...activeFilters,
        status: activeFilters.status === 'All' ? '' : activeFilters.status,
        // datetime-local gives a local "YYYY-MM-DDTHH:mm" string; convert to a
        // full ISO timestamp so the server receives an unambiguous value.
        from_date: toIso(activeFilters.from_date),
        to_date: toIso(activeFilters.to_date),
      });
      if (res?.success) {
        setRows(Array.isArray(res.data) ? res.data : []);
        setCount(typeof res.count === 'number' ? res.count : (res.data?.length || 0));
        setAccessDenied(false);
      } else {
        setRows([]);
        setCount(0);
        showError(res?.message || 'Failed to load SAP transaction logs');
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        setRows([]);
        setCount(0);
        showError(error?.response?.data?.message || error.message || 'Failed to load SAP transaction logs');
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    // On mount, load using the current filters (which default to today's range).
    if (isAdmin) fetchLogs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, fetchLogs]);

  const setField = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const handleSearch = () => {
    setPage(1);
    fetchLogs(filters);
  };

  const handleClear = () => {
    const defaults = buildDefaultFilters();
    setFilters(defaults);
    setTextFilter('');
    setPage(1);
    fetchLogs(defaults);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  /* Client-side text filter over message + payloads. */
  const textFiltered = useMemo(() => {
    const q = textFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const haystack = [
        r.message,
        safeStringify(r.request_payload),
        safeStringify(r.response_payload),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, textFilter]);

  /* Sorting. */
  const sorted = useMemo(() => {
    const copy = [...textFiltered];
    copy.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'created_at') {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      }
      if (av === null || av === undefined) av = '';
      if (bv === null || bv === undefined) bv = '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [textFiltered, sortKey, sortDir]);

  /* Pagination. */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const goBack = () => (onBack ? onBack() : navigate(-1));

  /* ── Access control ── */
  if (!isAdmin || accessDenied) {
    return (
      <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2 items-center justify-center text-center px-6">
          <ShieldAlert size={40} className="text-rose-500 mb-3" />
          <p className="text-sm font-bold text-slate-700">You don't have access, admin only</p>
          <p className="text-[11px] text-slate-400 mt-1">This page is restricted to administrators.</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-4 flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900"
          >
            <ArrowLeft size={12} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const inputCls = 'border border-slate-200 rounded px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-sky-300';

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-sky-600 font-bold hover:underline">
                <ArrowLeft size={11} /> Back
              </button>
            )}
            <Database size={14} className="text-sky-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">SAP Transaction Logs</span>
            <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">
              {count} records
            </span>
            {textFilter.trim() && (
              <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                {sorted.length} matched
              </span>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0 flex flex-wrap items-end gap-2">
          <Field label="Prod Order">
            <input value={filters.prod_order} onChange={(e) => setField('prod_order', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="exact" className={`${inputCls} w-32`} />
          </Field>
          <Field label="Batch">
            <input value={filters.batch} onChange={(e) => setField('batch', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="exact" className={`${inputCls} w-28`} />
          </Field>
          <Field label="Status">
            <select value={filters.status} onChange={(e) => setField('status', e.target.value)} className={`${inputCls} w-28`}>
              <option value="All">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </Field>
          <Field label="Operation">
            <input list="sap-operations" value={filters.operation}
              onChange={(e) => setField('operation', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="type or pick" className={`${inputCls} w-44`} />
            <datalist id="sap-operations">
              {OPERATION_OPTIONS.map((op) => <option key={op} value={op} />)}
            </datalist>
          </Field>
          <Field label="From Date">
            <input type="datetime-local" value={filters.from_date}
              onChange={(e) => setField('from_date', e.target.value)} className={`${inputCls} w-44`} />
          </Field>
          <Field label="To Date">
            <input type="datetime-local" value={filters.to_date}
              onChange={(e) => setField('to_date', e.target.value)} className={`${inputCls} w-44`} />
          </Field>

          <button type="button" onClick={handleSearch}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-[9px] font-bold rounded hover:bg-sky-700">
            <Search size={11} /> Search
          </button>
          <button type="button" onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-200 border border-slate-200">
            <RotateCcw size={11} /> Clear
          </button>
        </div>

        {/* Post-fetch text filter */}
        <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0 flex items-center gap-2">
          <Filter size={12} className="text-amber-500" />
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={textFilter}
              onChange={(e) => { setTextFilter(e.target.value); setPage(1); }}
              placeholder="Filter loaded rows by message / request / response payload..."
              className={`${inputCls} pl-6 w-96 max-w-full`}
            />
            {textFilter && (
              <button type="button" onClick={() => setTextFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
          <span className="text-[9px] text-slate-400">Searches within already-loaded results (message, request_payload, response_payload)</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-sky-500 animate-spin" />
              <span className="text-xs text-slate-400">Loading logs...</span>
            </div>
          ) : paged.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-xs text-slate-400">No logs found</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {COLUMNS.map((col) => (
                    <SortHeader key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((r) => (
                  <tr
                    key={r.log_id}
                    onClick={() => setSelected(r)}
                    className="hover:bg-sky-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2 text-[9px] text-slate-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-sky-700">{r.log_id}</td>
                    <td className="px-3 py-2 text-[10px] font-semibold text-slate-700 whitespace-nowrap">{r.operation || '—'}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.prod_order || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.batch || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.material_document || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.inspection_lot || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.http_status_code ?? '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600 whitespace-nowrap">
                      {r.duration_ms != null ? `${r.duration_ms} ms` : '—'}
                    </td>
                    <td className="px-3 py-2 text-[10px] text-slate-600 max-w-[280px] truncate" title={r.message || ''}>
                      {r.message || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                        className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 text-[8px] font-bold rounded hover:bg-sky-100 whitespace-nowrap"
                      >
                        <Eye size={9} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && sorted.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-[9px] text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage(1)}
                className="px-2 py-1 text-[9px] font-bold rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100">« First</button>
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 text-[9px] font-bold rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100">‹ Prev</button>
              <span className="text-[9px] text-slate-600 px-2">Page {currentPage} / {totalPages}</span>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 text-[9px] font-bold rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100">Next ›</button>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}
                className="px-2 py-1 text-[9px] font-bold rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100">Last »</button>
            </div>
          </div>
        )}
      </div>

      {selected && <LogDetailDrawer log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    {children}
  </div>
);

/* Convert a datetime-local value (local time) to an ISO timestamp.
   Empty/invalid values pass through untouched so they stay omitted. */
function toIso(value) {
  if (!value) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

function safeStringify(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

export default SapTransactionLogs;
