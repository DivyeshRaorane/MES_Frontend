import React, { useState } from 'react';
import { 
  RefreshCcw, 
  Home,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

// Your existing imports
import PTAllocation from '../pages/ptAllocation/ui/ptAllocation';
import PTRunningTable from '../pages/ptRunnigTable/ui/ptRunningTable';

const PTAllocationContainer = () => {
  const [activeTab, setActiveTab] = useState('allocation');

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header Level 1 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">PT ALLOCATION/DEALLOCATION</h1>
        <div className="flex gap-1">
          <button className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-1 rounded-xl text-[11px] flex items-center gap-1 font-medium transition-colors">
            <RefreshCcw size={14} /> Refresh
          </button>
          <button className="bg-white/10 hover:bg-white/15 text-white px-3 py-1 rounded-xl text-[11px] flex items-center gap-1 font-medium transition-colors">
            <Home size={14} /> Home
          </button>
        </div>
      </div>

      {/* Header Level 2 - Navigation & Global Actions */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Navigation Tabs - These control the state */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('allocation')}
            className={`px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
              activeTab === 'allocation' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Allocation Table
          </button>
          <button 
            onClick={() => setActiveTab('running')}
            className={`px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
              activeTab === 'running' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            PT Running Table
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex gap-1.5">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1.5">
            <PlusCircle size={14} /> Allocate Spool
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1.5">
            <PlusCircle size={14} /> Add Allocate Spool
          </button>
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> Rejected Spool
          </button>
        </div>
      </div>

      {/* RENDER AREA: Using the imported components */}
      <main className="p-4">
        {activeTab === 'allocation' ? (
          <PTAllocation /> 
        ) : (
          <PTRunningTable />
        )}
      </main>
      </div>
    </div>
  );
};

export default PTAllocationContainer;