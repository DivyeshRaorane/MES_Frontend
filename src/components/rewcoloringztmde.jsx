import React, { useState } from 'react';
import { Home,RotateCcw,Activity } from 'lucide-react';
import RewindingEntry from '../pages/rewColoringEntry/ui/rewindingEntry';
import ColouringEntry from '../pages/coloringEntry/ui/colringEntry';
import ZTPMDEntry from '../pages/ZTPMDEentry/ui/ztpmdeEntry';

const RewColContainer = () => {
  const [activeTab, setActiveTab] = useState('Rewinding');

  const tabs = [
    { id: 'Rewinding', label: 'Rewinding', component: <RewindingEntry /> },
    { id: 'Colouring', label: 'Colouring', component: <ColouringEntry /> },
    { id: 'ZTPMD', label: 'ZTPMD', component: <ZTPMDEntry /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans selection:bg-blue-100">
      {/* Main Glassmorphism Card */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-200/60">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="relative bg-white px-8 py-6 flex justify-between items-center overflow-hidden">
          {/* Subtle Decorative Gradient Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
              <Activity size={20} />
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#003366] to-blue-600 tracking-tight">
              REW/COLOURING ENTRY
            </h1>
          </div>

          <div className="flex gap-4 relative z-10">
            <button className="group flex items-center gap-2 px-6 py-2 bg-slate-600 text-slate-100 text-xs font-bold rounded-xl hover:bg-slate-800 hover:text-white hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 active:scale-95">
              <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <button className="group flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-200 transition-all duration-300 active:scale-95">
              <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              Home
            </button>
          </div>
        </div>

        {/* --- NEUMORPHIC TAB NAVIGATION --- */}
        <div className="bg-slate-50/80 px-8 py-5 border-y border-slate-100 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-1.5 bg-slate-200/40 w-fit rounded-2xl border border-slate-200/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-8 py-2.5 text-xs font-bold rounded-xl transition-all duration-500 ease-out flex items-center gap-2 overflow-hidden ${
                    isActive
                      ? 'text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)]'
                      : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                  }`}
                >
                  {/* Sliding Background for Active Tab */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 animate-gradient-x" />
                  )}
                  
                  <span className="relative z-10">{tab.label}</span>
                  
                  {/* Subtle Dot for Active Tab */}
                  {isActive && (
                    <span className="relative z-10 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- CONTENT AREA WITH TRANSITION --- */}
        <div className="p-6 md:p-8 min-h-[500px] bg-white">
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {tabs.find((t) => t.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewColContainer;