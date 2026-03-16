import React from 'react';
import { 
  Printer, 
  FileCheck, 
  Database, 
  FileSpreadsheet, 
  Calendar, 
  ClipboardList 
} from 'lucide-react';

import FormField from '../../../components/formInputs';

// Helper for the dropdown icon since FormField needs it
const ChevronDown = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const DispatchManagement = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Dispatch & Certification</h2>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">Manage TC Generation and Dispatch Records</p>
          </div>
        </div>
        <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-emerald-100 transition-colors">
          <FileSpreadsheet size={16} />
          EXPORT TO EXCEL
        </button>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
        
        {/* Row 1 */}
        <div className="relative">
          <FormField label="Dispatch Date" type="text" value="31-May-2024" />
          <Calendar size={14} className="absolute right-3 bottom-2.5 text-slate-400 pointer-events-none" />
        </div>
        <FormField label="Packing Number" type="select" options={["PK-9901", "PK-9902"]} />
        <FormField label="Product Type" disabled={true} placeholder="Auto-filled" />
        <FormField label="Fiber Type" disabled={true} placeholder="Auto-filled" />

        {/* Row 2 */}
        <FormField label="Specification" disabled={true} placeholder="Auto-filled from Packing" />
        <FormField label="Customer Name" disabled={true} placeholder="Acme Industries" />
        <FormField label="PO Number" placeholder="Enter PO Number" />
        <FormField label="Customer Type" type="select" options={["Domestic", "International"]} />

        {/* Row 3 - Action Row */}
        <div className="lg:col-span-2 flex items-end gap-3">
          <div className="flex-grow">
            <FormField label="Print TC Number" type="select" options={["TC-2024-001", "TC-2024-002"]} />
          </div>
          <button className="bg-emerald-600 text-white px-5 py-2 rounded-md font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all h-[34px]">
            <Printer size={14} /> PRINT TC
          </button>
        </div>

        <div className="flex items-end">
           <div className="w-full">
              <FormField label="Packed Quantity (KM)" disabled={true} placeholder="0.00" />
           </div>
        </div>

        <div className="flex items-end gap-2">
          <button className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all h-[34px]">
            <FileCheck size={14} /> GENERATE TC
          </button>
          <button className="flex-1 bg-slate-800 text-white py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-900 shadow-md transition-all h-[34px]">
            <Database size={14} /> GET DATA
          </button>
        </div>

      </div>
    </div>
  );
};

export default DispatchManagement;