import React from 'react';
import { 
  ClipboardList, 
  Wind, 
  Activity, 
  TrendingUp, 
  Dumbbell, 
  CheckCircle2 
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const TEMP_Cycle = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Header & Initial Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600 p-2 rounded-lg text-white shadow-lg shadow-cyan-100">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Aging & Mechanical Analysis</h2>
              <p className="text-xs text-slate-500 font-medium">Environmental stress and tensile strength tracking</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-6 rounded-lg shadow-md transition-all">SUBMIT REPORT</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField label="Start Date" type="date" />
          <FormField label="Start Time" type="time" />
          <FormField label="End Date" type="date" />
          <FormField label="End Time" type="time" />
          
          <FormField label="Fibre ID" />
          <FormField label="Preform ID" />
          <FormField label="Tower No" />
          <FormField label="Spool ID" />

          <div className="col-span-full bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-cyan-600" />
                <span className="text-xs font-black text-slate-600 uppercase">Initial Attenuation Baseline</span>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <FormField label="AT 1310 NM" />
                <FormField label="AT 1550 NM" />
                <FormField label="AT 1625 NM" />
             </div>
          </div>
        </div>
      </div>

      {/* 2. Temperature Cycle Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-800 p-4 flex items-center gap-2">
          <Wind className="text-cyan-400" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attenuation Change Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                <th className="p-4 border-b">Cycle / Temp</th>
                <th className="p-4 border-b">Date/Time</th>
                <th className="p-4 border-b text-center bg-cyan-50/50">Attenuation In DB (1310/1550/1625)</th>
                <th className="p-4 border-b text-center bg-amber-50/50">Change In DB (&lt; 0.05)</th>
                <th className="p-4 border-b">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[23, -60, 85].map((temp, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{temp}°C</span>
                      <span className="text-[10px] text-slate-400 font-medium">Measurement Step {i+1}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                       <div className="w-28"><FormField type="date" /></div>
                       <div className="w-24"><FormField type="time" /></div>
                    </div>
                  </td>
                  <td className="p-4 bg-cyan-50/20">
                    <div className="flex gap-2">
                      <FormField placeholder="1310" />
                      <FormField placeholder="1550" />
                      <FormField placeholder="1625" />
                    </div>
                  </td>
                  <td className="p-4 bg-amber-50/20">
                    <div className="flex gap-2">
                      <FormField placeholder="< 0.05" />
                      <FormField placeholder="< 0.05" />
                      <FormField placeholder="< 0.05" />
                    </div>
                  </td>
                  <td className="p-4">
                    <FormField type="select" options={["User A", "User B"]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4">
            <FormField label="Max Change in Attenuation" disabled />
            <FormField label="Min Change in Attenuation" disabled />
        </div>
      </div>

      {/* 3. Tensile Strength - Before & After Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before Aging Card */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase">Mechanical: Before Aging</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
               <FormField label="Tensile (GPA)" />
               <FormField label="Avg Strip (N)" />
               <FormField label="Peak Strip (N)" />
            </div>
            <div className="grid grid-cols-3 gap-3">
               <FormField label="Tensile (GPA)" />
               <FormField label="Avg Strip (N)" />
               <FormField label="Peak Strip (N)" />
            </div>
          </div>
        </div>

        {/* After Aging Card */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-orange-500 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} className="text-orange-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase">Mechanical: After Aging</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
               <FormField label="Tensile (GPA)" />
               <FormField label="Avg Strip (N)" />
               <FormField label="Peak Strip (N)" />
            </div>
            <div className="grid grid-cols-3 gap-3">
               <FormField label="Tensile (GPA)" />
               <FormField label="Avg Strip (N)" />
               <FormField label="Peak Strip (N)" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Final Verification Footer */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <FormField label="Physical Observation" placeholder="No cracks, clear fiber..." />
          <FormField label="Prepared By" type="select" options={["Divyesh", "Admin"]} />
          <FormField label="Checked By" type="select" options={["Manager", "QA Lead"]} />
          <div className="flex flex-col gap-1">
             <label className="text-[11px] font-bold text-cyan-400 uppercase">Result Status</label>
             <div className="bg-slate-800 border border-slate-700 rounded p-1">
               <FormField type="select" options={["PASS", "FAIL", "RE-TEST"]} />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TEMP_Cycle;