import React, { useState } from 'react';
import { GitBranch, LayoutGrid, PlayCircle, Trash2 } from 'lucide-react';
import PTAllocation from '../pages/ptAllocation/ui/ptAllocation';
import PTRunningTable from '../pages/ptRunnigTable/ui/ptRunningTable';
import Rejected_Spools_In_PT_Allocation from '../pages/rejected_spool_in_pt_allocation/ui/Rejected_Spools_In_PT_Allocation';
import FormHeader from './header_template';

const TABS = [
  { key: 'allocation', label: 'Allocation Table',  icon: LayoutGrid,  color: 'blue'  },
  { key: 'running',    label: 'PT Running Table',   icon: PlayCircle,  color: 'blue'  },
  { key: 'rejected',   label: 'Rejected Spool',     icon: Trash2,      color: 'rose'  },
];

const PTAllocationContainer = () => {
  const [activeTab, setActiveTab] = useState('allocation');

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden m-2">

        {/* ── Level 1 Header ── */}
        <FormHeader
          title="PT Allocation / Deallocation"
          subtitle="MES Production Portal"
          userName="Divyesh"
          userRole="Software Developer"
          icon={GitBranch}
        />

        {/* ── Level 2 Tab Bar ── */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex gap-2">
            {TABS.map(({ key, label, icon: Icon, color }) => {
              const isActive = activeTab === key;
              const activeClass = color === 'rose'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-blue-600 text-white shadow-md';
              const inactiveClass = color === 'rose'
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'text-slate-600 hover:bg-slate-200';
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${isActive ? activeClass : inactiveClass}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Render Area — fills remaining height ── */}
        <div className="flex-1 overflow-hidden p-3 bg-slate-50/30">
          {activeTab === 'allocation' && <PTAllocation />}
          {activeTab === 'running'    && <PTRunningTable />}
          {activeTab === 'rejected'   && <Rejected_Spools_In_PT_Allocation />}
        </div>

      </div>
    </div>
  );
};

export default PTAllocationContainer;
