import { useState, useEffect } from 'react';
import { Plus, Edit2, X, ArrowLeft, Loader2, Search, Power, Layers, Trash2, Link } from 'lucide-react';
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

const ProcessTypePanel = ({ onBack }) => {
  const [processTypes, setProcessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showMapping, setShowMapping] = useState(null); // holds selected process_type item

  const fetchProcessTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/process-types`, { headers: authHeaders() });
      setProcessTypes(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProcessTypes(); }, []);

  const filtered = processTypes.filter(p => {
    const q = search.toLowerCase();
    return !q || String(p.process_type)?.includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/admin/process-types/${item.process_type_id}`, {
        process_type: item.process_type,
        is_active: !item.is_active,
      }, { headers: authHeaders() });
      if (res.data?.success) {
        showSuccess(`${item.is_active ? 'Deactivated' : 'Activated'} successfully`);
        fetchProcessTypes();
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-600 bg-violet-100">
              <Layers size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Process Type</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{processTypes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Process Type
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
                {['ID', 'Process Type', 'Status', 'Created At', 'Mappings', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No process types found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.process_type_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{p.process_type_id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{p.process_type}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <button type="button" onClick={() => setShowMapping(p)}
                      className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-200 text-[8px] font-bold rounded hover:bg-violet-100 transition-all">
                      <Link size={9} /> Preform Mapping
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(p); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(p)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          p.is_active ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}>
                        <Power size={9} /> {p.is_active ? 'Deactivate' : 'Activate'}
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
        <ProcessTypeFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchProcessTypes(); }}
        />
      )}

      {showMapping && (
        <PreformMappingModal
          processType={showMapping}
          onClose={() => setShowMapping(null)}
        />
      )}
    </div>
  );
};

/* ── Process Type Form Modal ── */
const ProcessTypeFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    process_type: Yup.number().required('Process type number is required').integer('Must be integer'),
  });

  const initVals = {
    process_type: item?.process_type ?? '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      const payload = { process_type: Number(values.process_type), is_active: item?.is_active ?? true };
      if (isEdit) {
        res = await axios.put(`${API}/admin/process-types/${item.process_type_id}`, payload, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/admin/process-types`, payload, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Process type updated' : 'Process type created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Process Type' : 'Create Process Type'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Process Type (Number) *" name="process_type" type="number" placeholder="e.g. 1, 2, 3" />
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                <ResetButton compact type="button" onClick={onClose}>Cancel</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </SubmitButton>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

/* ── Preform Process Type Mapping Modal ── */
const PreformMappingModal = ({ processType, onClose }) => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPreformType, setNewPreformType] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/process-types/${processType.process_type_id}/mappings`, { headers: authHeaders() });
      setMappings(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMappings(); }, [processType.process_type_id]);

  const handleAdd = async () => {
    if (!newPreformType.trim()) { showError('Enter preform type'); return; }
    setAdding(true);
    try {
      const res = await axios.post(`${API}/admin/process-types/${processType.process_type_id}/mappings`, {
        preform_type: newPreformType.trim(),
      }, { headers: authHeaders() });
      if (res.data?.success) {
        showSuccess('Mapping added');
        setNewPreformType('');
        fetchMappings();
      } else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed to add mapping'); }
    setAdding(false);
  };

  const handleDelete = async (mappingId) => {
    if (!confirm('Remove this mapping?')) return;
    try {
      const res = await axios.delete(`${API}/admin/process-types/mappings/${mappingId}`, { headers: authHeaders() });
      if (res.data?.success) { showSuccess('Mapping removed'); fetchMappings(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-violet-50">
          <div>
            <span className="text-sm font-bold text-slate-700">Preform Mapping</span>
            <p className="text-[9px] text-slate-500">Process Type: <b className="text-violet-700">{processType.process_type}</b></p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-3">
          {/* Add new mapping */}
          <div className="flex items-center gap-2 mb-3">
            <input value={newPreformType} onChange={e => setNewPreformType(e.target.value)}
              placeholder="Preform Type (e.g. G652D)"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-violet-500/30" />
            <button type="button" onClick={handleAdd} disabled={adding}
              className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white text-[9px] font-bold rounded hover:bg-violet-700 disabled:opacity-50 transition-all">
              <Plus size={10} /> {adding ? 'Adding...' : 'Add'}
            </button>
          </div>

          {/* Mapping List */}
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 size={16} className="text-violet-500 animate-spin" /></div>
            ) : mappings.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No mappings yet</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase">Preform Type</th>
                    <th className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappings.map(m => (
                    <tr key={m.mapping_id} className="hover:bg-violet-50/40">
                      <td className="px-3 py-2 text-xs font-bold text-slate-700">{m.preform_type}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => handleDelete(m.mapping_id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-bold rounded hover:bg-rose-100">
                          <Trash2 size={9} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button type="button" onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessTypePanel;
