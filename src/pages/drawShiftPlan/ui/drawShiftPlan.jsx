import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';

const { 
  ChevronDown, 
  Send, 
  Edit, 
  RefreshCcw, 
  Home,
  Sparkles,
  Loader2,
  Save,
  CheckCircle2,
  Trash2
} = Lucide;

import FormField from '../../../components/formInputs';

// API Configuration
const apiKey = ""; // Provided by environment

const DrawShiftPlan=()=> {
  const [view, setView] = useState('shiftPlan'); // 'analysis' or 'shiftPlan'
  const [formData, setFormData] = useState({
    entryDate: '2024-05-31',
    shift: '',
    dieTeam: '',
    groundTeam: '',
    furnaceTeam: '',
    shiftIncharge: ''
  });

  // Table Data State
  const [tableData, setTableData] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      checked: false,
      dt: i + 1,
      theoLineSpeed: 3000,
      actualLineSpeed: '',
      coNum: 0,
      coTime: 0,
      coTl: '',
      fcTl: 0,
      pmTl: 0,
      planDowntime: 0,
      speedLossTime: '',
      drawPlan: '',
      availableTime: '',
      shiftTime: 480
    }))
  );

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const updateRow = (id, field, value) => {
    setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  // --- Gemini API Call for Optimization Suggestions ---
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAiOptimization = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this fiber draw shift plan and suggest improvements to minimize downtime:
              Date: ${formData.entryDate}, Shift: ${formData.shift}
              Average Theo Speed: 3000 m/min
              Table Rows: ${tableData.length}
              
              Provide a JSON response with:
              1. "efficiency_score": 0-100
              2. "bottleneck": Primary risk
              3. "recommendation": Short optimization tip.`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAiSuggestion(result);
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans text-slate-800">
      {/* Header Actions */}
      <div className="bg-white border border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm rounded-xl mb-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <RefreshCcw size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">DRAW SHIFT PLAN</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Planning & Control</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
            <Edit size={14} /> Modify
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
            <Save size={14} /> Save
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Submit
          </button>
          <button className="bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
            <Trash2 size={14} /> Reset
          </button>
          <button className="bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
            <Home size={14} /> Home
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4">
          <FormField label="Entry Date" type="date" value={formData.entryDate} onChange={handleInputChange('entryDate')} />
          <FormField label="Shift" type="select" options={["A", "B", "C", "General"]} value={formData.shift} onChange={handleInputChange('shift')} />
          <FormField label="Die Team" type="select" options={["Team Alpha", "Team Beta"]} />
          <FormField label="Ground Team" type="select" options={["Ground 1", "Ground 2"]} />
          <FormField label="Furnace Team" type="select" options={["Furnace A", "Furnace B"]} />
          <FormField label="Shift Incharge" type="select" options={["John Doe", "Jane Smith"]} />
          
          {/*<div className="md:col-span-2 flex items-end">
             <button 
              onClick={getAiOptimization}
              disabled={isAiLoading}
              className="w-full h-[34px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
             >
               {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
               {aiSuggestion ? "Update AI Insights" : "Get AI Efficiency Insights"}
             </button>
          </div>*/}
        </div>

        {aiSuggestion && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex gap-4">
              <div className="text-center border-r border-indigo-200 pr-4">
                <p className="text-[9px] font-bold text-indigo-400 uppercase">Efficiency</p>
                <p className="text-lg font-black text-indigo-700">{aiSuggestion.efficiency_score}%</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-indigo-400 uppercase">Critical Bottleneck</p>
                <p className="text-xs font-bold text-slate-700 uppercase">{aiSuggestion.bottleneck}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 italic">{aiSuggestion.recommendation}</p>
              </div>
            </div>
            <button onClick={() => setAiSuggestion(null)} className="text-indigo-300 hover:text-indigo-500 text-[10px] font-bold uppercase">Dismiss</button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter w-10 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">DT</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Theo Speed</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Actual Speed</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">C/O Num</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">C/O Time</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">C/O TL</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">FC TL</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">PM TL</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Downtime</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Draw Plan</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Shift Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="p-2 text-xs font-bold text-slate-600 text-center">{row.dt}</td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none text-center bg-slate-50 font-medium" value={row.theoLineSpeed} disabled />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none text-center" placeholder="-" />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none text-center" defaultValue={row.coNum} />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 focus:border-blue-500 outline-none text-center" defaultValue={row.coTime} />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 bg-slate-50" disabled />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 outline-none text-center" defaultValue={row.fcTl} />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 outline-none text-center" defaultValue={row.pmTl} />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 outline-none text-center" defaultValue={row.planDowntime} />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 outline-none text-center bg-slate-50" disabled />
                  </td>
                  <td className="p-2">
                    <input className="w-full text-[11px] border-slate-200 rounded p-1.5 outline-none text-center bg-slate-50" defaultValue={row.shiftTime} disabled />
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-slate-800 text-white">
              <tr>
                <td className="p-3 text-[10px] font-black uppercase text-center" colSpan={2}>Total</td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">30000</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">-</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">0</div></td>
                <td className="p-3"><div className="w-full h-7 bg-slate-700 rounded flex items-center justify-center font-bold text-xs">4800</div></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-center text-[10px] text-slate-400 font-medium items-center gap-4 py-2">
        <span>DRAW SHIFT PLANNER v2.1</span>
        <span>&bull;</span>
        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> System Status: Online</span>
      </div>
    </div>
  );
}

export default DrawShiftPlan