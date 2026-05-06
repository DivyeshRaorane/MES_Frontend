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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      {/* Main Glassmorphism Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
          {/* Subtle Decorative Gradient Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Activity size={20} />
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-white bg-gradient-to-r from-[#003366] to-blue-600 tracking-tight">
              REW/COLOURING ENTRY
            </h1>
          </div>

          <div className="flex gap-4 relative z-10">
            <button className="group flex items-center gap-2 px-6 py-2 bg-slate-500 text-slate-100 text-xs font-bold rounded-xl hover:bg-slate-600 hover:text-white transition-all duration-300 active:scale-95">
              <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <button className="group flex items-center gap-2 px-6 py-2 bg-white/10 text-white text-xs font-bold rounded-xl hover:from-red-600 hover:bg-white/20 transition-all duration-300 active:scale-95">
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
        <div className="min-h-[500px] bg-white">
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {tabs.find((t) => t.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewColContainer;