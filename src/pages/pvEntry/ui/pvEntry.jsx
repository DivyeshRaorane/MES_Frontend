import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  Scan, User, Calendar, Clock, BookOpen, MessageSquare, 
  Save, LogOut, FileText, Activity, Hash, ChevronRight, CheckCircle2
} from 'lucide-react';

const PVEntry = () => {
  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    verificationType: 'online', // 'online' or 're-pv'
    fiberType: 'Nat or Col', // Auto-fetched
    colType: '',
    pvOpr: '',
    scanBarcode: '',
    qtyInNo: '0',
    qtyInKms: '0.00',
    dateTime: today,
    shift: '',
    pvInstruction: '',
    pvRemarks: '',
    fromDate: today,
    toDate: today,
    entryTable: Array(6).fill({
      barcode: '', fid: '', lenKm: '', status: '', opr: '', date: '', d2Status: '', grade: '', fType: '', bobbinType: '', bobbinCol: '', remarks: ''
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">PV Entry</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Physical Verification System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Verification Mode</p>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="verificationType" className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" defaultChecked />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Online PV</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="verificationType" className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Re-PV</span>
                </label>
              </div>
            </div>
          </div>
        </header>

        <Formik initialValues={initialValues} onSubmit={(values) => console.log(values)}>
          {({ values }) => (
            <Form className="space-y-6">
              
              {/* Parameter Selection Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Main Inputs */}
                <div className="xl:col-span-9 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <InputGroup label="Fiber Type" name="fiberType" icon={Activity} readOnly variant="yellow" />
                  <div className="hidden lg:block" /> {/* Spacer */}
                  
                  {/* Qty Highlights */}
                  <div className="row-span-2 space-y-4">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Qty in No</span>
                      <Field name="qtyInNo" className="bg-transparent text-2xl font-black text-orange-600 outline-none w-full text-center" />
                    </div>
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Qty in KMs</span>
                      <Field name="qtyInKms" className="bg-transparent text-2xl font-black text-orange-600 outline-none w-full text-center" />
                    </div>
                  </div>

                  <InputGroup label="If Col Then Col Type" name="colType" icon={Hash} variant="yellow" />
                  <InputGroup label="Date & Time" name="dateTime" type="date" icon={Calendar} variant="yellow" />
                  
                  <InputGroup label="PV Opr" name="pvOpr" icon={User} variant="yellow" />
                  <InputGroup label="Shift" name="shift" icon={Clock} variant="yellow" />
                  
                  <InputGroup label="Scan Barcode" name="scanBarcode" icon={Scan} variant="yellow" placeholder="Scan now..." />
                  <InputGroup label="PV Instruction" name="pvInstruction" icon={BookOpen} variant="yellow" />
                  
                  <div className="md:col-span-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">PV Remarks</label>
                     <div className="mt-1 relative">
                        <div className="absolute left-3 top-3 text-slate-400"><MessageSquare size={16} /></div>
                        <Field as="textarea" name="pvRemarks" className="w-full pl-10 pr-4 py-3 bg-orange-50/30 border border-orange-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all min-h-[80px]" />
                     </div>
                  </div>
                </div>

                {/* Sidebar Actions & Reporting */}
                <div className="xl:col-span-3 space-y-6">
                  <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white space-y-4">
                    <button type="submit" className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                      <Save size={18} /> Save Entry
                    </button>
                    <button type="button" className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold transition-all border border-white/10">
                      <LogOut size={18} /> Exit System
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100 space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <FileText size={12} /> Reporting Range
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                        <label className="text-[9px] font-black text-yellow-600 uppercase">From Date</label>
                        <Field type="date" name="fromDate" className="w-full bg-transparent text-xs font-bold outline-none" />
                      </div>
                      <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                        <label className="text-[9px] font-black text-yellow-600 uppercase">To Date</label>
                        <Field type="date" name="toDate" className="w-full bg-transparent text-xs font-bold outline-none" />
                      </div>
                    </div>
                    <button type="button" className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table Section */}
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entry Verification Log</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80">
                        {["Sr No", "Barcode", "FID", "Len in km", "PV Status", "PV Opr", "PV Date & Time", "Grade", "F-type", "PV Remarks"].map((header) => (
                          <th key={header} className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {values.entryTable.map((_, i) => (
                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-4 py-2 text-xs font-bold text-slate-400 text-center">{i + 1}</td>
                          {Array(9).fill(0).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1 border-r border-slate-50 last:border-0">
                              <Field className="w-full bg-transparent p-2 text-xs font-medium outline-none focus:bg-white rounded transition-colors" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, variant, ...props }) => {
  const getStyles = () => {
    if (variant === 'yellow') return "bg-yellow-50/50 border-yellow-100 focus:border-yellow-400 focus:ring-yellow-500/5";
    return "bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/5";
  };

  return (
    <div className="space-y-1.5 group">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={16} />
        </div>
        <Field 
          {...props} 
          className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-semibold transition-all outline-none ${getStyles()}`}
        />
      </div>
    </div>
  );
};

export default PVEntry;