import React, { useState } from 'react';
import { Home, RotateCcw, Box, GitMerge, LayoutDashboard } from 'lucide-react';

import Splicing from '../pages/splicing/ui/splicing';
import Macrobend from '../pages/macrobend/ui/macrobend';

const MacrobendContainer = () => {
  const [activeTab, setActiveTab] = useState('macrobend');

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Macrobend Entry</h1>
            <p className="text-xs text-slate-500 font-medium">Manufacturing Quality Control System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md">
            <RotateCcw size={14} /> RESET
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-rose-100">
            <Home size={14} /> HOME
          </button>
        </div>
      </div>

      {/* Modern Tab Switcher */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('macrobend')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'macrobend'
                ? 'bg-white text-blue-600 shadow-sm scale-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Box size={16} className={activeTab === 'macrobend' ? 'text-blue-600' : 'text-slate-400'} />
            Macrobend
          </button>
          
          <button
            onClick={() => setActiveTab('splicing')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'splicing'
                ? 'bg-white text-indigo-600 shadow-sm scale-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <GitMerge size={16} className={activeTab === 'splicing' ? 'text-indigo-600' : 'text-slate-400'} />
            Splicing
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="max-w-7xl mx-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'macrobend' ? (
          <div className="border-t-4 border-blue-500 rounded-b-2xl">
            <Macrobend />
          </div>
        ) : (
          <div className="border-t-4 border-indigo-500 rounded-b-2xl">
            <Splicing />
          </div>
        )}
      </div>
    </div>
  );
};

export default MacrobendContainer;