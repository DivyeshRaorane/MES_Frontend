/**
 * Function Report Admin Panel
 * 
 * This is a REPORT REGISTRY — it registers existing PostgreSQL functions as reports.
 * It does NOT create, edit, or delete PostgreSQL functions.
 * 
 * Admin can:
 * - View existing PostgreSQL functions (read-only from pg_proc)
 * - Register a function as a report (name, section, description, permissions, active status)
 * - Configure parameter display labels for the report UI
 * - Enable/disable registered reports
 * - Delete report registrations (not the function itself)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, ArrowUp, ArrowDown, ChevronDown, Search, Plus, Edit2, Power, Trash2, Loader2,
  Database, FileText, Settings, X, RefreshCw, Info, PlusCircle, MinusCircle,
} from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError } from '../../../utils/toastService';
import {
  fetchAllFunctionReports,
  fetchAvailableFunctions,
  fetchFunctionParameters,
  createFunctionReport,
  updateFunctionReport,
  toggleFunctionReportStatus,
  deleteFunctionReport,
  fetchFunctionReportSections,
  fetchCompatibleFunctions,
} from '../services/functionReports.api';
import {
  REPORT_TYPES, REPORT_TYPE_OPTIONS, REPORT_TYPE_LABELS,
  getReportType, isMultiType, getFunctionNames, splitFullName,
} from '../utils/reportType';

/** Small badge showing the report type (Single / Multi Table / Multi Sheet). */
const ReportTypeBadge = ({ type }) => (
  <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
    type === REPORT_TYPES.SINGLE ? 'bg-slate-100 text-slate-600' : 'bg-violet-100 text-violet-700'
  }`}>
    {REPORT_TYPE_LABELS[type]}
  </span>
);

const PARAM_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'select', label: 'Dropdown' },
  { value: 'boolean', label: 'Yes/No' },
];

const AVAILABLE_SECTIONS = [
  { value: 'Draw', label: 'Draw Management' },
  { value: 'Proof Testing', label: 'Proof Testing' },
  { value: 'Quality', label: 'Quality' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'Finish Goods', label: 'Finish Goods' },
  { value: 'General', label: 'General (Dynamic Reports)' },
];

/* ══════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
   ══════════════════════════════════════════════════════════ */
const FunctionReportAdmin = () => {
  const [reports, setReports] = useState([]);
  const [availableFunctions, setAvailableFunctions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllFunctionReports();
      const list = Array.isArray(res) ? res : res?.data || [];
      // Normalize: ensure section_ids exists on each report (backward compat)
      // Also parse param_config if it comes as a JSON string
      const normalized = list.map(r => {
        let config = r.param_config;
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch { config = []; }
        }
        if (!Array.isArray(config)) config = [];
        // Parse dropdown_options within each param if stored as string
        config = config.map(p => {
          let opts = p.dropdown_options;
          if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch { opts = []; }
          }
          return { ...p, dropdown_options: opts };
        });
        return {
          ...r,
          param_config: config,
          report_type: getReportType(r),
          function_names: getFunctionNames(r),
          section_ids: r.section_ids || (r.section ? [r.section] : []),
        };
      });
      setReports(normalized);
    } catch (e) {
      console.error('Failed to load function reports:', e);
    }
    setLoading(false);
  }, []);

  const loadFunctions = useCallback(async () => {
    try {
      const res = await fetchAvailableFunctions();
      setAvailableFunctions(Array.isArray(res) ? res : res?.data || []);
    } catch (e) {
      console.error('Failed to load available functions:', e);
    }
  }, []);

  const loadSections = useCallback(async () => {
    try {
      const res = await fetchFunctionReportSections();
      setSections(Array.isArray(res) ? res : res?.data || []);
    } catch (e) {
      console.error('Failed to load sections:', e);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadFunctions();
    loadSections();
  }, [loadReports, loadFunctions, loadSections]);

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.report_name?.toLowerCase().includes(q) ||
      r.function_name?.toLowerCase().includes(q) ||
      r.section?.toLowerCase().includes(q);
  });

  const handleToggleStatus = async (report) => {
    try {
      const res = await toggleFunctionReportStatus(report.id);
      if (res?.success) {
        showSuccess(`Report ${report.is_active ? 'disabled' : 'activated'} successfully`);
        loadReports();
      } else {
        showError(res?.message || 'Status change failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Status change failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteFunctionReport(id);
      if (res?.success) {
        showSuccess('Report registration deleted');
        loadReports();
      } else {
        showError(res?.message || 'Delete failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Delete failed');
    }
    setConfirmDelete(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleFormSaved = (savedPayload) => {
    handleFormClose();
    loadReports();
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-100 text-violet-600">
              <Database size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Function Report Registry
              </h1>
              <p className="text-[9px] text-slate-400">
                Register existing PostgreSQL functions as reports
              </p>
            </div>
            <span className="text-[8px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">
              {reports.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { loadReports(); loadFunctions(); }}
              className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all">
              <RefreshCw size={10} /> Refresh
            </button>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-violet-500/20 w-44" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-[9px] font-bold rounded-lg hover:bg-violet-700 transition-all">
              <Plus size={11} /> Register Report
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-start gap-2">
          <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-blue-700">
            This panel registers <strong>existing</strong> PostgreSQL functions as user-accessible reports.
            Functions are created and maintained by the database administrator directly in PostgreSQL.
            Only report metadata (name, section, permissions, parameters) is managed here.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-violet-500 animate-spin" />
              <span className="text-xs text-slate-400">Loading...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700">Report Name</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700">Function</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700">Section</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700">Status</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700">Created</th>
                  <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">
                      No function reports registered
                    </td>
                  </tr>
                ) : filtered.map(report => (
                  <tr key={report.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-700 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-violet-500" />
                        {report.report_name}
                      </div>
                      {report.description && (
                        <p className="text-[9px] text-slate-400 mt-0.5 ml-5">{report.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 font-mono border-r border-slate-100">
                      <div className="flex items-center gap-1.5 mb-0.5 font-sans">
                        <ReportTypeBadge type={report.report_type} />
                        {isMultiType(report.report_type) && (
                          <span className="text-[9px] text-slate-400">{report.function_names.length} functions</span>
                        )}
                      </div>
                      {isMultiType(report.report_type) ? (
                        <ol className="space-y-0.5">
                          {report.function_names.map((name, i) => (
                            <li key={`${name}-${i}`}>
                              <span className="text-slate-400">{i + 1}.</span> {report.schema_name}.{name}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <span>{report.schema_name}.{report.function_names[0] || report.function_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {(report.section_ids || (report.section ? [report.section] : [])).map((sec, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold">
                            {sec}
                          </span>
                        ))}
                        {!(report.section_ids?.length || report.section) && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        report.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {report.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => { setEditItem(report); setShowForm(true); }}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                        <button type="button" onClick={() => handleToggleStatus(report)}
                          className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded border transition-all ${
                            report.is_active
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}>
                          <Power size={9} /> {report.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(report)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-[8px] font-bold rounded hover:bg-red-100 transition-all">
                          <Trash2 size={9} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-80">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Remove Report Registration?</h3>
            <p className="text-xs text-slate-500 mb-1">
              This will remove the report configuration for:
            </p>
            <p className="text-xs font-bold text-slate-700 mb-3">"{confirmDelete.report_name}"</p>
            <p className="text-[9px] text-amber-600 bg-amber-50 p-2 rounded mb-4">
              Note: The PostgreSQL {confirmDelete.function_names.length > 1 ? 'functions' : 'function'} ({confirmDelete.function_names.map(n => `${confirmDelete.schema_name}.${n}`).join(', ')}) will NOT be affected.
              Only the report registration is removed.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                Cancel
              </button>
              <button type="button" onClick={() => handleDelete(confirmDelete.id)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <FunctionReportFormModal
          item={editItem}
          availableFunctions={availableFunctions}
          sections={sections}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   FORM MODAL — Register / Edit Function Report
   ══════════════════════════════════════════════════════════ */
const validationSchema = Yup.object().shape({
  report_name: Yup.string().required('Report name is required'),
});

const FunctionReportFormModal = ({ item, availableFunctions, sections, onClose, onSaved }) => {
  const [functionParams, setFunctionParams] = useState([]);
  const [loadingParams, setLoadingParams] = useState(false);
  const [paramConfig, setParamConfig] = useState(() => {
    // Parse param_config — it may come as a JSON string from the API
    let config = item?.param_config || [];
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
      return { ...p, dropdown_options: Array.isArray(opts) ? opts : undefined };
    });
  });
  const [selectedSections, setSelectedSections] = useState(() => {
    // Support both old single-section and new multi-section format
    if (item?.section_ids && Array.isArray(item.section_ids)) return item.section_ids;
    if (item?.sections && Array.isArray(item.sections)) return item.sections.map(s => s.section_id || s);
    if (item?.section) return [item.section];
    return [];
  });
  const isEdit = !!item;

  // ── Report type + ordered function selection ("schema.fn" strings) ──
  const [reportType, setReportType] = useState(() => getReportType(item));
  const [selectedFunctions, setSelectedFunctions] = useState(() =>
    item ? getFunctionNames(item).map(n => `${item.schema_name}.${n}`) : []
  );
  const [compatible, setCompatible] = useState([]);
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [compatError, setCompatError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [pendingType, setPendingType] = useState(null); // type awaiting confirmation (multi -> single)
  const [serverError, setServerError] = useState('');
  const paramsReqId = useRef(0);

  const isMulti = isMultiType(reportType);
  const firstFn = selectedFunctions[0] || '';
  const { schema: firstSchema, fn: firstName } = splitFullName(firstFn);

  const typeRulesMet = isMulti ? selectedFunctions.length >= 2 : selectedFunctions.length === 1;
  const typeRuleMessage = (() => {
    if (typeRulesMet) return '';
    if (isMulti) {
      return selectedFunctions.length === 0
        ? 'Select the first function, then add at least one more (minimum 2 functions)'
        : 'Add at least one more function (minimum 2 functions)';
    }
    return selectedFunctions.length === 0
      ? 'Select a function'
      : 'A single report must have exactly one function';
  })();

  const availableToAdd = compatible.filter(c => {
    const schema = c.schema_name || firstSchema;
    return schema === firstSchema && !selectedFunctions.includes(`${schema}.${c.function_name}`);
  });

  // Load params for a function. replaceConfig=true always rebuilds param_config
  // (used when the user picks a different first function).
  const loadParams = async (schemaName, functionName, { replaceConfig = false } = {}) => {
    if (!schemaName || !functionName) return;
    const reqId = ++paramsReqId.current;
    setLoadingParams(true);
    try {
      const res = await fetchFunctionParameters(schemaName, functionName);
      if (reqId !== paramsReqId.current) return; // a newer request superseded this one
      const params = Array.isArray(res) ? res : res?.data || [];
      setFunctionParams(params);
      if (replaceConfig || paramConfig.length === 0) {
        setParamConfig(params.map(p => ({
          param_name: p.parameter_name,
          display_label: p.parameter_name.replace(/^p_/, '').replace(/_/g, ' '),
          input_type: guessInputType(p.data_type),
          is_required: true,
          default_value: p.parameter_default || '',
          pg_type: p.data_type,
        })));
      }
    } catch (e) {
      console.error('Failed to load function params:', e);
    } finally {
      if (reqId === paramsReqId.current) setLoadingParams(false);
    }
  };

  useEffect(() => {
    if (item?.schema_name) {
      const first = getFunctionNames(item)[0];
      if (first) loadParams(item.schema_name, first);
    }
  }, []);

  // Compatible functions for multi types — reload whenever the first function changes
  useEffect(() => {
    if (!isMulti || !firstSchema || !firstName) {
      setCompatible([]);
      setCompatError('');
      setLoadingCompat(false);
      return undefined;
    }
    let cancelled = false;
    setLoadingCompat(true);
    setCompatError('');
    fetchCompatibleFunctions(firstSchema, firstName)
      .then(res => {
        if (cancelled) return;
        setCompatible(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(e => {
        if (cancelled) return;
        setCompatible([]);
        setCompatError(e?.response?.data?.message || 'Failed to load compatible functions');
      })
      .finally(() => {
        if (!cancelled) setLoadingCompat(false);
      });
    return () => { cancelled = true; };
  }, [isMulti, firstFn]);

  // User picked a (different) first function: other selections are cleared, params reloaded
  const handleFirstFunctionChange = (fullName) => {
    setServerError('');
    setAddOpen(false);
    setSelectedFunctions(fullName ? [fullName] : []);
    setParamConfig([]);
    if (fullName) {
      const { schema, fn } = splitFullName(fullName);
      loadParams(schema, fn, { replaceConfig: true });
    } else {
      paramsReqId.current += 1; // drop any in-flight request
      setLoadingParams(false);
      setFunctionParams([]);
    }
  };

  const handleAddFunction = (c) => {
    const schema = c.schema_name || firstSchema;
    setSelectedFunctions(prev => [...prev, `${schema}.${c.function_name}`]);
    setServerError('');
    setAddOpen(false);
  };

  const moveFunction = (index, direction) => {
    setSelectedFunctions(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setServerError('');
  };

  const removeFunction = (index) => {
    setSelectedFunctions(prev => prev.filter((_, i) => i !== index));
    setServerError('');
  };

  const applyReportType = (type) => {
    setReportType(type);
    setPendingType(null);
    setServerError('');
    setAddOpen(false);
    // multi -> single keeps only the first function; single -> multi keeps the current one
    if (!isMultiType(type)) setSelectedFunctions(prev => prev.slice(0, 1));
  };

  const handleReportTypeChange = (type) => {
    if (type === reportType) return;
    if (!isMultiType(type) && selectedFunctions.length > 1) {
      setPendingType(type); // ask before dropping functions
      return;
    }
    applyReportType(type);
  };

  const guessInputType = (pgType) => {
    if (!pgType) return 'text';
    const t = pgType.toLowerCase();
    if (t.includes('date') && t.includes('time')) return 'datetime';
    if (t.includes('date')) return 'date';
    if (t.includes('int') || t.includes('numeric') || t.includes('float') || t.includes('double')) return 'number';
    if (t.includes('bool')) return 'boolean';
    return 'text';
  };

  const handleSectionToggle = (sectionValue) => {
    setSelectedSections(prev => {
      const exists = prev.includes(sectionValue);
      return exists ? prev.filter(s => s !== sectionValue) : [...prev, sectionValue];
    });
  };

  const handleSelectAllSections = () => {
    const allValues = AVAILABLE_SECTIONS.map(s => s.value);
    setSelectedSections(allValues);
  };

  const handleClearSections = () => {
    setSelectedSections([]);
  };

  const initialValues = {
    report_name: item?.report_name || '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    if (!typeRulesMet) {
      setServerError(typeRuleMessage);
      setSubmitting(false);
      return;
    }
    if (selectedSections.length === 0) {
      showError('Please select at least one section');
      setSubmitting(false);
      return;
    }
    try {
      // All functions share the first function's schema; names are sent in order, comma-separated
      const schema_name = firstSchema;
      const function_name = selectedFunctions.map(f => splitFullName(f).fn).join(',');
      const payload = {
        report_name: values.report_name,
        report_type: reportType,
        schema_name,
        function_name,
        section_ids: selectedSections,
        // Keep backward compatibility - send primary section
        section: selectedSections[0] || '',
        description: values.description,
        is_active: values.is_active,
        param_config: paramConfig,
      };

      let res;
      if (isEdit) {
        res = await updateFunctionReport(item.id, payload);
      } else {
        res = await createFunctionReport(payload);
      }

      if (res?.success) {
        showSuccess(isEdit ? 'Report updated' : 'Report registered successfully');
        onSaved(payload);
      } else {
        setServerError(res?.message || 'Operation failed');
      }
    } catch (e) {
      // Backend rule violations return 400 { success:false, message } — show it as-is
      setServerError(e?.response?.data?.message || e?.message || 'Operation failed');
    }
    setSubmitting(false);
  };

  const updateParamConfig = (index, field, value) => {
    setParamConfig(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Initialize dropdown_options when switching to 'select' type
      if (field === 'input_type' && value === 'select' && (!updated[index].dropdown_options || updated[index].dropdown_options.length === 0)) {
        updated[index].dropdown_options = [{ label: '', value: '' }];
      }
      return updated;
    });
  };

  const addDropdownOption = (paramIndex) => {
    setParamConfig(prev => {
      const updated = [...prev];
      const options = updated[paramIndex].dropdown_options || [];
      updated[paramIndex] = {
        ...updated[paramIndex],
        dropdown_options: [...options, { label: '', value: '' }],
      };
      return updated;
    });
  };

  const removeDropdownOption = (paramIndex, optionIndex) => {
    setParamConfig(prev => {
      const updated = [...prev];
      const options = [...(updated[paramIndex].dropdown_options || [])];
      options.splice(optionIndex, 1);
      updated[paramIndex] = { ...updated[paramIndex], dropdown_options: options };
      return updated;
    });
  };

  const updateDropdownOption = (paramIndex, optionIndex, field, value) => {
    setParamConfig(prev => {
      const updated = [...prev];
      const options = [...(updated[paramIndex].dropdown_options || [])];
      options[optionIndex] = { ...options[optionIndex], [field]: value };
      updated[paramIndex] = { ...updated[paramIndex], dropdown_options: options };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-violet-600" />
            <h2 className="text-sm font-bold text-slate-700">
              {isEdit ? 'Edit Report Registration' : 'Register Function Report'}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X size={14} />
          </button>
        </div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, errors, touched }) => (
            <Form className="p-5 space-y-4">
              {/* Report Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Report Name *</label>
                <Field name="report_name" placeholder="e.g. Draw Production Report"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                {errors.report_name && touched.report_name && (
                  <p className="text-red-500 text-[9px]">{errors.report_name}</p>
                )}
              </div>

              {/* Report Type */}
              <fieldset className="flex flex-col gap-1">
                <legend className="text-[10px] font-bold text-slate-700 uppercase mb-1">Report Type *</legend>
                <div className="grid grid-cols-3 gap-2">
                  {REPORT_TYPE_OPTIONS.map(opt => {
                    const checked = reportType === opt.value;
                    return (
                      <label key={opt.value}
                        className={`flex flex-col gap-0.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-violet-500/30
                          ${checked
                            ? 'bg-violet-50 border-violet-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                        <span className="flex items-center gap-2">
                          <input type="radio" name="report_type" value={opt.value} checked={checked}
                            onChange={() => handleReportTypeChange(opt.value)}
                            className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span className="text-[11px] font-bold text-slate-700">{opt.label}</span>
                        </span>
                        <span className="text-[9px] text-slate-500 pl-5">{opt.description}</span>
                      </label>
                    );
                  })}
                </div>
                {pendingType && (
                  <div role="alertdialog" aria-label="Confirm report type change"
                    className="mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
                    <p className="text-[10px] text-amber-800">
                      Switching to Single keeps only <strong className="font-mono">{firstFn}</strong> and
                      removes the other {selectedFunctions.length - 1} function(s).
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button" onClick={() => setPendingType(null)}
                        className="px-2.5 py-1 text-[9px] font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="button" onClick={() => applyReportType(pendingType)}
                        className="px-2.5 py-1 text-[9px] font-bold text-white bg-amber-600 rounded hover:bg-amber-700">
                        Keep first only
                      </button>
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Function Selection (READ-ONLY from DB) */}
              <div className="flex flex-col gap-1">
                <label htmlFor="first_function" className="text-[10px] font-bold text-slate-700 uppercase">
                  {isMulti ? 'First Function *' : 'PostgreSQL Function *'}{' '}
                  <span className="text-slate-400 normal-case">(existing functions from database)</span>
                </label>
                <select id="first_function" value={firstFn}
                  onChange={(e) => handleFirstFunctionChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none cursor-pointer">
                  <option value="">— Select existing function —</option>
                  {firstFn && !availableFunctions.some(fn => `${fn.schema_name}.${fn.function_name}` === firstFn) && (
                    <option value={firstFn}>{firstFn}</option>
                  )}
                  {availableFunctions.map((fn, i) => (
                    <option key={i} value={`${fn.schema_name}.${fn.function_name}`}>
                      {fn.schema_name}.{fn.function_name}
                    </option>
                  ))}
                </select>
                {isMulti && (
                  <p className="text-[9px] text-slate-500">
                    Its parameters form the single shared parameter form for the whole report.
                    Picking a different first function clears the other selected functions.
                  </p>
                )}
              </div>

              {/* Multi: ordered function list */}
              {isMulti && firstFn && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      Functions in report ({selectedFunctions.length}){' '}
                      <span className="text-slate-400 normal-case">(list order = order in report and Excel)</span>
                    </span>
                    <div className="relative" onKeyDown={(e) => { if (e.key === 'Escape') setAddOpen(false); }}>
                      <button type="button" onClick={() => setAddOpen(o => !o)}
                        aria-haspopup="listbox" aria-expanded={addOpen}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-all">
                        <Plus size={10} /> Add function <ChevronDown size={10} />
                      </button>
                      {addOpen && (
                        <div role="listbox" aria-label="Compatible functions"
                          className="absolute right-0 z-20 mt-1 w-96 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          {loadingCompat ? (
                            <div className="flex items-center gap-2 px-3 py-3 text-[10px] text-slate-400">
                              <Loader2 size={12} className="animate-spin text-violet-500" /> Loading compatible functions...
                            </div>
                          ) : compatError ? (
                            <p role="alert" className="px-3 py-3 text-[10px] text-red-600">{compatError}</p>
                          ) : availableToAdd.length === 0 ? (
                            <p className="px-3 py-3 text-[10px] text-slate-400">No more compatible functions available</p>
                          ) : (
                            availableToAdd.map(c => (
                              <button key={`${c.schema_name}.${c.function_name}`} type="button"
                                role="option" aria-selected="false"
                                onClick={() => handleAddFunction(c)}
                                className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-violet-50 focus:bg-violet-50 outline-none">
                                <span className="block text-xs font-mono font-bold text-slate-700">
                                  {(c.schema_name || firstSchema)}.{c.function_name}
                                </span>
                                {c.arguments && (
                                  <span className="block text-[9px] font-mono text-slate-400 break-all">{c.arguments}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ol className="space-y-1.5">
                    {selectedFunctions.map((full, i) => {
                      const { fn } = splitFullName(full);
                      return (
                        <li key={full} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-violet-100 text-violet-700 text-[9px] font-bold">
                            {i + 1}
                          </span>
                          <span className="flex-1 min-w-0 text-xs font-mono text-slate-700 truncate" title={full}>{full}</span>
                          <button type="button" onClick={() => moveFunction(i, -1)} disabled={i === 0}
                            aria-label={`Move ${fn} up`}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveFunction(i, 1)} disabled={i === selectedFunctions.length - 1}
                            aria-label={`Move ${fn} down`}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => removeFunction(i)}
                            aria-label={`Remove ${fn}`}
                            className="w-6 h-6 flex items-center justify-center rounded text-red-500 hover:bg-red-50">
                            <X size={12} />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {!typeRulesMet && (
                <p className="text-[9px] text-amber-600 font-semibold -mt-2">{typeRuleMessage}</p>
              )}

              {/* Section - Multi-Select */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">
                  Display In (Sections) * <span className="text-slate-400 normal-case">(select where this report should appear)</span>
                </label>
                <p className="text-[9px] text-slate-500">
                  Select one or more sections. Reports with "General" will appear in the Dynamic Reports page.
                </p>

                {/* Select All / Clear */}
                <div className="flex items-center gap-2 mb-1">
                  <button type="button" onClick={handleSelectAllSections}
                    className="text-[9px] font-bold text-violet-600 hover:text-violet-800 uppercase tracking-wider">
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={handleClearSections}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider">
                    Clear
                  </button>
                  {selectedSections.length > 0 && (
                    <span className="ml-auto text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                      {selectedSections.length} selected
                    </span>
                  )}
                </div>

                {/* Section checkboxes grid */}
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SECTIONS.map((sec) => {
                    const isChecked = selectedSections.includes(sec.value);
                    return (
                      <label
                        key={sec.value}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all
                          ${isChecked
                            ? 'bg-violet-50 border-violet-400 text-violet-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSectionToggle(sec.value)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 
                            focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold">{sec.label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Validation message */}
                {selectedSections.length === 0 && (
                  <p className="text-[9px] text-amber-600 font-semibold mt-1">
                    At least one section must be selected
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Description</label>
                <Field as="textarea" name="description" rows={2} placeholder="Brief description of the report..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none" />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Status:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Field type="checkbox" name="is_active" className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                  <span className="text-xs text-slate-600">Active</span>
                </label>
              </div>

              {/* Parameter Configuration */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <Settings size={12} className="text-slate-500" />
                  <h3 className="text-[10px] font-bold text-slate-700 uppercase">
                    Parameter Configuration
                  </h3>
                  {loadingParams && <Loader2 size={12} className="text-violet-500 animate-spin" />}
                </div>
                <div className="p-3">
                  {paramConfig.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-4">
                      {loadingParams ? 'Loading parameters...' : 'Select a function to see its parameters'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {paramConfig.map((param, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end p-2 bg-slate-50 rounded-lg border border-slate-100">
                          {/* Param Name (read-only) */}
                          <div className="col-span-3">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">DB Param</label>
                            <input readOnly value={param.param_name}
                              className="w-full px-2 py-1.5 text-[10px] bg-slate-200 text-slate-600 border border-slate-200 rounded cursor-default" />
                          </div>
                          {/* Display Label */}
                          <div className="col-span-3">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Display Label</label>
                            <input value={param.display_label}
                              onChange={(e) => updateParamConfig(idx, 'display_label', e.target.value)}
                              className="w-full px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-violet-500/20" />
                          </div>
                          {/* Input Type */}
                          <div className="col-span-2">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Input Type</label>
                            <select value={param.input_type}
                              onChange={(e) => updateParamConfig(idx, 'input_type', e.target.value)}
                              className="w-full px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded outline-none appearance-none cursor-pointer">
                              {PARAM_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          {/* Default Value */}
                          <div className="col-span-2">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Default</label>
                            <input value={param.default_value || ''}
                              onChange={(e) => updateParamConfig(idx, 'default_value', e.target.value)}
                              placeholder="—"
                              className="w-full px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-violet-500/20" />
                          </div>
                          {/* Required */}
                          <div className="col-span-2 flex items-center justify-center pt-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input type="checkbox" checked={param.is_required}
                                onChange={(e) => updateParamConfig(idx, 'is_required', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600" />
                              <span className="text-[8px] font-bold text-slate-500">Required</span>
                            </label>
                          </div>

                          {/* Dropdown Options — only shown when input_type is 'select' */}
                          {param.input_type === 'select' && (
                            <div className="col-span-12 mt-2 p-2.5 bg-violet-50/50 rounded-lg border border-violet-100">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[9px] font-bold text-violet-700 uppercase">
                                  Dropdown Options
                                </label>
                                <button type="button" onClick={() => addDropdownOption(idx)}
                                  className="flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold text-violet-600 bg-violet-100 border border-violet-200 rounded hover:bg-violet-200 transition-all">
                                  <PlusCircle size={10} /> Add Option
                                </button>
                              </div>
                              {(!param.dropdown_options || param.dropdown_options.length === 0) ? (
                                <p className="text-[9px] text-slate-400 text-center py-2">
                                  No options added. Click "Add Option" to define dropdown values.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {param.dropdown_options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input
                                        value={opt.label}
                                        onChange={(e) => updateDropdownOption(idx, optIdx, 'label', e.target.value)}
                                        placeholder="Display Label"
                                        className="flex-1 px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-violet-500/20"
                                      />
                                      <input
                                        value={opt.value}
                                        onChange={(e) => updateDropdownOption(idx, optIdx, 'value', e.target.value)}
                                        placeholder="Value"
                                        className="flex-1 px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-violet-500/20"
                                      />
                                      <button type="button" onClick={() => removeDropdownOption(idx, optIdx)}
                                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-all">
                                        <MinusCircle size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Server-side validation message (shown exactly as returned) */}
              {serverError && (
                <div role="alert" className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {serverError}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting || !typeRulesMet}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all">
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {isEdit ? 'Update Registration' : 'Register Report'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FunctionReportAdmin;
