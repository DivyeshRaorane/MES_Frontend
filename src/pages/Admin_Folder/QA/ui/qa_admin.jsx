import { useState } from 'react';
import { Settings, Users } from 'lucide-react';
import axios from 'axios';
import { CrudPanel } from '../../quality_admin/ui/quality_admin';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Card configs ── */
const ADMIN_CARDS = [
  {
    key: 'qa_users',
    title: 'QA Users',
    desc: 'Manage QA operators',
    icon: Users,
    color: 'text-violet-600 bg-violet-100',
    // Same generic list + form as Quality Admin → Quality Users.
    api: {
      getAll: () => axios.get(`${API}/getqausers`, { headers: authHeaders() }).then(r => r.data),
      create: (data) => axios.post(`${API}/admin/qausers`, data, { headers: authHeaders() }).then(r => r.data),
      update: (id, data) => axios.put(`${API}/admin/qausers/${id}`, data, { headers: authHeaders() }).then(r => r.data),
    },
    fields: [
      { name: 'emp_id', label: 'Employee ID' },
      { name: 'qa_user_name', label: 'QA User Name', required: true },
    ],
    columns: ['qa_user_id', 'emp_id', 'qa_user_name', 'is_active', 'created_at'],
    idField: 'qa_user_id',
    nameField: 'qa_user_name',
    statusField: 'is_active',
    statusInverted: true, // is_active=true means enabled
  },
];

/* ══════════════════════════════════════════════════════════ */
const QAAdmin = () => {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    return <CrudPanel config={activeCard} onBack={() => setActiveCard(null)} />;
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-slate-600" />
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wider">QA Admin</h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage quality assurance module configurations</p>
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

export default QAAdmin;
