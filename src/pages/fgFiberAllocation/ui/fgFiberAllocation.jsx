import React, { useState } from 'react';
import { 
  ChevronDown, 
  Home, 
  RotateCcw, 
  CheckCircle2, 
  FileSpreadsheet, 
  Search, 
  Settings2,
  Upload,
  PlayCircle
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const FGFiberAllocation = () => {
  const [formData, setFormData] = useState({
    fiberId: '',
    selectedFId: '',
    finalGrade: '',
    finalLength: '',
    productType: '',
    color: '',
    specName: '',
    fromDate: '2024-05-31',
    toDate: '2024-05-31',
    allocationType: ''
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Header Bar */}
      <header className="px-6 py-2 bg-[#1e293b] text-white flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded shadow-inner">
            <Settings2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest uppercase">FG Fiber Allocation Entry</h1>
            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold tracking-tighter uppercase">
              <span>Manufacturing Execution System</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded text-[10px] flex items-center gap-2 font-bold transition-all uppercase tracking-wider">
            <CheckCircle2 size={14} /> Submit
          </button>
          <button className="bg-slate-600 hover:bg-slate-500 px-4 py-1.5 rounded text-[10px] flex items-center gap-2 font-bold transition-all uppercase tracking-wider">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="bg-rose-600 hover:bg-rose-500 px-4 py-1.5 rounded text-[10px] flex items-center gap-2 font-bold transition-all uppercase tracking-wider">
            <Home size={14} /> Home
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-[1800px] mx-auto">
        {/* Top Information Section */}
        <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <FormField label="Fiber ID" placeholder="Enter ID" value={formData.fiberId} />
            <FormField label="Selected F_ID" placeholder="Auto-populated" value={formData.selectedFId} />
            <FormField label="Final Grade" placeholder="Grade Name" value={formData.finalGrade} />
            <FormField label="Spec. Name" placeholder="Spec Details" value={formData.specName} />
            
            <FormField label="Final Length (km)" placeholder="0.000" value={formData.finalLength} />
            <FormField label="Product Type" type="select" options={["Standard", "Premium"]} value={formData.productType} />
            <FormField label="Color" type="select" options={["Blue", "Yellow", "Green", "Red"]} value={formData.color} />
            <FormField label="Remarks" placeholder="Enter operational notes" />
          </div>
        </section>

        {/* Dual Table Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-[400px]">
          {/* Table 1: Allocated */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-center">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Spool Allocated For</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-tighter">
                  <tr>
                    <th className="p-2 border-r border-slate-200 w-12 text-center">SR.No.</th>
                    <th className="p-2 border-r border-slate-200">Fiber ID</th>
                    <th className="p-2 border-r border-slate-200 text-center">Length</th>
                    <th className="p-2">Specification Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Empty rows as per your image e00bc4 */}
                  {[...Array(8)].map((_, i) => (
                    <tr key={i} className="h-8 hover:bg-slate-50 transition-colors">
                      <td className="border-r border-slate-100 text-center text-slate-300">{i + 1}</td>
                      <td className="border-r border-slate-100"></td>
                      <td className="border-r border-slate-100"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Not Allocated */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-center">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Spool Not Allocated For</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-tighter">
                  <tr>
                    <th className="p-2 border-r border-slate-200 w-12 text-center">SR.No.</th>
                    <th className="p-2 border-r border-slate-200">Fiber ID</th>
                    <th className="p-2 border-r border-slate-200 text-center">Length</th>
                    <th className="p-2">Specification Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...Array(8)].map((_, i) => (
                    <tr key={i} className="h-8 hover:bg-slate-50 transition-colors">
                      <td className="border-r border-slate-100 text-center text-slate-300">{i + 1}</td>
                      <td className="border-r border-slate-100"></td>
                      <td className="border-r border-slate-100"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Filter & Upload Section */}
        <section className="bg-slate-200/50 p-4 rounded-lg border border-slate-300">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex gap-4">
              <div className="w-40"><FormField label="Form Date" type="date" value={formData.fromDate} /></div>
              <div className="w-40"><FormField label="To Date" type="date" value={formData.toDate} /></div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <FormField 
                label="Allocation Type" 
                type="select" 
                options={["Manual", "Automated", "Batch"]} 
                value={formData.allocationType} 
              />
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95">
                <PlayCircle size={14} /> Run Allocation
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex border border-slate-300 rounded overflow-hidden">
                <label className="bg-white px-4 py-1.5 text-[11px] text-slate-500 font-bold border-r border-slate-300 cursor-pointer hover:bg-slate-50">
                   <input type="file" className="hidden" />
                   Choose File
                </label>
                <div className="bg-slate-50 px-4 py-1.5 text-[11px] text-slate-400">No file chosen</div>
              </div>
              <button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded text-[11px] font-bold flex items-center gap-2">
                <Upload size={14} /> Browse
              </button>
            </div>

            <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200">
              <FileSpreadsheet size={14} /> Get Excel
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FGFiberAllocation;