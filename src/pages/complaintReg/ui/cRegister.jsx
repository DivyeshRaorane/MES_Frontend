import React from 'react';
import { 
  MessageSquareWarning, 
  UserCircle, 
  Truck, 
  AlertCircle, 
  Save, 
  Send, 
  Edit3 
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const ComplaintRegister = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Header & ID Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-xl text-white shadow-lg shadow-rose-100">
              <MessageSquareWarning size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Complaint Management</h2>
              <p className="text-xs text-slate-500 font-medium">Record and track customer or vendor feedback</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
              <Save size={14} /> SAVE
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
              <Send size={14} /> SUBMIT
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95">
              <Edit3 size={14} /> MODIFY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField label="Complaint No." placeholder="Auto-generated ID" />
          <FormField label="Select Type" type="select" options={["External", "Internal", "Vendor"]} />
          <FormField label="Select Priority" type="select" options={["Low", "Medium", "High", "Critical"]} />
          <FormField label="Raised By" type="select" options={["Customer Service", "Sales Team", "QC Dept"]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Customer/Vendor Details */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Entity Details</h3>
          </div>
          <div className="space-y-4">
            <FormField label="Name of Customer/Vendor" type="select" options={["Select Entity", "Vendor A", "Customer B"]} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date of Complaint" type="date" />
              <FormField label="Date of Reporting" type="date" />
            </div>
          </div>
        </div>

        {/* 3. Nature of Complaint */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Complaint Classification</h3>
          </div>
          <div className="space-y-4">
            <FormField label="Complaint Type" type="select" options={["Product Quality", "Delayed Delivery", "Technical Support"]} />
            <FormField label="Product Details" placeholder="Batch No, Serial No..." />
          </div>
        </div>
      </div>

      {/* 4. Delivery & Logistics Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Truck className="text-indigo-600" size={18} />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Logistics & References</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField label="Purchase Order No" />
          <FormField label="PO QTY" type="number" />
          <FormField label="Reject QTY" type="number" />
          <FormField label="Shipment Date" type="date" />
          <FormField label="GRN No" />
          <FormField label="Test Certificate No" />
        </div>
      </div>

      {/* 5. Detailed Feedback/Remarks */}
      <div className="bg-slate-200 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Complaint / Feedback Full Description</label>
        </div>
        <textarea 
          className="w-full h-32 bg-slate-50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
          placeholder="Describe the issue in detail here..."
        ></textarea>
      </div>

    </div>
  );
};

export default ComplaintRegister;