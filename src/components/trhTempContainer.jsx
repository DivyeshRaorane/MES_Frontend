import React, { useState } from 'react';
import { 
  Home, 
  RotateCcw, 
  Save, 
  CheckCircle, 
  Settings2, 
  ThermometerSnowflake, 
  Droplets,
  Layout
} from 'lucide-react';

import TRH_Cycle from '../pages/trh_cycle/ui/trh_cycle';
import TEMP_Cycle from '../pages/temp_cycle/ui/temp_cycle';

const TRHTempCycleContainer = () => {
  const [activeTab, setActiveTab] = useState('trh');

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 font-sans">
      
      {/* 1. Header Navigation Bar */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">TRH & Temp Cycle Entry</h1>
            <p className="text-xs text-slate-500 font-semibold tracking-wide flex items-center gap-1">
              <Settings2 size={12} /> ENVIRONMENTAL TEST CONTROL PANEL
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
            <Save size={14} /> SAVE
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
            <CheckCircle size={14} /> SUBMIT
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
             MODIFIY
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
            <RotateCcw size={14} /> RESET
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
            <Home size={14} /> HOME
          </button>
        </div>
      </div>

      {/* 2. Modern Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="inline-flex p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('trh')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === 'trh'
                ? 'bg-white text-indigo-600 shadow-md scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Droplets size={18} className={activeTab === 'trh' ? 'text-indigo-600' : 'text-slate-400'} />
            TRH_CYCLE
          </button>
          
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === 'temp'
                ? 'bg-white text-orange-600 shadow-md scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ThermometerSnowflake size={18} className={activeTab === 'temp' ? 'text-orange-600' : 'text-slate-400'} />
            TEMP_CYCLE
          </button>
        </div>
      </div>

      {/* 3. Dynamic Content Display */}
      <div className="max-w-7xl mx-auto transition-all duration-500 ease-in-out">
        {activeTab === 'trh' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
             <TRH_Cycle />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <TEMP_Cycle />
          </div>
        )}
      </div>

    </div>
  );
};

export default TRHTempCycleContainer;