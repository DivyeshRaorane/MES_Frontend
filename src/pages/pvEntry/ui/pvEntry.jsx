import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Database, 
  RotateCcw, 
  Search,
  ChevronDown,
  Info
} from 'lucide-react';

// --- Reusable UI Elements for PV Entry ---

const Card = ({ children, title, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600 mb-6 overflow-hidden">
    {title && (
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-indigo-600" />}
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">{title}</h3>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
        </div>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder = "", className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-0.5">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="text-[12px] border border-slate-200 rounded-lg px-3 h-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50/30"
    />
  </div>
);

const SelectField = ({ label, options = [], value, onChange, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-0.5">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={onChange}
        className="w-full text-[12px] border border-slate-200 rounded-lg px-3 h-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white appearance-none"
      >
        <option value="">-- Select --</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// --- Main PV Entry Component ---

const PVEntry = () => {
  const [rows, setRows] = useState([
    { id: 1, barcode: '', length: '', grade: '', color: '', identifier: '', remark: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), barcode: '', length: '', grade: '', color: '', identifier: '', remark: '' }]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">PV Entry</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Process Verification & Gas Batch Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <RotateCcw size={14} /> Clear Form
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-bold uppercase text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Save size={14} /> Save Entries
            </button>
          </div>
        </div>

        {/* PV Configuration Header */}
        <Card title="PV Configuration & Batch Details" icon={Info}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SelectField label="PV Type" options={['Standard', 'Experimental', 'High Tensile']} />
            <SelectField label="Shift Incharge" options={['Rahul Sharma', 'Anil Kumar', 'S. Meena']} />
            <SelectField label="Operator" options={['Operator 01', 'Operator 02', 'Operator 03']} />
            <SelectField label="Gas Material" options={['Helium (He)', 'Nitrogen (N2)', 'Argon (Ar)']} />
            
            <InputField label="Gas Batch No." placeholder="Enter Batch ID..." />
            <SelectField label="Color Type" options={['Natural', 'Ring Marked', 'Solid']} />
            <SelectField label="Select Color" options={['Blue', 'Orange', 'Green', 'Brown', 'Slate', 'White']} />
            <div className="flex flex-col gap-1.5">
               <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight ml-0.5">Quick Scan Barcode</label>
               <div className="relative">
                  <input className="w-full text-[12px] border-2 border-indigo-100 rounded-lg px-3 h-9 focus:border-indigo-500 outline-none transition-all pr-10" placeholder="Scan Fiber ID..." />
                  <Search size={16} className="absolute right-3 top-2.5 text-indigo-400" />
               </div>
            </div>
          </div>
        </Card>

        {/* PV Data Table */}
        <Card title="Fiber Processing List" icon={Plus}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-12">No.</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[150px]">Barcode / Fiber ID</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Length (m)</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-28">Grade</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Fiber Color</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Identifier</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Remarks</th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-4 py-3 text-[11px] font-bold text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[12px] focus:border-indigo-400 outline-none" placeholder="Scan..." />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[12px] focus:border-indigo-400 outline-none" placeholder="0.00" />
                    </td>
                    <td className="px-4 py-3">
                      <select className="w-full h-8 bg-white border border-slate-200 rounded px-1 text-[11px] focus:border-indigo-400 outline-none">
                        <option>A</option><option>B</option><option>C</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[12px] focus:border-indigo-400 outline-none" />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[12px] focus:border-indigo-400 outline-none" />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[12px] focus:border-indigo-400 outline-none" placeholder="Add note..." />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => removeRow(row.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              Total Processed: <span className="text-indigo-600">{rows.length} Units</span>
            </div>
            <button 
              onClick={addRow}
              className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-900 transition-all shadow-md"
            >
              <Plus size={14} /> Add Fiber Row
            </button>
          </div>
        </Card>

        {/* Submission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
              <div className="bg-emerald-500 p-2.5 rounded-lg text-white"><Save size={18}/></div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase">Status</p>
                <p className="text-xs font-bold text-emerald-800 tracking-tight">Ready for Submission</p>
              </div>
           </div>
           {/*<div className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 text-white">
              <div className="bg-white/10 p-2.5 rounded-lg text-white"><Database size={18}/></div>
              <div>
                <p className="text-[10px] font-bold text-white/50 uppercase">Records</p>
                <p className="text-xs font-bold tracking-tight">Waiting to Sync to SAP</p>
              </div>
           </div>*/}
        </div>
      </div>
    </div>
  );
};

export default PVEntry;