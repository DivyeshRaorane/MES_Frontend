import React, { useState } from 'react';
import { 
  PlusCircle,
  AlertCircle,
  GitBranch,
  LayoutGrid,
  PlayCircle,
  Trash2
} from 'lucide-react';
import PTAllocation from '../pages/ptAllocation/ui/ptAllocation';
import PTRunningTable from '../pages/ptRunnigTable/ui/ptRunningTable';
import Rejected_Spools_In_PT_Allocation from '../pages/rejected_spool_in_pt_allocation/ui/Rejected_Spools_In_PT_Allocation';
import FormHeader from './header_template';

const PTAllocationContainer = () => {
  // State handles three possible views: 'allocation', 'running', 'rejected'
  const [activeTab, setActiveTab] = useState('allocation');

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Level 1 */}
        <FormHeader 
          title="PT Allocation/Deallocation"
          subtitle="MES Production Portal"
          userName="Divyesh"
          userRole="Software Developer"
          icon={GitBranch}
        />

        {/* Header Level 2 - Navigation & Global Actions */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Navigation Tabs - Start Side */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('allocation')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                activeTab === 'allocation' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid size={14} />
              Allocation Table
            </button>
            <button 
              onClick={() => setActiveTab('running')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                activeTab === 'running' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlayCircle size={14} />
              PT Running Table
            </button>
          </div>

          {/* Global Action Buttons - End Side */}
          <div className="flex gap-1.5">
            <button 
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all ${
                activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              <Trash2 size={14} /> Rejected Spool
            </button>
          </div>
        </div>

        {/* RENDER AREA: Dynamic component switching */}
        <main className="p-2 bg-slate-50/30">
          {activeTab === 'allocation' && <PTAllocation />}
          {activeTab === 'running' && <PTRunningTable />}
         {activeTab === 'rejected' && <Rejected_Spools_In_PT_Allocation/>}
        </main>
      </div>
    </div>
  );
};

export default PTAllocationContainer;