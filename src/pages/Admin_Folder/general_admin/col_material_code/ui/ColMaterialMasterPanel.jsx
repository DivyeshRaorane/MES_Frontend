import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Eye, X, ArrowLeft, Loader2, Search, Power, Palette,
} from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import {
  getColMaterialCodes,
  getColMaterialCodeById,
  createColMaterialCode,
  updateColMaterialCode,
} from '../services/col_material_code.api';

/* ══════════════════════════════════════════════════════════
   COL MATERIAL MASTER PANEL (list + create/edit modal + view modal)
   ══════════════════════════════════════════════════════════ */
const ColMaterialMasterPanel = ({ onBack }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewId, setViewId] = useState(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const isActive =
        statusFilter === 'all' ? undefined : statusFilter === 'active';
      const res = await getColMaterialCodes(isActive);
      setRows(res?.data || []);
    } catch (e) {
      console.error(e);
      showError(e?.response?.data?.message || 'Failed to fetch records');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      r.product?.toLowerCase().includes(q) ||
      r.color?.toLowerCase().includes(q) ||
      r.material_code?.toLowerCase().includes(q)
    );
  });

  const handleToggle = async (item) => {
    try {
      const res = await updateColMaterialCode(item.col_material_code_id, {
        product: item.product,
        color: item.color,
        material_code: item.material_code,
        is_active: !item.is_active,
      });
      if (res?.success) {
        showSuccess(`${!item.is_active ? 'Activated' : 'Deactivated'} successfully`);
        fetchRows();
      } else {
        showError(res?.message || 'Failed to update status');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to update status');
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-fuchsia-600 bg-fuchsia-100">
              <Palette size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Col Material Master</span>
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Create New
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
                  {['ID', 'Product', 'Color', 'Material Code', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No records found</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.col_material_code_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{r.col_material_code_id}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{r.product || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{r.color || '—'}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-600 border-r border-slate-100">{r.material_code || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setViewId(r.col_material_code_id)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-[8px] font-bold rounded hover:bg-slate-100 transition-all">
                          <Eye size={9} /> View
                        </button>
                        <button type="button" onClick={() => { setEditId(r.col_material_code_id); setShowForm(true); }}
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
        <ColMaterialFormModal
          id={editId}
          onClose={() => { setShowForm(false); setEditId(null); }}
          onSaved={() => { setShowForm(false); setEditId(null); fetchRows(); }}
        />
      )}

      {/* View modal */}
      {viewId != null && (
        <ColMaterialViewModal id={viewId} onClose={() => setViewId(null)} />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
   ══════════════════════════════════════════════════════════ */
const schema = Yup.object({
  product: Yup.string().trim().required('Product is required').max(100, 'Max 100 chars'),
  color: Yup.string().trim().required('Color is required').max(100, 'Max 100 chars'),
  material_code: Yup.string().trim().required('Material Code is required').max(40, 'Max 40 chars'),
  is_active: Yup.boolean(),
});

const ColMaterialFormModal = ({ id, onClose, onSaved }) => {
  const isEdit = id != null;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState({
    product: '',
    color: '',
    material_code: '',
    is_active: true,
  });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getColMaterialCodeById(id);
        const d = res?.data || {};
        setInitialValues({
          product: d.product || '',
          color: d.color || '',
          material_code: d.material_code || '',
          is_active: d.is_active ?? true,
        });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load record');
      }
      setLoading(false);
    };
    load();
  }, [id, isEdit]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        product: values.product.trim(),
        color: values.color.trim(),
        material_code: values.material_code.trim(),
        is_active: !!values.is_active,
      };
      const res = isEdit
        ? await updateColMaterialCode(id, payload)
        : await createColMaterialCode(payload);
      if (res?.success) {
        showSuccess(res?.message || (isEdit ? 'Record updated' : 'Record created'));
        onSaved();
      } else {
        showError(res?.message || 'Failed to save record');
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
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Col Material' : 'Create Col Material'}</span>
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
                    <label className={labelCls}>Product *</label>
                    <input value={values.product} maxLength={100}
                      onChange={(e) => setFieldValue('product', e.target.value)}
                      placeholder="e.g. G652D" className={inputCls} />
                    {errors.product && touched.product && (
                      <p className="text-red-500 text-[8px]">{errors.product}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className={labelCls}>Color *</label>
                    <input value={values.color} maxLength={100}
                      onChange={(e) => setFieldValue('color', e.target.value)}
                      placeholder="e.g. Blue" className={inputCls} />
                    {errors.color && touched.color && (
                      <p className="text-red-500 text-[8px]">{errors.color}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className={labelCls}>Material Code *</label>
                    <input value={values.material_code} maxLength={40}
                      onChange={(e) => setFieldValue('material_code', e.target.value)}
                      placeholder="e.g. MC-0001" className={inputCls} />
                    {errors.material_code && touched.material_code && (
                      <p className="text-red-500 text-[8px]">{errors.material_code}</p>
                    )}
                  </div>

                  {/* Active toggle */}
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

const ColMaterialViewModal = ({ id, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getColMaterialCodeById(id);
        setRecord(res?.data || null);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load record');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">Col Material Details</span>
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
            <ViewField label="ID" value={record.col_material_code_id} />
            <ViewField label="Status" value={record.is_active ? 'Active' : 'Inactive'} />
            <ViewField label="Product" value={record.product} />
            <ViewField label="Color" value={record.color} />
            <ViewField label="Material Code" value={record.material_code} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ColMaterialMasterPanel;
