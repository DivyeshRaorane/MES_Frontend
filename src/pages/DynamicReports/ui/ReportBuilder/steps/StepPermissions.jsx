/**
 * Permissions Component (embedded in wizard or standalone)
 * Assign view/create/update/delete/export permissions by role or user
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Plus, Trash2, Users, UserCircle } from 'lucide-react';
import {
  addPermission, removePermission, updatePermission,
  getRoles, getUsersForPermission,
} from '../../../controller/reportBuilder.slice';

const PERMISSION_FLAGS = ['view', 'create', 'update', 'delete', 'export'];

const StepPermissions = () => {
  const dispatch = useDispatch();
  const { wizard, roles, users, loading } = useSelector((state) => state.reportBuilder);
  const [assignType, setAssignType] = useState('role'); // 'role' | 'user'
  const [selectedEntity, setSelectedEntity] = useState('');

  useEffect(() => {
    if (roles.length === 0) dispatch(getRoles());
    if (users.length === 0) dispatch(getUsersForPermission());
  }, [dispatch, roles.length, users.length]);

  const handleAdd = () => {
    if (!selectedEntity) return;
    // Avoid duplicates
    const exists = wizard.permissions.find(
      (p) => p.type === assignType && p.id === selectedEntity
    );
    if (exists) return;

    const entity = assignType === 'role'
      ? roles.find((r) => r.id === selectedEntity || r.role_name === selectedEntity)
      : users.find((u) => u.id === selectedEntity || u.emp_id === selectedEntity);

    dispatch(addPermission({
      type: assignType,
      id: selectedEntity,
      name: entity?.role_name || entity?.emp_name || entity?.name || selectedEntity,
      view: true,
      create: false,
      update: false,
      delete: false,
      export: true,
    }));
    setSelectedEntity('');
  };

  const handleToggleFlag = (index, flag) => {
    const perm = wizard.permissions[index];
    dispatch(updatePermission({
      index,
      permission: { ...perm, [flag]: !perm[flag] },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-600/20 flex items-center justify-center">
          <Shield size={20} className="text-slate-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Permissions</h2>
          <p className="text-[11px] text-slate-400">
            Assign access permissions by role or individual user.
          </p>
        </div>
      </div>

      {/* Add permission form */}
      <div className="flex items-end gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        {/* Type toggle */}
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Assign To</label>
          <div className="flex gap-1">
            <button
              onClick={() => setAssignType('role')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold border transition-colors
                ${assignType === 'role'
                  ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
            >
              <Users size={11} /> Role
            </button>
            <button
              onClick={() => setAssignType('user')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold border transition-colors
                ${assignType === 'user'
                  ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
            >
              <UserCircle size={11} /> User
            </button>
          </div>
        </div>

        {/* Entity selector */}
        <div className="space-y-1 flex-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">
            {assignType === 'role' ? 'Select Role' : 'Select User'}
          </label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
              focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Select...</option>
            {assignType === 'role'
              ? roles.map((r) => (
                <option key={r.id || r.role_name} value={r.id || r.role_name}>
                  {r.role_name || r.name}
                </option>
              ))
              : users.map((u) => (
                <option key={u.id || u.emp_id} value={u.id || u.emp_id}>
                  {u.emp_name || u.name} ({u.emp_id || u.id})
                </option>
              ))
            }
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedEntity}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold
            text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Permissions table */}
      {wizard.permissions.length > 0 && (
        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-3 py-2.5 text-left text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</th>
                {PERMISSION_FLAGS.map((flag) => (
                  <th key={flag} className="px-3 py-2.5 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    {flag}
                  </th>
                ))}
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {wizard.permissions.map((perm, idx) => (
                <tr key={idx} className="border-t border-slate-800 hover:bg-slate-800/40">
                  <td className="px-3 py-2 text-white font-medium">{perm.name || perm.id}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold
                      ${perm.type === 'role' ? 'bg-blue-900/30 text-blue-300' : 'bg-purple-900/30 text-purple-300'}`}>
                      {perm.type}
                    </span>
                  </td>
                  {PERMISSION_FLAGS.map((flag) => (
                    <td key={flag} className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggleFlag(idx, flag)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors
                          ${perm[flag]
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : 'bg-slate-700 text-slate-600 hover:text-slate-400'
                          }`}
                      >
                        {perm[flag] ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => dispatch(removePermission(idx))}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {wizard.permissions.length === 0 && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Shield size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No permissions configured</p>
          <p className="text-[10px] text-slate-600">
            If no permissions are set, only administrators can access this report.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepPermissions;
