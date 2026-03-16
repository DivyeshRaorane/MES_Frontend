import React, { useState } from 'react';
import { 
  FlaskConical, 
  Database, 
  Trash2, 
  Save, 
  Download, 
  ArrowRightLeft, 
  Clock,
  User,
  Box
} from 'lucide-react';

// --- Reusable UI Sub-components ---
const FormField = ({ label, type = "text", value, onChange, options = [], placeholder = "", className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    {type === "select" ? (
      <select 
        className="text-[12px] border border-slate-300 rounded px-2 bg-white focus:ring-1 focus:ring-blue-500 outline-none h-8 transition-all"
        value={value}
        onChange={onChange}
      >
        <option value="">-- Select --</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        type={type}
        placeholder={placeholder}
        className="text-[12px] border border-slate-300 rounded px-2 bg-white focus:ring-1 focus:ring-blue-500 outline-none h-8 placeholder:text-slate-300 transition-all"
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = "text-blue-700" }) => (
  <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 ${color} font-bold text-xs uppercase tracking-wider`}>
    <Icon size={14} />
    {title}
  </div>
);

const D2Egeing = () => {
  // Mock Data for the active batches table
  const [activeBatches] = useState([
    { tank: '2', batch: 'D2-20240531-01', count: 156, length: '6230.85', status: 'In-Process' },
    { tank: '4', batch: 'D2-20240531-04', count: 88, length: '3412.20', status: 'In-Process' },
    { tank: '3', batch: 'D2-20240530-12', count: 210, length: '8100.00', status: 'In-Process' },
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <FlaskConical size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-none">D2 AGEING ENTRY</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Production Management System</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-[11px] font-bold rounded shadow-sm hover:bg-slate-700 transition-all">
            <Download size={14} /> EXPORT REPORT
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: ISSUE FOR D2 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <SectionHeader icon={ArrowRightLeft} title="Issue for D2 Ageing" />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" type="date" defaultValue="2024-05-31" />
              <FormField label="Time" placeholder="15:23:00" />
              <FormField label="D2 Batch No" placeholder="Auto-generated" />
              <FormField label="D2 Conc (%)" placeholder="e.g. 99.9" />
              <FormField label="Operator Name" type="select" options={['Operator A', 'Operator B', 'Operator C']} />
              <FormField label="Tank Number" type="select" options={['1', '2', '3', '4', '5']} />
              <FormField label="Barcode ID" placeholder="Scan Fiber Barcode" />
              <FormField label="Fiber Count" placeholder="0" />
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
              <button className="flex-1 py-2 bg-rose-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-rose-600 transition-all flex items-center justify-center gap-1">
                <Trash2 size={12} /> REMOVE FROM LIST
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-1">
                <Box size={12} /> ISSUE FOR D2
              </button>
              <button className="px-4 py-2 bg-slate-700 text-white text-[10px] font-bold rounded shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-1">
                <Save size={12} /> SAVE
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              Current Issue List
            </div>
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-white sticky top-0 shadow-sm">
                  <tr className="text-slate-500 border-b">
                    <th className="px-4 py-2 text-left w-12">SEL</th>
                    <th className="px-4 py-2 text-left">BARCODE ID</th>
                    <th className="px-4 py-2 text-left">LENGTH (KM)</th>
                    <th className="px-4 py-2 text-right">GRADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-blue-50/50">
                    <td className="px-4 py-2"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-4 py-2 font-mono font-medium">F240531-0012</td>
                    <td className="px-4 py-2">50.420</td>
                    <td className="px-4 py-2 text-right"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black">A</span></td>
                  </tr>
                  {[...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan="4" className="px-4 py-2 text-transparent select-none">-</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECEIVE & BATCH STATUS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <SectionHeader icon={Clock} title="Receive from D2 Ageing" color="text-emerald-700" />
            <div className="grid grid-cols-3 gap-4 items-end">
              <FormField label="Select D2 Batch" type="select" options={activeBatches.map(b => b.batch)} />
              <FormField label="Received By" type="select" options={['Supervisor X', 'Supervisor Y']} />
              <button className="h-8 bg-emerald-600 text-white text-[11px] font-bold rounded shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 uppercase">
                Confirm Receipt
              </button>
              <div className="col-span-3">
                <FormField label="Remarks / Observations" placeholder="Enter any process variations or notes here..." />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-blue-700 px-4 py-3 flex justify-between items-center">
                <h3 className="text-white text-xs font-black tracking-widest uppercase flex items-center gap-2">
                  <Database size={14} /> Active Ageing Batches
                </h3>
                <span className="bg-blue-500/30 text-white text-[9px] px-2 py-0.5 rounded font-bold border border-blue-400/50">
                  3 TANKS OCCUPIED
                </span>
             </div>
             <table className="w-full text-xs">
               <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                 <tr>
                   <th className="px-6 py-3 text-left">TANK NO</th>
                   <th className="px-6 py-3 text-left">BATCH ID</th>
                   <th className="px-6 py-3 text-center">FIBER COUNT</th>
                   <th className="px-6 py-3 text-right">TOTAL LENGTH (KM)</th>
                   <th className="px-6 py-3 text-center">ACTION</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {activeBatches.map((batch, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-6 py-4 font-black text-blue-600">{batch.tank}</td>
                     <td className="px-6 py-4 font-mono text-slate-600">{batch.batch}</td>
                     <td className="px-6 py-4 text-center font-bold">{batch.count}</td>
                     <td className="px-6 py-4 text-right font-mono text-slate-500">{batch.length}</td>
                     <td className="px-6 py-4 text-center">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Download size={16} />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium italic text-center">
               Last refreshed: Today at 09:34 AM. All data synced with central ERP.
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default D2Egeing;