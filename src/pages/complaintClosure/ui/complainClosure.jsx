import React from 'react';
import { 
  FileCheck, 
  CalendarCheck, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle,
  History,
  AlertCircle,
  Info
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const ComplaintClosure = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-100">
            <FileCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Complaint Closure</h1>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Resolution & CAPA Reporting</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 uppercase">
          <CheckCircle size={16} /> Finalize Closure
        </button>
      </div>

      {/* 2. Primary Closure Fields */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <ShieldCheck size={120} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
               <Info size={14} />
               <span className="text-[10px] font-bold uppercase">Ticket Reference</span>
            </div>
            <FormField label="Complaint No." type="select" options={["--Select Complaint--", "CP001", "CP002"]} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
               <CalendarCheck size={14} />
               <span className="text-[10px] font-bold uppercase">Timeline</span>
            </div>
            <FormField label="Date of Closure" type="date" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
               <UserCheck size={14} />
               <span className="text-[10px] font-bold uppercase">Authorization</span>
            </div>
            <FormField label="Complaint Closed By" type="select" options={["--Select User--", "Quality Manager", "Tech Lead"]} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
               <History size={14} />
               <span className="text-[10px] font-bold uppercase">Compliance</span>
            </div>
            <FormField label="CAPA Report No." placeholder="Enter Report ID" />
          </div>
        </div>

        {/* Closure Remark Area */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
            Final Closure Remarks
          </label>
          <textarea 
            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 shadow-inner"
            placeholder="Document the resolution steps and verification details..."
          ></textarea>
        </div>
      </div>

      {/* 3. Reference Summary Section (ReadOnly) */}
      <div className="bg-slate-100/50 p-6 rounded-2xl border border-dashed border-slate-300">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Original Complaint Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70 grayscale-[0.5]">
          <FormField label="Raised By" disabled value="Sales Department" />
          <FormField label="Customer/Vendor" disabled value="Precision Optics Ltd" />
          <FormField label="Complaint Type" disabled value="Product Performance" />
        </div>
      </div>

      {/* 4. Help Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <AlertCircle size={18} className="text-blue-500 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Note:</strong> Closing a complaint will archive the record and notify the relevant stakeholders. Ensure the <strong>CAPA Report</strong> is attached to the physical file before submitting.
        </p>
      </div>

    </div>
  );
};

export default ComplaintClosure;