import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Eye, X, ArrowLeft, Loader2, Search, Power, Palette,
} from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import {
  getFiberColors,
  getFiberColorById,
  createFiberColor,
  updateFiberColor,
} from '../services/fiber_color.api';

/* ══════════════════════════════════════════════════════════
   FIBER COLOR MASTER PANEL (list + create/edit modal + view modal)
   ══════════════════════════════════════════════════════════ */
const FiberColorMasterPanel = ({ onBack }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null); // item pending deactivation

  const fetchRows = async () => {
    setLoading(true);
    try {
      const isActive =
        statusFilter === 'all' ? undefined : statusFilter === 'active';
      const res = await getFiberColors(isActive);
      setRows(res?.data || []);
    } catch (e) {
      console.error(e);
      showError(e?.response?.data?.message || 'Failed to fetch fiber colors');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || r.color?.toLowerCase().includes(q);
  });

  const doToggle = async (item) => {
    try {
      const res = await updateFiberColor(item.fiber_color_id, {
        color: item.color,
        is_active: !item.is_active,
      });
      if (res?.success) {
        showSuccess(res?.message || `${!item.is_active ? 'Activated' : 'Deactivated'} successfully`);
        fetchRows();
      } else {
        showError(res?.message || 'Failed to update status');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggle = (item) => {
    // Confirm before setting an active record to inactive
    if (item.is_active) {
      setConfirmToggle(item);
    } else {
      doToggle(item);
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back to Admin
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sky-600 bg-sky-100">
              <Palette size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Fiber Color Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{rows.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Status filter */}
            <div className="flex items-center gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
              ].map((chip) => (
                <button key={chip.key} type="button" onClick={() => setStatusFilter(chip.key)}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all ${
                    statusFilter === chip.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search color..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Fiber Color
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['#', 'Color', 'Status', 'Created At', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">No fiber colors found</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.fiber_color_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{r.fiber_color_id}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{r.color || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setViewId(r.fiber_color_id)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-[8px] font-bold rounded hover:bg-slate-100 transition-all">
                          <Eye size={9} /> View
                        </button>
                        <button type="button" onClick={() => { setEditId(r.fiber_color_id); setShowForm(true); }}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(r)}
                          className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                            r.is_active
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}>
                          <Power size={9} /> {r.is_active ? 'Deactivate' : 'Activate'}
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

      {/* Create / Edit modal */}
      {showForm && (
        <FiberColorFormModal
          id={editId}
          onClose={() => { setShowForm(false); setEditId(null); }}
          onSaved={() => { setShowForm(false); setEditId(null); fetchRows(); }}
        />
      )}

      {/* View modal */}
      {viewId != null && (
        <FiberColorViewModal id={viewId} onClose={() => setViewId(null)} />
      )}

      {/* Confirm deactivate modal */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-80 text-center p-5">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Power size={18} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Deactivate Fiber Color?</h3>
            <p className="text-xs text-slate-500 mb-4">
              &ldquo;{confirmToggle.color}&rdquo; will be marked inactive and hidden from active lists.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmToggle(null)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button type="button"
                onClick={() => { const item = confirmToggle; setConfirmToggle(null); doToggle(item); }}
                className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
   ══════════════════════════════════════════════════════════ */
const schema = Yup.object({
  color: Yup.string().trim().required('Color is required').max(100, 'Max 100 chars'),
  is_active: Yup.boolean(),
});

const FiberColorFormModal = ({ id, onClose, onSaved }) => {
  const isEdit = id != null;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState({
    color: '',
    is_active: true,
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getFiberColorById(id);
        const d = res?.data || {};
        setInitialValues({
          color: d.color || '',
          is_active: d.is_active ?? true,
        });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load fiber color');
      }
      setLoading(false);
    };
    load();
  }, [id, isEdit]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Create only sends { color }; edit sends { color, is_active }
      const payload = isEdit
        ? { color: values.color.trim(), is_active: !!values.is_active }
        : { color: values.color.trim() };
      const res = isEdit
        ? await updateFiberColor(id, payload)
        : await createFiberColor(payload);
      if (res?.success) {
        showSuccess(res?.message || (isEdit ? 'Fiber color updated' : 'Fiber color created'));
        onSaved();
      } else {
        showError(res?.message || 'Failed to save fiber color');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  const labelCls = 'font-bold text-slate-800 uppercase ml-0.5 text-[9px]';
  const inputCls = 'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Fiber Color' : 'Create Fiber Color'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="px-4 py-4">
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
              {({ values, setFieldValue, errors, touched, validateForm, setTouched, submitForm }) => (
                <Form className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className={labelCls}>Color *</label>
                    <input value={values.color} maxLength={100} autoFocus
                      onChange={(e) => setFieldValue('color', e.target.value)}
                      placeholder="e.g. Blue" className={inputCls} />
                    {errors.color && touched.color && (
                      <p className="text-red-500 text-[8px]">{errors.color}</p>
                    )}
                  </div>

                  {/* Active toggle — edit only (create defaults to active on server) */}
                  {isEdit && (
                    <div className="flex items-center justify-between pt-1">
                      <label className={labelCls}>Status</label>
                      <button type="button" onClick={() => setFieldValue('is_active', !values.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold rounded-full border transition-all ${
                          values.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={10} /> {values.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={onClose}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">
                      Cancel
                    </button>
                    <button type="button" disabled={submitting}
                      onClick={async () => {
                        const validationErrors = await validateForm();
                        if (Object.keys(validationErrors).length > 0) {
                          setTouched(
                            Object.keys(validationErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
                            false
                          );
                          showWarning('Please fix the highlighted fields before saving.');
                          return;
                        }
                        submitForm();
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all
                        ${submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                      {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   VIEW MODAL (read-only)
   ══════════════════════════════════════════════════════════ */
const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    <span className="text-xs font-semibold text-slate-700">{value ?? '—'}</span>
  </div>
);

const FiberColorViewModal = ({ id, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getFiberColorById(id);
        setRecord(res?.data || null);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load fiber color');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">Fiber Color Details</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-blue-500 animate-spin" />
          </div>
        ) : !record ? (
          <div className="px-4 py-10 text-center text-xs text-slate-400">Record not found</div>
        ) : (
          <div className="px-4 py-4 grid grid-cols-2 gap-4">
            <ViewField label="ID" value={record.fiber_color_id} />
            <ViewField label="Status" value={record.is_active ? 'Active' : 'Inactive'} />
            <ViewField label="Color" value={record.color} />
            <ViewField label="Created At" value={record.created_at ? new Date(record.created_at).toLocaleString('en-IN') : '—'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiberColorMasterPanel;
