import React, { useState } from 'react';
import { ClipboardList, Rotate3D, Dumbbell, TrendingUp } from 'lucide-react';
import ComplaintRegister from '../pages/customer_complaint/complaintReg/ui/cRegister';
import ComplaintStatusMonitor from '../pages/customer_complaint/complaintTable/ui/complaintTable';
import ComplaintClosure from '../pages/customer_complaint/complaintClosure/ui/complainClosure';

const TABS = [
  { id: 'register',       label: 'Complaint Register',  icon: ClipboardList },
  { id: 'status',       label: 'Complaint Status',        icon: Rotate3D      },
  { id: 'closure',     label: 'Complaint Closure',      icon: Dumbbell      },
];

const CustomerComplaintContainer = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab Bar ── */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Render Area ── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'register'       && <ComplaintRegister />}
          {activeTab === 'status'       && <ComplaintStatusMonitor />}
          {activeTab === 'closure'     && <ComplaintClosure />}
        </div>

      </div>
    </div>
  );
};

export default CustomerComplaintContainer;
