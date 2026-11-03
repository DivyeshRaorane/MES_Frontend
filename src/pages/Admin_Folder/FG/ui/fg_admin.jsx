import { useState } from 'react';
import { Settings, Grid3X3, Users, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import TrayManagement from '../tray_management/ui/tray_management';
import { CrudPanel } from '../../quality_admin/ui/quality_admin';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Card configs ── */
const ADMIN_CARDS = [
  {
    key: 'fg_users',
    title: 'FG Users',
    desc: 'Manage FG operators',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-100',
    // Same generic list + form as Quality Admin → Quality Users.
    api: {
      getAll: () => axios.get(`${API}/getfgusers`, { headers: authHeaders() }).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/fgusers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/fgusers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'emp_id', label: 'Employee ID' },
      { name: 'fg_user_name', label: 'FG User Name', required: true },
    ],
    columns: ['fg_user_id', 'emp_id', 'fg_user_name', 'is_active', 'created_at'],
    idField: 'fg_user_id',
    nameField: 'fg_user_name',
    statusField: 'is_active',
    statusInverted: true, // is_active=true means enabled
  },
  {
    key: 'tray_management',
    title: 'Tray Management',
    desc: 'Manage FG trays & positions',
    icon: Grid3X3,
    color: 'text-blue-600 bg-blue-100',
  },
];

/* ══════════════════════════════════════════════════════════ */
const FGAdmin = () => {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard?.key === 'tray_management') {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-4 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <button type="button" onClick={() => setActiveCard(null)}
            className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
            <ArrowLeft size={11} /> Back to FG Admin
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TrayManagement />
        </div>
      </div>
    );
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
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">FG Admin</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage finished goods module configurations</p>
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

export default FGAdmin;
