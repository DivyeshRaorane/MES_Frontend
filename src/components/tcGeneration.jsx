import React, { useState } from 'react';
import { 
  RotateCcw, 
  Home, 
  Package, 
  Truck, 
  LayoutDashboard 
} from 'lucide-react';

import PackingManagement from '../pages/packing/ui/packing';
import DispatchManagement from '../pages/dispatch/ui/dispatch';



const TCGenerationDashboard = () => {
  const [activeTab, setActiveTab] = useState('packing');

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Breadcrumb */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">TC Generation</h1>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Quality Control System</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 group">
              <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-md shadow-rose-100 transition-all active:scale-95">
              <Home size={16} />
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Professional Tab Switcher */}
          <div className="bg-slate-50/50 p-2 border-b border-slate-100">
            <div className="flex gap-2 max-w-xs bg-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('packing')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'packing' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <Package size={14} strokeWidth={activeTab === 'packing' ? 3 : 2} />
                Packing
              </button>
              
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'dispatch' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <Truck size={14} strokeWidth={activeTab === 'dispatch' ? 3 : 2} />
                Dispatch
              </button>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="p-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'packing' ? (
              <div className="opacity-100 scale-100 transition-all duration-500">
                {/* PackingManagement Component Rendered Here */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center py-5">
<PackingManagement/>
                </div>
              </div>
            ) : (
              <div className="opacity-100 scale-100 transition-all duration-500">
                {/* DispatchCertificateModule Component Rendered Here */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center py-5">
                  <DispatchManagement/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCGenerationDashboard;