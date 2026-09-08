import { useState, useEffect } from 'react';
import {
  Users, Layers, AlertTriangle, Eye, Plus, Edit2, Trash2, X, ArrowLeft,
  Loader2, Search, Power, Zap,
} from 'lucide-react';
import { ModuleCard, FormikInput } from '../../../../components/common_fields';
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

/* ── Admin Cards Config ── */
const ADMIN_CARDS = [
  {
    key: 'draw_users',
    title: 'Draw Users',
    desc: 'Manage draw tower operators',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    api: {
      getAll: () => axios.get(`${API}/getdrawusers`).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/drawusers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/drawusers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
      delete: (id) => axios.delete(`${API}/admin/drawusers/${id}`, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'emp_id', label: 'Employee ID', required: true },
      { name: 'draw_user_name', label: 'Draw User Name', required: true },
    ],
    columns: ['draw_user_id', 'emp_id', 'draw_user_name', 'is_active', 'created_at'],
    idField: 'draw_user_id',
    nameField: 'draw_user_name',
  },
  {
    key: 'draw_towers',
    title: 'Draw Towers',
    desc: 'Manage draw tower configurations',
    icon: Layers,
    color: 'text-indigo-600 bg-indigo-100',
    api: {
      getAll: () => axios.get(`${API}/admin/drawtowers`).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/drawtowers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/drawtowers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
      delete: (id) => axios.delete(`${API}/admin/drawtowers/${id}`, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'tower_no', label: 'Tower Number', required: true },
      { name: 'furnace_count', label: 'Furnace Count', required: false, type: 'number' },
    ],
    columns: ['tower_id', 'tower_no', 'furnace_count', 'is_active', 'disable', 'created_at'],
    idField: 'tower_id',
    nameField: 'tower_no',
    statusField: 'disable',
  },
  {
    key: 'fiber_cut_indication',
    title: 'Fiber Cut Indication',
    desc: 'Manage fiber cut indication types',
    icon: Zap,
    color: 'text-orange-600 bg-orange-100',
    api: {
      getAll: () => axios.get(`${API}/fiber-cut-indication`, { headers: authHeaders() }).then(r => r.data),
      create: (data) => axios.post(`${API}/fiber-cut-indication`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/fiber-cut-indication/${id}`, data, { headers: authHeaders() }).then(r => r.data),
      delete: (id) => axios.delete(`${API}/fiber-cut-indication/${id}`, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'indication_name', label: 'Indication Name', required: true },
    ],
    columns: ['indication_fiber_cut_id', 'indication_name', 'disable', 'created_at'],
    idField: 'indication_fiber_cut_id',
    nameField: 'indication_name',
    statusField: 'disable',
  },
  {
    key: 'fiber_cut_reason',
    title: 'Fiber Cut Reasons',
    desc: 'Manage fiber cut reason codes',
    icon: AlertTriangle,
    color: 'text-rose-600 bg-rose-100',
    api: {
      getAll: () => axios.get(`${API}/admin/fibercutreasons`).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/fibercutreasons`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/fibercutreasons/${id}`, data, { headers: authHeaders() }).then(r => r.data),
      delete: (id) => axios.delete(`${API}/admin/fibercutreasons/${id}`, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'indication_fiber_cut_id', label: 'Indication', required: true, type: 'select', optionsApi: () => axios.get(`${API}/fiber-cut-indication`, { headers: authHeaders() }).then(r => r.data), optionLabel: 'indication_name', optionValue: 'indication_fiber_cut_id' },
      { name: 'dfcr_name', label: 'Reason Name', required: true },
    ],
    columns: ['dfcr_id', 'indication_name', 'dfcr_name', 'disable', 'created_at'],
    idField: 'dfcr_id',
    nameField: 'dfcr_name',
    statusField: 'disable',
  },
  {
    key: 'winding_observation',
    title: 'Winding Observations',
    desc: 'Manage winding observation types',
    icon: Eye,
    color: 'text-amber-600 bg-amber-100',
    api: {
      getAll: () => axios.get(`${API}/admin/windingobservations`).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/windingobservations`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/windingobservations/${id}`, data, { headers: authHeaders() }).then(r => r.data),
      delete: (id) => axios.delete(`${API}/admin/windingobservations/${id}`, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'w_o_name', label: 'Observation Name', required: true },
    ],
    columns: ['wind_obs_id', 'w_o_name', 'disable', 'created_at'],
    idField: 'wind_obs_id',
    nameField: 'w_o_name',
    statusField: 'disable',
  },
];

/* ══════════════════════════════════════════════════════════ */
const DrawManagementAdmin = () => {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    return <CrudPanel config={activeCard} onBack={() => setActiveCard(null)} />;
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Draw Management — Admin</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Select a module to manage</p>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ADMIN_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <button key={card.key} type="button" onClick={() => setActiveCard(card)}
                  className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all text-center group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{card.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   GENERIC CRUD PANEL
   ══════════════════════════════════════════════════════════ */
const CrudPanel = ({ config, onBack }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await config.api.getAll();
      setItems(res?.data || res || []);
    } catch (e) { console.error('Fetch error:', e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(item => {
    const s = search.toLowerCase();
    return !s || Object.values(item).some(v => String(v).toLowerCase().includes(s));
  });

  const handleDelete = async (id) => {
    try {
      const res = await config.api.delete(id);
      if (res?.success) { showSuccess('Deleted successfully'); fetchItems(); }
      else showError(res?.message || 'Delete failed');
    } catch (e) { showError(e?.response?.data?.message || 'Delete failed'); }
    setConfirmDelete(null);
  };

  const handleToggleStatus = async (item) => {
    const field = config.statusField || 'is_active';
    const currentVal = item[field];
    const newVal = field === 'disable' ? !currentVal : !currentVal;
    const payload = { ...item, [field]: newVal };
    // Remove non-editable fields from payload
    delete payload[config.idField];
    delete payload.created_at;
    try {
      const res = await config.api.update(item[config.idField], payload);
      if (res?.success) { showSuccess(`${newVal ? (field === 'disable' ? 'Disabled' : 'Activated') : (field === 'disable' ? 'Enabled' : 'Deactivated')} successfully`); fetchItems(); }
      else showError(res?.message || 'Status change failed');
    } catch (e) { showError(e?.response?.data?.message || 'Status change failed'); }
  };

  const handleResetCount = async (item) => {
    const payload = { ...item, furnace_count: 0 };
    delete payload[config.idField];
    delete payload.created_at;
    try {
      const res = await config.api.update(item[config.idField], payload);
      if (res?.success) { showSuccess('Furnace count reset to 0'); fetchItems(); }
      else showError(res?.message || 'Reset failed');
    } catch (e) { showError(e?.response?.data?.message || 'Reset failed'); }
  };

  const Icon = config.icon;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.color}`}>
              <Icon size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{config.title}</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={18} className="text-blue-500 animate-spin" /><span className="text-xs text-slate-400">Loading...</span></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {config.columns.map(col => (
                  <th key={col} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-xs text-slate-400">No items found</td></tr>
              ) : filtered.map(item => (
                <tr key={item[config.idField]} className="hover:bg-blue-50/30 transition-colors">
                  {config.columns.map(col => (
                    <td key={col} className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100 last:border-0">
                      {col === 'is_active' || col === 'disable' ? (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          col === 'disable'
                            ? (item[col] ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')
                            : (item[col] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                        }`}>
                          {col === 'disable' ? (item[col] ? 'Disabled' : 'Enabled') : (item[col] ? 'Active' : 'Inactive')}
                        </span>
                      ) : col === 'created_at' ? (
                        <span className="text-[9px] text-slate-400">{item[col] ? new Date(item[col]).toLocaleDateString('en-IN') : '—'}</span>
                      ) : col === 'furnace_count' ? (
                        <span className="font-mono font-bold text-indigo-700">{item[col] ?? 0}</span>
                      ) : (
                        <span className="font-medium">{item[col] ?? '—'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(item); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      {/* Toggle: use 'disable' field if config has statusField, otherwise 'is_active' */}
                      <button type="button" onClick={() => handleToggleStatus(item)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          (config.statusField ? item[config.statusField] : !item.is_active)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={9} /> {(config.statusField ? item[config.statusField] : !item.is_active) ? 'Enable' : 'Disable'}
                      </button>
                      {/* Reset furnace count button (only for towers) */}
                      {config.key === 'draw_towers' && (
                        <button type="button" onClick={() => handleResetCount(item)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold rounded hover:bg-blue-100 transition-all">
                          Reset Count
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <CrudFormModal
          config={config}
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchItems(); }}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80 text-center">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={18} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Delete Item?</h3>
            <p className="text-xs text-slate-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   GENERIC FORM MODAL
   ══════════════════════════════════════════════════════════ */
const CrudFormModal = ({ config, item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);
  const [selectOptions, setSelectOptions] = useState({});

  // Load options for select-type fields
  useEffect(() => {
    const loadSelectOptions = async () => {
      for (const f of config.fields) {
        if (f.type === 'select' && f.optionsApi) {
          try {
            const res = await f.optionsApi();
            const data = res?.data || res || [];
            setSelectOptions(prev => ({ ...prev, [f.name]: data }));
          } catch (e) {
            console.error(`Failed to load options for ${f.name}:`, e);
            setSelectOptions(prev => ({ ...prev, [f.name]: [] }));
          }
        }
      }
    };
    loadSelectOptions();
  }, []);

  const schema = Yup.object(
    config.fields.reduce((acc, f) => {
      if (f.required) acc[f.name] = Yup.string().required(`${f.label} is required`);
      else acc[f.name] = Yup.string();
      return acc;
    }, {})
  );

  const initVals = config.fields.reduce((acc, f) => {
    acc[f.name] = item?.[f.name] !== undefined && item?.[f.name] !== null ? String(item[f.name]) : '';
    return acc;
  }, {});

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Convert select fields with numeric IDs back to numbers
      const payload = { ...values };
      config.fields.forEach(f => {
        if (f.type === 'select' && payload[f.name]) {
          payload[f.name] = Number(payload[f.name]) || payload[f.name];
        }
      });

      let res;
      if (isEdit) {
        res = await config.api.update(item[config.idField], payload);
      } else {
        res = await config.api.create(payload);
      }
      if (res?.success) {
        showSuccess(isEdit ? 'Updated successfully' : 'Created successfully');
        onSaved();
      } else { showError(res?.message || 'Operation failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit' : 'Create'} {config.title}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            {({ setFieldValue, values }) => (
            <Form className="flex flex-col gap-3">
              {config.fields.map(f => {
                if (f.type === 'select') {
                  const opts = selectOptions[f.name] || [];
                  return (
                    <div key={f.name} className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-slate-600 uppercase">{f.label} {f.required && '*'}</label>
                      <select
                        value={values[f.name] || ''}
                        onChange={e => setFieldValue(f.name, e.target.value)}
                        className="border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                      >
                        <option value="">Select {f.label}</option>
                        {opts.map(opt => (
                          <option key={opt[f.optionValue]} value={opt[f.optionValue]}>
                            {opt[f.optionLabel]}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return <FormikInput key={f.name} compact label={f.label} name={f.name} placeholder={f.label} />;
              })}
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

export default DrawManagementAdmin;
