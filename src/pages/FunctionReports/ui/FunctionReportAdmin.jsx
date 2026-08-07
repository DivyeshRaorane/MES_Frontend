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
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Search, Plus, Edit2, Power, Trash2, Loader2,
  Database, FileText, Settings, X, RefreshCw, Info,
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
} from '../services/functionReports.api';

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
      const normalized = list.map(r => ({
        ...r,
        section_ids: r.section_ids || (r.section ? [r.section] : []),
      }));
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
                      {report.schema_name}.{report.function_name}
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
              Note: The PostgreSQL function ({confirmDelete.schema_name}.{confirmDelete.function_name}) will NOT be affected.
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
  function_full_name: Yup.string().required('Please select a function'),
});

const FunctionReportFormModal = ({ item, availableFunctions, sections, onClose, onSaved }) => {
  const [functionParams, setFunctionParams] = useState([]);
  const [loadingParams, setLoadingParams] = useState(false);
  const [paramConfig, setParamConfig] = useState(item?.param_config || []);
  const [selectedSections, setSelectedSections] = useState(() => {
    // Support both old single-section and new multi-section format
    if (item?.section_ids && Array.isArray(item.section_ids)) return item.section_ids;
    if (item?.sections && Array.isArray(item.sections)) return item.sections.map(s => s.section_id || s);
    if (item?.section) return [item.section];
    return [];
  });
  const isEdit = !!item;

  // Load params when editing or when function changes
  const loadParams = async (schemaName, functionName) => {
    if (!schemaName || !functionName) return;
    setLoadingParams(true);
    try {
      const res = await fetchFunctionParameters(schemaName, functionName);
      const params = Array.isArray(res) ? res : res?.data || [];
      setFunctionParams(params);
      // Auto-populate param config if not already set
      if (paramConfig.length === 0 && params.length > 0) {
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
    }
    setLoadingParams(false);
  };

  useEffect(() => {
    if (item?.schema_name && item?.function_name) {
      loadParams(item.schema_name, item.function_name);
    }
  }, []);

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
    function_full_name: item ? `${item.schema_name}.${item.function_name}` : '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (selectedSections.length === 0) {
      showError('Please select at least one section');
      setSubmitting(false);
      return;
    }
    try {
      const [schema_name, function_name] = values.function_full_name.split('.');
      const payload = {
        report_name: values.report_name,
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
        showError(res?.message || 'Operation failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Operation failed');
    }
    setSubmitting(false);
  };

  const handleFunctionChange = (e, setFieldValue) => {
    const fullName = e.target.value;
    setFieldValue('function_full_name', fullName);
    if (fullName) {
      const [schema, fn] = fullName.split('.');
      setParamConfig([]);
      loadParams(schema, fn);
    } else {
      setFunctionParams([]);
      setParamConfig([]);
    }
  };

  const updateParamConfig = (index, field, value) => {
    setParamConfig(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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
          {({ isSubmitting, setFieldValue, errors, touched }) => (
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

              {/* Function Selection (READ-ONLY from DB) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">
                  PostgreSQL Function * <span className="text-slate-400 normal-case">(existing functions from database)</span>
                </label>
                <Field as="select" name="function_full_name"
                  onChange={(e) => handleFunctionChange(e, setFieldValue)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none cursor-pointer">
                  <option value="">— Select existing function —</option>
                  {availableFunctions.map((fn, i) => (
                    <option key={i} value={`${fn.schema_name}.${fn.function_name}`}>
                      {fn.schema_name}.{fn.function_name}
                    </option>
                  ))}
                </Field>
                {errors.function_full_name && touched.function_full_name && (
                  <p className="text-red-500 text-[9px]">{errors.function_full_name}</p>
                )}
              </div>

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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
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
