import React from 'react';
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  FileSpreadsheet, 
  Box, 
  Layers, 
  Barcode 
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const PackingManagement = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Layers className="text-indigo-600" size={24} />
          Inventory Packing Details
        </h1>
        <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-emerald-100 transition-colors">
          <FileSpreadsheet size={18} />
          Export To Excel
        </button>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <FormField label="Customer Name" type="select" options={["Acme Corp", "Global Tech"]} />
        <FormField label="Product Type" type="select" options={["Fiber Optic", "Coaxial"]} />
        <FormField label="Specification" type="select" />
        <FormField label="Fiber Type" type="select" />
        
        <FormField label="Quantity (KM)" type="number" />
        <FormField label="Total Packing (KM)" />
        <FormField label="Packed Quantity" />
        <FormField label="Bobbin Count" />

        <div className="flex items-end gap-3 pb-1">
           <label className="flex items-center gap-2 cursor-pointer group">
             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Multiple Color</span>
           </label>
        </div>
        <FormField label="Fiber Color" />
        <FormField label="Packing Number" type="select" />
        <div className="flex items-end">
          <button className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-2 rounded-md flex items-center justify-center gap-2 text-xs font-bold hover:bg-rose-100 transition-colors">
            <Trash2 size={14} /> REMOVE PACKING LOT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Ratio Calculations */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest">Ratio & Length Specs</h2>
          </div>
          <div className="p-4 space-y-4 flex-grow">
            <FormField label="Standard Length" type="select" options={["2063", "4126"]} />
            <FormField label="Multiple Length" type="select" />
            <FormField label="Packing Color" type="select" />

            <table className="w-full mt-4 text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th className="pb-2">Length</th>
                  <th className="pb-2">%</th>
                  <th className="pb-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {[49.512, 24.756, 12.378, 2.063].map((val, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 group">
                    <td className="py-3 font-medium text-slate-600">{val}</td>
                    <td className="py-2">
                      <input className="w-16 border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="0" />
                    </td>
                    <td className="py-2 text-right">
                      <input className="w-16 bg-slate-50 border border-transparent rounded px-2 py-1 text-slate-400" disabled placeholder="0" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">
              <Save size={16} /> Save Specifications
            </button>
          </div>
        </div>

        {/* Right Side: Barcode Data Table */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-50 flex flex-wrap gap-4 items-end bg-slate-50/50">
             <div className="flex-1 min-w-[200px]">
                <FormField label="Box Barcode" placeholder="Scan box..." />
             </div>
             <div className="flex-1 min-w-[200px]">
                <FormField label="Bobbin Barcode" placeholder="Scan bobbin..." />
             </div>
             <div className="flex gap-2">
                <button className="bg-white border border-slate-200 text-slate-600 p-2 rounded-md hover:bg-slate-50"><Trash2 size={18}/></button>
                <button className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-md font-bold text-xs hover:bg-indigo-100 transition-colors">SAVE ROW</button>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-md font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all flex items-center gap-2">
                  <Send size={14} /> SUBMIT
                </button>
             </div>
          </div>
          
          <div className="flex-grow overflow-auto max-h-[400px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-slate-100 shadow-sm z-10">
                <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="px-6 py-4"><input type="checkbox" className="rounded text-indigo-600" /></th>
                  <th className="px-4 py-4">Barcode</th>
                  <th className="px-4 py-4">Fiber ID</th>
                  <th className="px-4 py-4">Length</th>
                  <th className="px-4 py-4">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Empty State / Rows would go here */}
                <tr className="hover:bg-indigo-50/30 transition-colors">
                  <td colSpan="5" className="py-20 text-center text-slate-300 italic text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Barcode size={40} className="text-slate-200" />
                      No data entries found. Scan a barcode to begin.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingManagement;