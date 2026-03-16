import React, { useState } from 'react';
import { RotateCcw, Home, Factory, Palette } from 'lucide-react';
// Importing the previous components
import FGRejection from '../pages/fgRejection/ui/fgRejection';
import FGRejectionForColoring from '../pages/fgRejectionForColoring/ui/fgRejectionForColoring';

const FGRejectinContainer = () => {
  const [activeTab, setActiveTab] = useState('fg'); // 'fg' or 'coloring'

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Decorative Top Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600" />

      {/* Main Header Container */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
              <Factory size={20} />
            </span>
            FG Rejection for Colouring
          </h1>

          <div className="flex gap-3">
            <button className="group flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
              <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
              Reset
            </button>
            <button className="group flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
              <Home size={16} />
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        {/* Tab Selection Section */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('fg')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'fg'
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Factory size={16} />
            FG Rejection
          </button>
          
          <button
            onClick={() => setActiveTab('coloring')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              activeTab === 'coloring'
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Palette size={16} />
            Coloring
          </button>
        </div>

        {/* Dynamic Component Rendering with Animation */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'fg' ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
               <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
                  <h2 className="text-sm font-semibold text-slate-600 uppercase">Input Rejection Data</h2>
               </div>
               <FGRejection />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
                  <h2 className="text-sm font-semibold text-slate-600 uppercase">Production Process Details</h2>
               </div>
               <FGRejectionForColoring />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FGRejectinContainer;