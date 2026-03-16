import React from 'react';
import { 
  History, 
  FlaskConical, 
  Scaling, 
  Zap, 
  Waves, 
  ClipboardCheck,
  Save,
  Send,
  Home,
  RotateCcw
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const LongTermEntry = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Global Header & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <History size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Long Term Entry</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md"><Save size={14}/> SAVE</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md"><Send size={14}/> SUBMIT</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all shadow-md">MODIFY</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-md"><RotateCcw size={14}/> RESET</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all shadow-md"><Home size={14}/> HOME</button>
        </div>
      </div>

      {/* 2. Primary Metadata Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <FlaskConical size={14} className="text-indigo-500" /> Test Qualification & Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField label="Start Date" type="date" />
          <FormField label="Entry Date" type="date" />
          <FormField label="End Date" type="date" />
          <FormField label="Qualification Test" type="select" options={["Select Type", "Standard A", "Standard B"]} />
          
          <FormField label="Env. Cond." type="select" options={["Room Temp", "Extreme Heat", "High Humidity"]} />
          <FormField label="Barcode ID" />
          <FormField label="PTID" />
          <FormField label="Tower Number" />

          <FormField label="Quarter" type="select" options={["Q1", "Q2", "Q3", "Q4"]} />
          <FormField label="Testing Standard" type="select" options={["IEC 60793", "TIA/EIA", "ISO"]} />
          <FormField label="Marker A" />
          <FormField label="Marker B" />

          <FormField label="Operator Name" type="select" options={["Admin", "Technical Lead"]} />
          <div className="grid grid-cols-3 gap-2 col-span-1">
             <FormField label="At 1310" />
             <FormField label="At 1550" />
             <FormField label="At 1625" />
          </div>
          <FormField label="Result" type="select" options={["Pending", "Pass", "Fail"]} />
          <FormField label="Test Count" />
        </div>
      </div>

      {/* 3. Attenuation Results Card */}
      <div className="bg-slate-200 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-cyan-700 uppercase flex items-center gap-2">
            <Waves size={18} /> Attenuation Summary (NM)
          </h3>
          <div className="w-48"><FormField label="TEST DAY" placeholder="Enter Day" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-800 p-4 rounded-xl border border-slate-700">
             <FormField label="ATTENUATION 1310" />
          </div>
          <div className="bg-teal-800 p-4 rounded-xl border border-slate-700">
             <FormField label="ATTENUATION 1550" />
          </div>
          <div className="bg-teal-800 p-4 rounded-xl border border-slate-700">
             <FormField label="ATTENUATION 1625"  />
          </div>
        </div>
      </div>

      {/* 4. Ageing & Dynamic Fatigue */}
      <div className="bg-white p-6 rounded-2xl border-t-4 border-t-amber-500 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Scaling className="text-amber-600" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase">Ageing Type & Dynamic Fatigue</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2">
             <FormField label="AGEING TYPE" type="select" options={["SELECT", "Heat Aging", "Water Immersion"]} />
          </div>
          <FormField label="DE-LAMINATION" type="select" options={["Select", "None", "Partial"]} />
          <FormField label="REMARKS" />
          
          <div className="md:col-span-2 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
             <span className="text-[10px] font-black text-amber-700 uppercase mb-2 block">Dynamic Fatigue Methods</span>
             <div className="grid grid-cols-2 gap-4">
                <FormField label="BY TENSILE METHOD" />
                <FormField label="BY 2-BEND METHOD" />
             </div>
          </div>
          <div className="md:col-span-2">
             <FormField label="REMARKS (FATIGUE)" />
          </div>
        </div>
      </div>

      {/* 5. Mechanical Testing Tables (Tensile & Strip) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tensile Test Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase">
               <Zap size={18} className="text-blue-600" /> Tensile Test 0.5 MTR
             </h3>
             <div className="flex gap-4">
                <div className="w-32"><FormField label="Median" disabled /></div>
                <div className="w-32"><FormField label="Result" type="select" options={["Pass", "Fail"]} /></div>
             </div>
          </div>
          <div className="overflow-x-auto pb-4">
             <div className="flex gap-2 min-w-max">
                {Array.from({ length: 19 }).map((_, i) => (
                  <div key={i} className="w-16">
                    <span className="text-[10px] text-center font-bold text-slate-400 bg-slate-100 py-1 rounded mb-1 block">{i + 1}</span>
                    <FormField placeholder="Val" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Strip Force Testing Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase mb-4">
             <Scaling size={18} className="text-emerald-600" /> Strip Force Testing
           </h3>
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-slate-50">
                       <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-left border-b">Parameter</th>
                       {Array.from({ length: 10 }).map((_, i) => (
                         <th key={i} className="p-3 text-[10px] font-black text-slate-400 uppercase border-b">{i + 1}</th>
                       ))}
                       <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b text-center">Avg/Result</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td className="p-3 text-xs font-bold text-slate-600 border-b">Avg Strip Force</td>
                       {Array.from({ length: 10 }).map((_, i) => (
                         <td key={i} className="p-2 border-b"><FormField /></td>
                       ))}
                       <td className="p-2 border-b"><FormField disabled placeholder="Avg" /></td>
                    </tr>
                    <tr>
                       <td className="p-3 text-xs font-bold text-slate-600 border-b">Peak Strip Force</td>
                       {Array.from({ length: 10 }).map((_, i) => (
                         <td key={i} className="p-2 border-b"><FormField /></td>
                       ))}
                       <td className="p-2 border-b"><FormField type="select" options={["Pass", "Fail"]} /></td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* 6. Footer Checkpoint */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ClipboardCheck className="text-emerald-500" size={24} />
            <div>
               <p className="text-sm font-bold text-slate-800">Final Validation Complete</p>
               <p className="text-xs text-slate-500">Ensure all long-term aging parameters are cross-verified with standard IEC 60793.</p>
            </div>
         </div>
         <button className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg active:scale-95">
            GENERATE LONG-TERM REPORT
         </button>
      </div>
    </div>
  );
};

export default LongTermEntry;