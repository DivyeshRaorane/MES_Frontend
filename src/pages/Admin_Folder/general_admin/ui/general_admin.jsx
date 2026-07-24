import { useState, useEffect } from 'react';
import {
  Users, Clock, Plus, Edit2, X, ArrowLeft, Loader2, Search, Power, Settings,
  Package, Layers,
} from 'lucide-react';
import { FormikInput } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../utils/toastService';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import UserHomeScreen from '../../user_management/user/ui/user_home_screen';
import MaterialMasterPanel from './MaterialMasterPanel';
import ProcessTypePanel from './ProcessTypePanel';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const ADMIN_CARDS = [
  {
    key: 'users',
    title: 'User Management',
    desc: 'Manage users, roles & departments',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    component: 'users',
  },
  {
    key: 'shifts',
    title: 'Shift Management',
    desc: 'Manage shift timings',
    icon: Clock,
    color: 'text-emerald-600 bg-emerald-100',
    component: 'shifts',
  },
  {
    key: 'departments',
    title: 'Departments',
    desc: 'Manage department list',
    icon: Settings,
    color: 'text-indigo-600 bg-indigo-100',
    component: 'departments',
  },
  {
    key: 'customers',
    title: 'Customer Master',
    desc: 'Manage customer list',
    icon: Users,
    color: 'text-orange-600 bg-orange-100',
    component: 'customers',
  },
  {
    key: 'bobbin_colors',
    title: 'Bobbin Color',
    desc: 'Manage bobbin color master',
    icon: Settings,
    color: 'text-pink-600 bg-pink-100',
    component: 'bobbin_colors',
  },
  {
    key: 'material_master',
    title: 'Material Master',
    desc: 'Manage material codes & categories',
    icon: Package,
    color: 'text-teal-600 bg-teal-100',
    component: 'material_master',
  },
  {
    key: 'process_type',
    title: 'Process Type',
    desc: 'Manage process types & preform mapping',
    icon: Layers,
    color: 'text-violet-600 bg-violet-100',
    component: 'process_type',
  },
];

/* ══════════════════════════════════════════════════════════ */
const GeneralAdmin = () => {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard === 'users') {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-4 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <button type="button" onClick={() => setActiveCard(null)}
            className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
            <ArrowLeft size={11} /> Back to Admin
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <UserHomeScreen />
        </div>
      </div>
    );
  }

  if (activeCard === 'shifts') {
    return <ShiftPanel onBack={() => setActiveCard(null)} />;
  }

  if (activeCard === 'departments') {
    return <DepartmentPanel onBack={() => setActiveCard(null)} />;
  }

  if (activeCard === 'customers') {
    return <CustomerPanel onBack={() => setActiveCard(null)} />;
  }

  if (activeCard === 'bobbin_colors') {
    return <BobbinColorPanel onBack={() => setActiveCard(null)} />;
  }

  if (activeCard === 'material_master') {
    return <MaterialMasterPanel onBack={() => setActiveCard(null)} />;
  }

  if (activeCard === 'process_type') {
    return <ProcessTypePanel onBack={() => setActiveCard(null)} />;
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-slate-600" />
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">General Admin</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Select a module to manage</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ADMIN_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <button key={card.key} type="button" onClick={() => setActiveCard(card.component)}
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
   SHIFT MANAGEMENT PANEL
   ══════════════════════════════════════════════════════════ */
const ShiftPanel = ({ onBack }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/getshifts`);
      setShifts(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchShifts(); }, []);

  const filtered = shifts.filter(s => {
    const q = search.toLowerCase();
    return !q || s.shift_name?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/api/admin/shifts/${item.shift_id}`, {
        shift_name: item.shift_name,
        shift_start_time: item.shift_start_time,
        shift_end_time: item.shift_end_time,
      }, { headers: authHeaders() });
      if (res.data?.success) { showSuccess('Updated successfully'); fetchShifts(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-100">
              <Clock size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Shift Management</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{shifts.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Shift
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={18} className="text-blue-500 animate-spin" /></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Shift ID', 'Shift Name', 'Start Time', 'End Time', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No shifts found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.shift_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{s.shift_id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{s.shift_name}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-600 border-r border-slate-100">{s.shift_start_time || '—'}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-600 border-r border-slate-100">{s.shift_end_time || '—'}</td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <button type="button" onClick={() => { setEditItem(s); setShowForm(true); }}
                      className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                      <Edit2 size={9} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Shift Form Modal */}
      {showForm && (
        <ShiftFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchShifts(); }}
        />
      )}
    </div>
  );
};

/* ── Shift Form Modal ── */
const ShiftFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    shift_name: Yup.string().required('Shift name is required'),
    shift_start_time: Yup.string().required('Start time is required'),
    shift_end_time: Yup.string().required('End time is required'),
  });
  const initVals = {
    shift_name: item?.shift_name || '',
    shift_start_time: item?.shift_start_time || '',
    shift_end_time: item?.shift_end_time || '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${API}/api/admin/shifts/${item.shift_id}`, values, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/api/admin/shifts`, values, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Shift updated' : 'Shift created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Shift' : 'Create Shift'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Shift Name" name="shift_name" placeholder="e.g. A, B, C" />
              <FormikInput compact label="Start Time" name="shift_start_time" type="time" />
              <FormikInput compact label="End Time" name="shift_end_time" type="time" />
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

/* ══════════════════════════════════════════════════════════
   DEPARTMENT MANAGEMENT PANEL
   ══════════════════════════════════════════════════════════ */
const DepartmentPanel = ({ onBack }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/departments`);
      setDepartments(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchDepts(); }, []);

  const filtered = departments.filter(d => {
    const q = search.toLowerCase();
    return !q || d.d_name?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/api/admin/departments/${item.id}`, {
        d_name: item.d_name,
        disable: !item.disable,
      }, { headers: authHeaders() });
      if (res.data?.success) { showSuccess(`${!item.disable ? 'Disabled' : 'Enabled'} successfully`); fetchDepts(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-100"><Settings size={14} /></div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Departments</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{departments.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Department
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
                {['ID', 'Department Name', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">No departments found</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{d.id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{d.d_name}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${d.disable ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {d.disable ? 'Disabled' : 'Enabled'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(d); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(d)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          d.disable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={9} /> {d.disable ? 'Enable' : 'Disable'}
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
        <DeptFormModal item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchDepts(); }} />
      )}
    </div>
  );
};

/* ── Department Form Modal ── */
const DeptFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({ d_name: Yup.string().required('Department name is required') });
  const initVals = { d_name: item?.d_name || '' };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${API}/api/admin/departments/${item.id}`, { d_name: values.d_name, disable: item.disable ?? false }, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/api/admin/departments`, { d_name: values.d_name }, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Department updated' : 'Department created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Department' : 'Create Department'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Department Name" name="d_name" placeholder="e.g. Draw, Quality" />
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

/* ══════════════════════════════════════════════════════════
   CUSTOMER MASTER PANEL
   ══════════════════════════════════════════════════════════ */
const CustomerPanel = ({ onBack }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/customers`);
      setCustomers(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || c.customer_name?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/api/admin/customers/${item.customer_id}`, {
        customer_name: item.customer_name,
        customer_since: item.customer_since,
        disable: !item.disable,
      }, { headers: authHeaders() });
      if (res.data?.success) { showSuccess(`${!item.disable ? 'Disabled' : 'Enabled'} successfully`); fetchCustomers(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-orange-600 bg-orange-100"><Users size={14} /></div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Customer Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{customers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Customer
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
                {['ID', 'Customer Name', 'Customer Since', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.customer_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{c.customer_id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{c.customer_name}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 border-r border-slate-100">{c.customer_since ? new Date(c.customer_since).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.disable ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.disable ? 'Disabled' : 'Enabled'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(c); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(c)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          c.disable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={9} /> {c.disable ? 'Enable' : 'Disable'}
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
        <CustomerFormModal item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchCustomers(); }} />
      )}
    </div>
  );
};

/* ── Customer Form Modal ── */
const CustomerFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    customer_name: Yup.string().required('Customer name is required'),
  });
  const initVals = {
    customer_name: item?.customer_name || '',
    customer_since: item?.customer_since ? item.customer_since.substring(0, 10) : '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${API}/api/admin/customers/${item.customer_id}`, {
          customer_name: values.customer_name,
          customer_since: values.customer_since || null,
          disable: item.disable ?? false,
        }, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/api/admin/customers`, {
          customer_name: values.customer_name,
          customer_since: values.customer_since || null,
        }, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Customer updated' : 'Customer created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Customer' : 'Create Customer'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Customer Name *" name="customer_name" placeholder="Enter customer name" />
              <FormikInput compact label="Customer Since" name="customer_since" type="date" />
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

/* ══════════════════════════════════════════════════════════
   BOBBIN COLOR PANEL
   ══════════════════════════════════════════════════════════ */
const BobbinColorPanel = ({ onBack }) => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/getbobbincolor`);
      setColors(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchColors(); }, []);

  const filtered = colors.filter(c => {
    const q = search.toLowerCase();
    return !q || c.bobbin_color_name?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/api/admin/bobbincolors/${item.bobbin_color_id}`, {
        bobbin_color_name: item.bobbin_color_name,
        is_disable: !item.is_disable,
      }, { headers: authHeaders() });
      if (res.data?.success) { showSuccess(`${!item.is_disable ? 'Disabled' : 'Enabled'} successfully`); fetchColors(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-pink-600 bg-pink-100"><Settings size={14} /></div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Bobbin Color</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{colors.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Color
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
                {['ID', 'Color Name', 'Status', 'Created At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">No colors found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.bobbin_color_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{c.bobbin_color_id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{c.bobbin_color_name}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.is_disable ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.is_disable ? 'Disabled' : 'Enabled'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => { setEditItem(c); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(c)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          c.is_disable ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}>
                        <Power size={9} /> {c.is_disable ? 'Enable' : 'Disable'}
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
        <BobbinColorFormModal item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchColors(); }} />
      )}
    </div>
  );
};

const BobbinColorFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);
  const schema = Yup.object({ bobbin_color_name: Yup.string().required('Color name is required') });
  const initVals = { bobbin_color_name: item?.bobbin_color_name || '' };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.put(`${API}/api/admin/bobbincolors/${item.bobbin_color_id}`, { bobbin_color_name: values.bobbin_color_name, is_disable: item.is_disable ?? false }, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/api/createbobbincolor`, { bobbin_color_name: values.bobbin_color_name }, { headers: authHeaders() });
      }
      if (res.data?.success) { showSuccess(isEdit ? 'Color updated' : 'Color created'); onSaved(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Color' : 'Create Color'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Color Name *" name="bobbin_color_name" placeholder="e.g. Red, Blue" />
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

export default GeneralAdmin;
