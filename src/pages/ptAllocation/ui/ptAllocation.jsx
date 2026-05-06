import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  ChevronDown, RefreshCcw, LayoutGrid, Search, Settings, 
  Bell, Download, CheckCircle2, AlertCircle, Zap, 
  Filter, Layers, Activity, User, Clock, Scan, Calendar, Save
} from 'lucide-react';

const PTAllocation = () => {
  // Mock data for the table based on the new image columns
  const [activeQueue] = useState([
    { id: 1, ptMachine: "MC-01", preformId: "PR-102", drawLen: 800.5, ptDone: 450.2, balance: 350.3, nextSpool: "SP-99", nextLen: 600 },
    { id: 2, ptMachine: "MC-02", preformId: "PR-105", drawLen: 950.0, ptDone: 950.0, balance: 0, nextSpool: "SP-102", nextLen: 450 },
  ]);

  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    scanBarcode: '',
    preformId: 'PR-AUTO-778', // Mock auto-fetched
    drawLength: '1250.45',    // Mock auto-fetched
    ptMachineNo: '',
    allocatedBy: '',
    date: today,
    dtNo: 'DT-09',            // Mock auto-fetched
    ptStrain: '',
    spoolNo: 'SPL-4402'       // Mock auto-fetched
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-white">
              <Zap size={28} className="text-blue-600 fill-blue-50" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                PT Allocation
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">STABLE</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Production Environment Active
              </p>
            </div>
          </div>
        </header>

        {/* Formik Entry Section */}
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => console.log(values)}
        >
          {() => (
            <Form className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              {/* Main Form Panel */}
              <div className="xl:col-span-3 bg-white rounded-[2rem] shadow-xl border border-slate-200/40 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-blue-500" />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Allocation Entry</span>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <CustomInput label="Scan Draw Spool Barcode" name="scanBarcode" icon={Scan} placeholder="Scan..." />
                    <CustomInput label="Preform ID" name="preformId" icon={Activity} readOnly />
                    <CustomInput label="Draw Length" name="drawLength" icon={RefreshCcw} readOnly />
                    <CustomSelect label="Select PT Machine No" name="ptMachineNo" options={["MC-01", "MC-02", "MC-03"]} icon={Settings} />
                    <CustomInput label="Allocated By" name="allocatedBy" icon={User} placeholder="Enter name..." />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <CustomInput label="Date" name="date" icon={Calendar} type="date" />
                    <CustomInput label="DT No" name="dtNo" icon={HashIcon} readOnly />
                    <CustomSelect label="Select PT Strain" name="ptStrain" options={["Strain 1", "Strain 2"]} icon={Activity} />
                    <CustomInput label="Spool No" name="spoolNo" icon={Layers} readOnly />
                    
                    <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
                      <Save size={18} />
                      Save Allocation
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Reports Panel */}
              <div className="bg-slate-100 rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Quick Report</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">From Date</label>
                    <input type="date" className="w-full bg-white  rounded-xl p-2 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"  />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">To Date</label>
                    <input type="date" className="w-full bg-white  rounded-xl p-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-lg" />
                  </div>
                </div>
                <button type="button" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-sm text-white font-bold transition-all mt-6">
                  Generate Report
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Data Table Section */}
        <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200/40 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
             <h3 className="text-lg font-black text-slate-800 tracking-tight">Allocation Queue</h3>
             <div className="flex gap-2">
                <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-slate-200">
                  <RefreshCcw size={14} /> Refresh
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                  <Download size={14} /> Export
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  {["PT Machine", "Preform ID", "Draw Len", "PT Done", "Balance", "Next Allocated Spool", "Next Spool Draw Len"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeQueue.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-6 py-4 font-bold text-blue-600 text-sm">{row.ptMachine}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.preformId}</td>
                    <td className="px-6 py-4 font-mono text-xs">{row.drawLen}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.ptDone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black ${row.balance === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {row.balance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">{row.nextSpool}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.nextLen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper Components for clean UI
const CustomInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tight">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={16} />
      </div>
      <Field 
        {...props} 
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none ${props.readOnly ? 'cursor-not-allowed opacity-70 bg-slate-100' : ''}`}
      />
    </div>
  </div>
);

const CustomSelect = ({ label, icon: Icon, options, name }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-tight">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={16} />
      </div>
      <Field as="select" name={name} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-blue-400 transition-all outline-none appearance-none">
        <option value="">Select Option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </Field>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const HashIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export default PTAllocation;