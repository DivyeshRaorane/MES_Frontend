import React, { useState } from 'react';
import { 
  ChevronDown, 
  Home, 
  Save, 
  Edit3, 
  RotateCcw, 
  Printer, 
  Trash2, 
  Box, 
  Scan,
  RefreshCw,
  Search
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const BoxScanningEntry = () => {
  const [formData, setFormData] = useState({
    entryDate: '31-May-2024',
    bobbinType: '50.4',
    boxType: '',
    specification: '',
    bobbinCount: '',
    operator: '',
    boxBarcode: '',
    boxPackedToday: ''
  });

  const [tableData, setTableData] = useState([
    { barcode: 'B0012345', finalLength: '25.400', fiberColor: 'Blue', identifier: 'A' },
    { barcode: 'B0012346', finalLength: '25.405', fiberColor: 'Red', identifier: 'B' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      {/* Dynamic Header */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
            <Box size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase leading-none">Box Scanning Entry</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Inventory & Packaging Control</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
            <Save size={14} /> Submit
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
            <Edit3 size={14} /> Modify
          </button>
          <button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
            <Home size={14} /> Home
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Primary Data Input Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField label="Entry Date" value={formData.entryDate} readOnly />
            <FormField 
              label="Bobbin Type" 
              type="select" 
              options={["50.4", "60.2", "45.0"]} 
              value={formData.bobbinType} 
            />
            <FormField label="Box Type" placeholder="Standard" />
            <FormField 
              label="Specification" 
              type="select" 
              options={["Spec A", "Spec B"]} 
            />
            
            <FormField label="Bobbin Count" placeholder="0" />
            <FormField 
              label="Operator" 
              type="select" 
              options={["Operator 01", "Operator 02"]} 
            />
            <FormField label="Box Barcode" placeholder="Scan or Enter" />
            <FormField label="Box Packed Today" placeholder="0" />
          </div>
        </section>

        {/* Operational Actions Area (As per image_e0795b.png) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Scanning Actions */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Scan size={14} /> Bobbin Allocation
            </h2>
            <div className="flex flex-col md:flex-row items-end gap-3">
              <div className="flex-1">
                <FormField label="Bobbin Barcode ID" placeholder="Scan Bobbin..." />
              </div>
              <div className="flex gap-2">
                <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                  <Trash2 size={14} /> Remove
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                  <RefreshCw size={14} /> Update Box
                </button>
              </div>
            </div>

            {/* In-Panel Table for Scanned Bobbins */}
            <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-tighter">
                    <th className="p-2 border-r border-slate-100">Barcode</th>
                    <th className="p-2 border-r border-slate-100">Final Length</th>
                    <th className="p-2 border-r border-slate-100">Fiber Color</th>
                    <th className="p-2">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 border-r border-slate-100 font-medium text-slate-700">{row.barcode}</td>
                      <td className="p-2 border-r border-slate-100 font-mono">{row.finalLength}</td>
                      <td className="p-2 border-r border-slate-100">{row.fiberColor}</td>
                      <td className="p-2 font-bold text-blue-600">{row.identifier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Panel: Printing Actions */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
             <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
              <Printer size={14} /> Label Generation
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FormField label="Bobbin Barcode" placeholder="Scan for Label" />
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                   Bobbin Print
                </button>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FormField label="Box Barcode" placeholder="Scan for Label" />
                </div>
                <div className="flex gap-2">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                    Box Print
                  </button>
                  <button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                    Reprint Box
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 mt-4 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Search size={16}/></div>
              <p className="text-[10px] text-blue-800 font-bold leading-tight uppercase tracking-tight">
                Scan a barcode to populate label data. <br/>
                <span className="text-blue-500 font-normal">Ensure the printer is connected and online.</span>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BoxScanningEntry;