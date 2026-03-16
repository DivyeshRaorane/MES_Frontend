import React, { useState } from 'react';
import { Send, Edit3, Settings, Zap, Microscope } from 'lucide-react';
import FormField from '../../../components/formInputs';

const Macrobend = () => {
  const [formData, setFormData] = useState({
    testingDate: '2024-05-31',
    result: 'PASS'
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-6 bg-slate-50 min-h-screen">
      
      {/* Module Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Microscope className="text-emerald-600" size={20} />
            Product Testing & MAC Verification
          </h2>
          <p className="text-xs text-slate-500">Record device specifications and wavelength performance</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition-all">
            <Edit3 size={14} /> MODIFY
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all shadow-md shadow-emerald-100">
            <Send size={14} /> SUBMIT RECORD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Device Identity (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Settings size={14} /> Device Identification
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <FormField label="Testing Date" type="date" value={formData.testingDate} />
              <FormField label="Operator" type="select" options={["Operator 1", "Operator 2"]} />
              <FormField label="Brand Name" type="select" options={["Brand A", "Brand B"]} />
              <FormField label="Product Name" type="select" options={["Model X", "Model Y"]} />
            </div>
          </div>
        </div>

        {/* Right Column: Measurements & Results (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Physical & Technical Specs */}
          <div className="bg-white p-5 rounded-xl border-t-4 border-t-emerald-500 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Zap size={14} /> Technical Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Barcode ID" placeholder="Scan Barcode" />
              <FormField label="MAC Value" disabled={true} placeholder="Auto-gen" />
              <FormField label="Turns" type="select" options={["1", "2", "3"]} />
              <FormField label="M/C Value" placeholder="Enter value" />
            </div>
          </div>

          {/* Wavelength Analysis */}
          <div className="bg-slate-100 p-5 rounded-xl shadow-lg">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">
              Wavelength Performance (NM)
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-teal-800 p-3 rounded-lg border border-slate-700">
                <FormField label="1310 NM" />
              </div>
              <div className="bg-teal-800 p-3 rounded-lg border border-slate-700">
                <FormField label="1550 NM" />
              </div>
              <div className="bg-teal-800 p-3 rounded-lg border border-slate-700">
                <FormField label="1625 NM" />
              </div>
            </div>
          </div>

          {/* Final Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="flex-1">
                <FormField 
                  label="Final Result" 
                  type="select" 
                  value={formData.result}
                  options={["PASS", "FAIL", "HOLD"]} 
                />
              </div>
              <div className="flex-[2]">
                <FormField label="Remarks" placeholder="Enter technical observations..." />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Macrobend;