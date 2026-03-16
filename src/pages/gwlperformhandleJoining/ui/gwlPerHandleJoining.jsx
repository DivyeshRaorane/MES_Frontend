import React from 'react';
import * as Lucide from 'lucide-react';

const { 
  ChevronDown, 
  Edit, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Home,
  Zap,
  Flame,
  Settings2
} = Lucide;

import FormField from '../../../components/formInputs';


const GWLPerformHandleJoining = ()=> {
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">GWL Preform / Handle Joining</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Joining Session</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-amber-600 transition-all shadow-sm uppercase"><Edit size={14}/> Modify</button>
            <button className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-all shadow-sm uppercase"><Save size={14}/> Save</button>
            <button className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-all shadow-sm uppercase"><CheckCircle2 size={14}/> Submit</button>
            <button className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-all uppercase"><Trash2 size={14}/> Reset</button>
            <button className="flex items-center gap-1.5 bg-rose-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-all shadow-sm uppercase"><Home size={14}/> Home</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Core Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Operational Metadata */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Settings2 size={14} className="text-indigo-500" /> Operational Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormField label="Machine Number" type="select" options={["GWL-MAC-01", "GWL-MAC-02", "GWL-MAC-03"]} />
                <FormField label="Process" type="select" options={["Joining", "Cleaning", "Tapering"]} />
                <FormField label="Preform Type" type="select" options={["Primary", "Secondary", "Handle"]} />
                
                <FormField label="Start Date" type="text" value="31-May-2024" />
                <FormField label="Start Time" placeholder="HH:MM" />
                <FormField label="Operator" type="select" options={["Admin User", "Lead Op A", "Senior Op B"]} />
                
                <FormField label="End Date" type="text" value="31-May-2024" />
                <FormField label="End Time" placeholder="HH:MM" />
                <FormField label="Time Diff (Min)" />

                <div className="md:col-span-3">
                  <FormField label="Operational Remark" placeholder="Enter session notes here..." />
                </div>
              </div>
            </div>

            {/* Recipe Parameters Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                    <Flame size={16} />
                  </div>
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Flame Recipe Parameters</h3>
                </div>
                <div className="w-52">
                  <FormField label="" type="select" options={["Standard Joining V1", "High Temp V2"]} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-white text-slate-400 border-b border-slate-100 uppercase font-bold tracking-tighter">
                      <th className="p-4 text-left border-r border-slate-50">Parameter Description</th>
                      <th className="p-4 text-center border-r border-slate-50 w-32">Flow (LPM)</th>
                      <th className="p-4 text-center border-r border-slate-50 w-32">Time (Min)</th>
                      <th className="p-4 text-center w-36">Consumption (M3)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { name: "C3H8 Burner Front flow", color: "text-orange-600" },
                      { name: "C3H8 Burner Back flow", color: "text-orange-600" },
                      { name: "O2 Burner Front Inner flow", color: "text-blue-600" },
                      { name: "O2 Burner Front Outer flow", color: "text-blue-600" },
                      { name: "O2 Burner Back Inner flow", color: "text-blue-600" },
                      { name: "O2 Burner Back Outer flow", color: "text-blue-600" }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3.5 px-6 border-r border-slate-50">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${item.color}`}>•</span>
                            <span className="text-slate-700 font-semibold">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-slate-50">
                          <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-center font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" defaultValue="0.00" />
                        </td>
                        <td className="p-2 border-r border-slate-50">
                          <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-center font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" defaultValue="0.00" />
                        </td>
                        <td className="p-2">
                          <div className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-center font-black text-slate-400">0.000</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Zap size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Material Specifications</h3>
              </div>

              <div className="space-y-6">
                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Top Preform Data
                  </div>
                  <FormField label="Top Preform ID" placeholder="Enter ID..." />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Wt (KG)" placeholder="0.00" />
                    <FormField label="Dia (mm)" placeholder="0.00" />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Bottom Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Bottom Preform Data
                  </div>
                  <FormField label="Bottom Preform ID" placeholder="Enter ID..." />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Wt (KG)" placeholder="0.00" />
                    <FormField label="Dia (mm)" placeholder="0.00" />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Handle Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Handle Dimensions
                  </div>
                  <FormField label="Handle Type" type="select" options={["T1 Standard", "T2 Reinforced"]} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Dia (mm)" placeholder="0.00" />
                    <FormField label="Len (mm)" placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-8">
           <div className="h-px w-32 bg-slate-300" />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
             Precision Joining Interface &bull; Manufacturing Execution System
           </p>
        </div>
      </div>
    </div>
  );
}

export default GWLPerformHandleJoining