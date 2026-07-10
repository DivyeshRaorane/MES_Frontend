import { useState, useEffect } from 'react';
import {
  Users, FlaskConical, Layers, Award, Plus, Edit2, X, ArrowLeft,
  Loader2, Search, Power, Settings,
} from 'lucide-react';
import { FormikInput } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../utils/toastService';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import GradeManagement from './grade_management';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Card configs ── */
const ADMIN_CARDS = [
  {
    key: 'qc_users',
    title: 'Quality Users',
    desc: 'Manage QC operators',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    api: {
      getAll: () => axios.get(`${API}/api/getqcusers`).then(r => r.data),
      create: (data) => axios.post(`${API}/api/admin/qcusers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/api/admin/qcusers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [{ name: 'qc_user_name', label: 'QC User Name', required: true }],
    columns: ['qc_user_id', 'qc_user_name', 'disable', 'created_at'],
    idField: 'qc_user_id',
    nameField: 'qc_user_name',
    statusField: 'disable',
  },
  {
    key: 'd2_chambers',
    title: 'D2 Chambers',
    desc: 'Manage D2 aging chambers',
    icon: FlaskConical,
    color: 'text-indigo-600 bg-indigo-100',
    api: {
      getAll: () => axios.get(`${API}/api/getd2chambers`).then(r => r.data),
      create: (data) => axios.post(`${API}/api/admin/d2chambers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/api/admin/d2chambers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [{ name: 'd2_chamber_no', label: 'Chamber Number', required: true, type: 'number' }],
    columns: ['d2_chamber_id', 'd2_chamber_no', 'is_active', 'created_at'],
    idField: 'd2_chamber_id',
    nameField: 'd2_chamber_no',
    statusField: 'is_active',
    statusInverted: true, // is_active=true means enabled
  },
  {
    key: 'h2_chambers',
    title: 'H2 Chambers',
    desc: 'Manage H2 aging chambers',
    icon: Layers,
    color: 'text-emerald-600 bg-emerald-100',
    api: {
      getAll: () => axios.get(`${API}/api/geth2chambers?is_active=true`).then(r => r.data),
      create: (data) => axios.post(`${API}/api/createh2chamber`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/api/admin/h2chambers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [{ name: 'h2_chamber_no', label: 'Chamber Number', required: true, type: 'number' }],
    columns: ['h2_chamber_id', 'h2_chamber_no', 'is_active', 'created_at'],
    idField: 'h2_chamber_id',
    nameField: 'h2_chamber_no',
    statusField: 'is_active',
    statusInverted: true,
  },
  {
    key: 'grades',
    title: 'Grade Management',
    desc: 'Manage QC grade definitions',
    icon: Award,
    color: 'text-amber-600 bg-amber-100',
    api: {
      getAll: () => axios.get(`${API}/api/admin/grades`).then(r => r.data),
      create: (data) => axios.post(`${API}/api/admin/grades`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/api/admin/grades/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'grade_name', label: 'Grade Name', required: true },
      { name: 'priority', label: 'Priority (1=highest)', required: true, type: 'number' },
    ],
    columns: ['grade_id', 'grade_name', 'priority', 'disable', 'created_at'],
    idField: 'grade_id',
    nameField: 'grade_name',
    statusField: 'disable',
  },
];

/* ══════════════════════════════════════════════════════════ */
const QualityAdmin = () => {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard && activeCard.key === 'grades') {
    return <GradeManagement onBack={() => setActiveCard(null)} />;
  }

  if (activeCard) {
    return <CrudPanel config={activeCard} onBack={() => setActiveCard(null)} />;
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-slate-600" />
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quality Admin</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage quality module configurations</p>
        </div>
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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await config.api.getAll();
      setItems(res?.data || res || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(item => {
    const s = search.toLowerCase();
    return !s || Object.values(item).some(v => String(v).toLowerCase().includes(s));
  });

  const handleToggleStatus = async (item) => {
    const field = config.statusField || 'disable';
    const inverted = config.statusInverted; // if true, true=enabled
    const currentVal = item[field];
    const newVal = !currentVal;
    const payload = { ...item, [field]: newVal };
    delete payload[config.idField];
    delete payload.created_at;
    try {
      const res = await config.api.update(item[config.idField], payload);
      if (res?.success) {
        const label = inverted
          ? (newVal ? 'Enabled' : 'Disabled')
          : (newVal ? 'Disabled' : 'Enabled');
        showSuccess(`${label} successfully`);
        fetchItems();
      } else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  const Icon = config.icon;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.color}`}><Icon size={14} /></div>
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

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={18} className="text-blue-500 animate-spin" /></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {config.columns.map(col => (
                  <th key={col} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">{col.replace(/_/g, ' ')}</th>
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
                      {(col === 'is_active' || col === 'disable') ? (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          col === 'disable'
                            ? (item[col] ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')
                            : (item[col] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                        }`}>
                          {col === 'disable' ? (item[col] ? 'Disabled' : 'Enabled') : (item[col] ? 'Active' : 'Inactive')}
                        </span>
                      ) : col === 'created_at' ? (
                        <span className="text-[9px] text-slate-400">{item[col] ? new Date(item[col]).toLocaleDateString('en-IN') : '—'}</span>
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
                      <button type="button" onClick={() => handleToggleStatus(item)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          (config.statusInverted ? !item[config.statusField] : item[config.statusField])
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={9} /> {(config.statusInverted ? !item[config.statusField] : item[config.statusField]) ? 'Enable' : 'Disable'}
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
        <CrudFormModal config={config} item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchItems(); }} />
      )}
    </div>
  );
};

/* ── Generic Form Modal ── */
const CrudFormModal = ({ config, item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object(
    config.fields.reduce((acc, f) => {
      if (f.required) acc[f.name] = Yup.string().required(`${f.label} is required`);
      else acc[f.name] = Yup.string();
      return acc;
    }, {})
  );

  const initVals = config.fields.reduce((acc, f) => {
    acc[f.name] = item?.[f.name] || '';
    return acc;
  }, {});

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        const payload = { ...values };
        if (config.statusField && item[config.statusField] !== undefined) {
          payload[config.statusField] = item[config.statusField];
        }
        res = await config.api.update(item[config.idField], payload);
      } else {
        res = await config.api.create(values);
      }
      if (res?.success) { showSuccess(isEdit ? 'Updated successfully' : 'Created successfully'); onSaved(); }
      else showError(res?.message || 'Operation failed');
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
            <Form className="flex flex-col gap-3">
              {config.fields.map(f => (
                <FormikInput key={f.name} compact label={f.label} name={f.name} type={f.type || 'text'} placeholder={f.label} />
              ))}
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

export default QualityAdmin;
