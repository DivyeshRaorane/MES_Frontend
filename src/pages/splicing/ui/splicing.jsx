import React, { useState } from 'react';
import { Send, Edit3, ClipboardCheck, Activity, Beaker } from 'lucide-react';
import FormField from '../../../components/formInputs';

const Splicing = () => {
  const [formData, setFormData] = useState({
    testDate: '2024-05-31',
    result: 'PASS'
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-6 bg-slate-50 min-h-screen">
      
      {/* Header & Primary Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" size={20} />
            Fiber Splicing Test Log
          </h2>
          <p className="text-xs text-slate-500">Record and analyze splice loss measurements</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition-all">
            <Edit3 size={14} /> MODIFY
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all shadow-md shadow-blue-100">
            <Send size={14} /> SUBMIT DATA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Section 1: Basic Information */}
        <div className="md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> General Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <FormField label="Test Date" type="date" value={formData.testDate} />
            <FormField label="Barcode ID A" placeholder="Scan/Enter" />
            <FormField label="Barcode ID B" placeholder="Scan/Enter" />
            <FormField label="Product" type="select" options={["Product A", "Product B"]} />
            <FormField label="Brand" type="select" options={["Brand X", "Brand Y"]} />
            <FormField label="Operator" type="select" options={["John Doe", "Jane Smith"]} />
          </div>
        </div>

        {/* Section 2: Input Side A & B */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border-l-4 border-l-indigo-500 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} /> Transmission Loss (A ➔ B)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="1310 NM" />
              <FormField label="1550 NM" />
              <FormField label="1625 NM" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border-l-4 border-l-orange-500 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} /> Transmission Loss (B ➔ A)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="1310 NM" />
              <FormField label="1550 NM" />
              <FormField label="1625 NM" />
            </div>
          </div>
        </div>

        {/* Section 3: Calculations & Final Status */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Beaker size={14} /> Avg Splice Loss
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white p-2 rounded border border-blue-200 shadow-inner">
                <FormField label="Avg 1310 NM" disabled={true} />
              </div>
              <div className="bg-white p-2 rounded border border-blue-200 shadow-inner">
                <FormField label="Avg 1550 NM" disabled={true} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Final Review</h3>
             <div className="space-y-4">
                <FormField label="M/C Loss" />
                <FormField 
                  label="Final Result" 
                  type="select" 
                  value={formData.result}
                  options={["PASS", "FAIL"]} 
                />
                <FormField label="Remarks" placeholder="Note down any issues..." />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Splicing;