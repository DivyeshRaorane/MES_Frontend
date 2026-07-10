import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Power, Shield, X, Loader2 } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ModuleCard, FormikInput, FormikSelect } from '../../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../../utils/toastService';
import { getAllUsers, getDepartments, createUser, updateUser, changeUserStatus } from '../service/user_management.api';

const ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'User', value: 'user' },
];

/* ══════════════════════════════════════════════════════════ */
const UserHomeScreen = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  /* ── Load data ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([getAllUsers(), getDepartments()]);
      if (uRes?.success) setUsers(uRes.data || []);
      if (dRes?.success) setDepartments(dRes.data || []);
    } catch (e) { console.error('Load error:', e); }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  /* ── Filter ── */
  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.emp_id?.toLowerCase().includes(s) || u.emp_name?.toLowerCase().includes(s);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = filterStatus === '' || String(u.is_active) === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  /* ── Status toggle ── */
  const handleStatusChange = (user) => {
    const newStatus = !user.is_active;
    setConfirmDialog({
      title: newStatus ? 'Activate User' : 'Deactivate User',
      message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.emp_name}?`,
      onConfirm: async () => {
        try {
          const res = await changeUserStatus(user.emp_id, newStatus);
          if (res?.success) { showSuccess(`User ${newStatus ? 'activated' : 'deactivated'}`); fetchData(); }
          else showError(res?.message || 'Failed');
        } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
        setConfirmDialog(null);
      },
    });
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Top bar ── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">User Management</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{users.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or name..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-44" />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none cursor-pointer">
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none cursor-pointer">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button type="button" onClick={() => { setEditUser(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Create User
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={18} className="text-blue-500 animate-spin" /><span className="text-xs text-slate-400">Loading...</span></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Emp ID','Name','Email','Mobile','Role','Departments','Status','Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No users found</td></tr>
              ) : filtered.map(user => (
                <tr key={user.emp_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{user.emp_id}</td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                        {user.emp_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{user.emp_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-100">{user.emp_mail_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-100">{user.mobile_no}</td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{user.role}</span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {(user.departments || []).map(d => (
                        <span key={d.id} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{d.name || d.d_name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => { setEditUser(user); setShowForm(true); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleStatusChange(user)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          user.is_active ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}>
                        <Power size={9} /> {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
          <Shield size={11} className="text-slate-400" />
          <p className="text-[8px] text-slate-400">Manage users, roles, and department assignments.</p>
        </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      {showForm && (
        <UserFormModal
          user={editUser}
          departments={departments}
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSaved={() => { setShowForm(false); setEditUser(null); fetchData(); }}
        />
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-2">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{confirmDialog.message}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   USER FORM MODAL (Create / Edit)
   ══════════════════════════════════════════════════════════ */
const UserFormModal = ({ user, departments, onClose, onSaved }) => {
  const isEdit = !!user;
  const [submitting, setSubmitting] = useState(false);

  const validationSchema = Yup.object({
    emp_id: Yup.string().required('Employee ID is required'),
    emp_name: Yup.string().required('Name is required'),
    emp_mail_id: Yup.string().email('Invalid email').required('Email is required'),
    mobile_no: Yup.string().required('Mobile is required'),
    role: Yup.string().required('Role is required'),
    password: isEdit ? Yup.string() : Yup.string().min(6, 'Min 6 chars').required('Password is required'),
    selectedDepts: Yup.array().min(1, 'Select at least one department'),
  });

  const initialValues = {
    emp_id: user?.emp_id || '',
    emp_name: user?.emp_name || '',
    emp_mail_id: user?.emp_mail_id || '',
    mobile_no: user?.mobile_no || '',
    role: user?.role || '',
    password: '',
    is_active: user?.is_active ?? true,
    selectedDepts: user?.departments?.map(d => d.id) || [],
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        emp_id: values.emp_id,
        emp_name: values.emp_name,
        emp_mail_id: values.emp_mail_id,
        mobile_no: values.mobile_no,
        role: values.role,
        is_active: values.is_active,
        departments: values.selectedDepts,
      };
      if (values.password) payload.password = values.password;

      let res;
      if (isEdit) {
        res = await updateUser(user.emp_id, payload);
      } else {
        payload.password = values.password;
        res = await createUser(payload);
      }

      if (res?.success) {
        showSuccess(isEdit ? 'User updated successfully' : 'User created successfully');
        onSaved();
      } else { showError(res?.message || 'Operation failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <span className="text-sm font-bold text-slate-700">{isEdit ? `Edit User — ${user.emp_id}` : 'Create New User'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
            {({ values, setFieldValue }) => (
              <Form className="flex flex-col gap-3">
                <ModuleCard compact title="User Details" icon={<Users size={13} className="text-blue-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="Employee ID" name="emp_id" readOnly={isEdit} placeholder="EMP-001" />
                    <FormikInput compact label="Employee Name" name="emp_name" placeholder="Full name" />
                    <FormikInput compact label="Email" name="emp_mail_id" type="email" placeholder="email@company.com" />
                    <FormikInput compact label="Mobile No" name="mobile_no" placeholder="9876543210" />
                    <FormikSelect compact label="Role" name="role" options={ROLES} />
                    <FormikInput compact label={isEdit ? 'New Password (optional)' : 'Password'} name="password" type="password" placeholder="Min 6 chars" />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Departments" icon={<Shield size={13} className="text-indigo-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    {departments.map(dept => (
                      <label key={dept.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        values.selectedDepts.includes(dept.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}>
                        <input type="checkbox" checked={values.selectedDepts.includes(dept.id)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...values.selectedDepts, dept.id]
                              : values.selectedDepts.filter(id => id !== dept.id);
                            setFieldValue('selectedDepts', updated);
                          }}
                          className="w-3.5 h-3.5 accent-indigo-600" />
                        <span className="text-xs font-medium text-slate-700">{dept.d_name}</span>
                      </label>
                    ))}
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Status" icon={<Power size={13} className="text-emerald-600" />}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={values.is_active}
                      onChange={e => setFieldValue('is_active', e.target.checked)}
                      className="w-4 h-4 accent-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">{values.is_active ? 'Active' : 'Inactive'}</span>
                  </label>
                </ModuleCard>

                <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                  <ResetButton compact type="button" onClick={onClose}>Cancel</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
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

export default UserHomeScreen;
