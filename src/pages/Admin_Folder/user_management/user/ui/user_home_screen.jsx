import React, { useState,useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCreationForm from './user_creation_screen';
import { getUsers } from '../service/user.api';
import { useDispatch,useSelector } from 'react-redux';
/* ── Dummy users ── */

/* ── Status badge ── */
const StatusBadge = ({ status }) => (
  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
    status === true   ? 'bg-emerald-100 text-emerald-1000' :
    status === false ? 'bg-rose-100 text-rose-700'       :
                            'bg-amber-100 text-amber-700'
  }`}>{status}</span>
);

/* ── Role badge ── */
const RoleBadge = ({ role }) => (
  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
    {role}
  </span>
);

/* ══════════════════════════════════════════════════════════ */
const UserHomeScreen = () => {
  const navigate = useNavigate();
  const [search,      setSearch]      = useState('');
  const [editUser,    setEditUser]    = useState(null);   // user to edit (null = no popup)
  const [deleteId,    setDeleteId]    = useState(null);   // confirm delete
  const dispatch = useDispatch()

  const {getUsersData,uLoading,uError} = useSelector((state)=> state.getUsers)

  useEffect(()=>{
    dispatch(getUsers())
  },[dispatch])

  console.log("What is the user:", getUsersData)

  /* ── Filtered list ── */
  const filtered = (getUsersData || []).filter(u =>
  u.emp_name?.toLowerCase().includes(search.toLowerCase()) ||
  u.emp_id?.toLowerCase().includes(search.toLowerCase()) ||
  u.role?.toLowerCase().includes(search.toLowerCase()) ||
  u.departments?.some(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )
);

  /* ── Update user ── */
  const handleUpdate = (values) => {
    console.log("values:", values)
    setUsers(prev => prev.map(u =>
      u.emp_id === values.emp_id ? { ...u, ...values } : u
    ));
    setEditUser(null);
  };

  /* ── Delete user ── */
  const handleDelete = (id) => {
    setUsers(prev => prev.filter(u => u.emp_id !== id));
    setDeleteId(null);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Top bar ── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">User Management</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{getUsersData.length} users</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, ID, department..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-56" />
            </div>
            {/* Add user button */}
            <button type="button"
              onClick={() => navigate('/admin/usercreation')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add User
            </button>
          </div>
        </div>

        {/* ── User table ── */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Employee ID','Name','Email','Department','Role','Status','Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No users found</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.emp_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <span className="text-xs font-mono font-bold text-blue-700">{user.emp_id}</span>
                  </td>
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {user.emp_name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 leading-tight">{user.emp_name}</p>
                        <p className="text-[8px] text-slate-400">{user.emp_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 border-r border-slate-100">{user.emp_mail_id}</td>
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <span className="text-xs text-slate-600">{user.department}</span>
                  </td>
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <StatusBadge status={user.is_active} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {/* Update */}
                      <button type="button"
                        onClick={() => setEditUser(user)}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={10} /> Update
                      </button>
                      {/* Delete */}
                      <button type="button"
                        onClick={() => setDeleteId(user.emp_id)}
                        className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold rounded hover:bg-rose-100 transition-all">
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
          <Shield size={11} className="text-slate-400" />
          <p className="text-[8px] text-slate-400">Click Update to edit a user in a popup form. Click Add User to create a new one.</p>
        </div>

      </div>

      {/* ── Update popup — UserCreationForm in popup mode ── */}
      {editUser && (
        <UserCreationForm
          isPopup
          title={`Update User — ${editUser.emp_id}`}
          initialValues={editUser}
          onSubmit={handleUpdate}
          onCancel={() => setEditUser(null)}
        />
      )}

      {/* ── Delete confirmation popup ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Delete User?</h3>
            <p className="text-xs text-slate-500 mb-4">
              This will permanently remove <strong>{deleteId}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserHomeScreen;
