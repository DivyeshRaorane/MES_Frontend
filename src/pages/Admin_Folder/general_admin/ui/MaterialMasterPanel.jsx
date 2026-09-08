import { useState, useEffect } from 'react';
import { Plus, Edit2, X, ArrowLeft, Loader2, Search, Power, Package, Trash2 } from 'lucide-react';
import { FormikInput, FormikSelect } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../utils/toastService';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const MaterialMasterPanel = ({ onBack }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/materials`, { headers: authHeaders() });
      setMaterials(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMaterials(); }, []);

  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    return !q || m.material_code?.toLowerCase().includes(q)
      || m.material_description?.toLowerCase().includes(q)
      || m.material_category?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/admin/materials/${item.material_code}`, {
        ...item,
        is_active: !item.is_active,
      }, { headers: authHeaders() });
      if (res.data?.success) {
        showSuccess(`${item.is_active ? 'Deactivated' : 'Activated'} successfully`);
        fetchMaterials();
      } else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-600 bg-teal-100">
              <Package size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Material Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{materials.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Material
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Material Code', 'Category', 'Description', 'Preform Type', 'Product Type', 'UOM', 'Sample', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">No materials found</td></tr>
              ) : filtered.map(m => (
                <tr key={m.material_code} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{m.material_code}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{m.material_category || '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-700 border-r border-slate-100 max-w-[180px] truncate">{m.material_description || '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{m.preform_type || '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{m.product_type || '—'}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{m.uom || '—'}</td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.is_sample ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.is_sample ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(m); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(m)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          m.is_active ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}>
                        <Power size={9} /> {m.is_active ? 'Deactivate' : 'Activate'}
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

      {showForm && (
        <MaterialFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchMaterials(); }}
        />
      )}
    </div>
  );
};

/* ── Material Form Modal ── */
const MaterialFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    material_code: Yup.string().required('Material code is required'),
    material_category: Yup.string().required('Category is required'),
    material_description: Yup.string().required('Description is required'),
  });

  const initVals = {
    material_code: item?.material_code || '',
    material_category: item?.material_category || '',
    material_description: item?.material_description || '',
    preform_type: item?.preform_type || '',
    product_type: item?.product_type || '',
    uom: item?.uom || '',
    is_sample: item?.is_sample ?? false,
    is_active: item?.is_active ?? true,
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${API}/admin/materials/${item.material_code}`, values, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/admin/materials`, values, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Material updated' : 'Material created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  const CATEGORY_OPTIONS = [
    { value: '', label: 'Select Category' },
    { value: 'RAW_MATERIAL', label: 'Raw Material' },
    { value: 'FINISHED_GOOD', label: 'Finished Good' },
    { value: 'SEMI_FINISHED', label: 'Semi Finished' },
    { value: 'CONSUMABLE', label: 'Consumable' },
  ];

  const UOM_OPTIONS = [
    { value: '', label: 'Select UOM' },
    { value: 'KM', label: 'KM' },
    { value: 'MTR', label: 'MTR' },
    { value: 'NOS', label: 'NOS' },
    { value: 'KG', label: 'KG' },
    { value: 'LTR', label: 'LTR' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Material' : 'Create Material'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            {({ values, setFieldValue }) => (
            <Form className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <FormikInput compact label="Material Code *" name="material_code" placeholder="e.g. MAT001" disabled={isEdit} />
                <FormikSelect compact label="Category *" name="material_category" options={CATEGORY_OPTIONS} />
              </div>
              <FormikInput compact label="Description *" name="material_description" placeholder="Material description" />
              <div className="grid grid-cols-2 gap-3">
                <FormikInput compact label="Preform Type" name="preform_type" placeholder="e.g. G652D" />
                <FormikInput compact label="Product Type" name="product_type" placeholder="e.g. SMFG657A1250" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormikSelect compact label="UOM" name="uom" options={UOM_OPTIONS} />
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={values.is_sample} onChange={e => setFieldValue('is_sample', e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Is Sample
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={values.is_active} onChange={e => setFieldValue('is_active', e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                <ResetButton compact type="button" onClick={onClose}>Cancel</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </SubmitButton>
              </div>
            </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default MaterialMasterPanel;
