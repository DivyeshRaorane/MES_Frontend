import React, { useState } from 'react';
import { 
  Home, 
  Save, 
  Edit3, 
  RotateCcw, 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3,
  Search
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const PTBreakAnalysis = () => {
  const [formData, setFormData] = useState({
    entryDate: '31-May-2024',
    bsaTechnician: '',
    mainBreakType: '',
    subReason: '',
    nextSubReason: '',
    towerNo: '',
    preformId: '',
    spoolId: ''
  });

  const tableData = [
    { srNo: 1, spoolId: "Z194240040713", ptBreaks: 7, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 2, spoolId: "TEF524245060", ptBreaks: 3, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 3, spoolId: "TEF524228106", ptBreaks: 3, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 4, spoolId: "TEF524195030", ptBreaks: 1, breakChecked: 1, ptBrksK: 2.7, bsaPercent: 100 },
    { srNo: 5, spoolId: "TEF524194011", ptBreaks: 2, breakChecked: 2, ptBrksK: 18.2, bsaPercent: 100 },
    { srNo: 6, spoolId: "TEF524194012", ptBreaks: 1, breakChecked: 2, ptBrksK: 4.5, bsaPercent: 200 },
    { srNo: 7, spoolId: "TEF524208022", ptBreaks: 4, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 8, spoolId: "TEF524228105", ptBreaks: 4, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 9, spoolId: "TEF524190051", ptBreaks: 1, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
    { srNo: 10, spoolId: "TEF524159032", ptBreaks: 5, breakChecked: 0, ptBrksK: 0, bsaPercent: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      {/* Refined Glassmorphism Header */}
      <header className="px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase leading-none">PT Break Analysis</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">Quality Assurance Portal</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100 hover:shadow-lg text-white px-4 py-1.5 rounded-md text-[11px] flex items-center gap-2 font-bold transition-all active:scale-95">
            <Save size={14} /> Submit
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 hover:shadow-amber-100 hover:shadow-lg text-white px-4 py-1.5 rounded-md text-[11px] flex items-center gap-2 font-bold transition-all active:scale-95">
            <Edit3 size={14} /> Modify
          </button>
          <button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-[11px] flex items-center gap-2 font-bold transition-all active:scale-95">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-rose-500 px-4 py-1.5 rounded-md text-[11px] flex items-center gap-2 font-bold transition-all active:scale-95 shadow-sm">
            <Home size={14} /> Home
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><ClipboardCheck size={20}/></div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Checks</p>
              <p className="text-xl font-black text-slate-800">31</p>
            </div>
          </div>
          <div className="bg-white border border-rose-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-rose-50 p-3 rounded-full text-rose-600"><AlertTriangle size={20}/></div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Breaks</p>
              <p className="text-xl font-black text-slate-800">2.7 km</p>
            </div>
          </div>
          <div className="bg-white border border-amber-100 p-4 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-full text-amber-600"><Search size={20}/></div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Analysis</p>
              <p className="text-xl font-black text-slate-800">12</p>
            </div>
          </div>
        </div>

        {/* Improved Form Layout */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
             Entry Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            <FormField label="Entry Date" value={formData.entryDate} readOnly />
            <FormField 
              label="BSA Technician" 
              type="select" 
              options={["Technician A", "Technician B"]} 
              value={formData.bsaTechnician}
            />
            <FormField label="Brk PT ID" placeholder="PT-8821" />
            <FormField 
              label="Main Break Type" 
              type="select" 
              options={["Core Break", "Surface Scratches"]} 
            />
            
            <FormField label="Sub Reason" type="select" options={["Mechanical", "Material"]} />
            <FormField label="Next Sub Reason" type="select" options={["Tension", "Winding"]} />
            <FormField label="Dist. From Periphery" placeholder="0.00" />
            <FormField label="Particle Size" placeholder="µm" />

            <FormField label="Flaw Size" placeholder="0.00" />
            <FormField label="Preform Type" placeholder="Standard" />
            <FormField label="PT Len (Km)" />
            <FormField label="Draw Cumm Len (Km)" />

            <FormField label="Tower No." />
            <FormField label="PT Mc No." />
            <FormField label="PT Operator" />
            <FormField label="Draw Barcode Id" />

            <FormField label="Preform ID" />
            <FormField label="PT Breaks" />
            <FormField label="Breaks Checkd" />
            <FormField label="Pending" />

            <div className="lg:col-span-2">
              <FormField label="Spool ID" />
            </div>
            <div className="lg:col-span-2">
              <FormField label="BSA Remark" placeholder="Enter observation details..." />
            </div>
          </div>
        </section>

        {/* Enhanced Table with Better Contrast */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Analysis Data Logs</h2>
            <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold uppercase">Live Logs</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-16">Sr.No</th>
                  <th className="px-6 py-4">Spool Identification</th>
                  <th className="px-6 py-4 text-center">PT Breaks</th>
                  <th className="px-6 py-4 text-center">Checked</th>
                  <th className="px-6 py-4 text-center">Brks/K (1000)</th>
                  <th className="px-6 py-4 text-right pr-10">BSA % Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableData.map((row) => (
                  <tr key={row.srNo} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-6 py-3.5 text-center font-bold text-slate-400 group-hover:text-blue-600">{row.srNo}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-700 tracking-tight">{row.spoolId}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600">{row.ptBreaks}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600">{row.breakChecked}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600">{row.ptBrksK}</td>
                    <td className="px-6 py-3.5 text-right pr-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter shadow-sm ${
                        row.bsaPercent > 100 
                        ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' 
                        : row.bsaPercent === 100 
                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                        : 'bg-slate-100 text-slate-400'
                      }`}>
                        {row.bsaPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-right">
             <p className="text-[10px] text-slate-400 font-bold uppercase italic">End of record list</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PTBreakAnalysis;