import React from 'react';
import { Formik, Form } from 'formik';
import { 
  Scan, 
  Layers, 
  ClipboardCheck, 
  AlertCircle, 
  Save, 
  LogOut, 
  History,
  RotateCcw,
  ChevronRight,
  Database,
  Activity
} from 'lucide-react';

import { ModuleCard,FormikSelect,FormikInput } from '../../../components/common_fields';

const H2Ageing = () => {
  const initialValues = {
    barcode: '',
    batchId: '',
    attn1240_before: '', attn1240_after: '', attn1240_14days: '',
    attn1310_before: '', attn1310_after: '', attn1310_14days: '',
    attn1383_before: '', attn1383_after: '', attn1383_14days: '',
    attn1550_before: '', attn1550_after: '', attn1550_14days: '',
    attn1625_before: '', attn1625_after: '', attn1625_14days: '',
    testingOpr: '',
    entryOpr: '',
    pendingBatch: '',
    failBatch: ''
  };

  const attnFields = [
    { label: 'Attn 1240', key: 'attn1240' },
    { label: 'Attn 1310', key: 'attn1310' },
    { label: 'Attn 1383(OH)', key: 'attn1383' },
    { label: 'Attn 1550', key: 'attn1550' },
    { label: 'Attn 1625', key: 'attn1625' },
  ];

  return (
    <Formik initialValues={initialValues} onSubmit={(v) => console.log(v)}>
      <Form className="min-h-screen bg-slate-50 font-sans text-slate-800">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
          <div className="max-w-[1400px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <History size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase leading-none">H2 Ageing</h1>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Hydrogen Ageing & Attenuation Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="hidden md:block text-right">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">System Date</p>
                  <p className="text-xs font-mono font-bold text-white">05/06/2026</p>
               </div>
               <button type="button" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors border border-white/20">
                  <LogOut size={18} />
               </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          
          {/* Scanning & ID Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 bg-violet-600 rounded-2xl p-4 text-white shadow-xl shadow-violet-100 flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl"><Scan size={28} /></div>
              <div className="flex-1">
                <FormikInput label="Primary Scan" name="barcode" placeholder="Scan Barcode ID..." 
                  className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-lg font-bold py-1 placeholder:text-white/40" />
              </div>
            </div>
            
            <div className="md:col-span-8 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                 <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100"><Layers size={24} /></div>
                 <FormikInput label="D2 Batch Association" name="batchId" placeholder="Enter Batch ID..." />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter Count</p>
                <p className="text-lg font-black text-indigo-600">05</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Matrix */}
            <div className="lg:col-span-8">
              <ModuleCard title="Attenuation Quality Matrix" icon={<ClipboardCheck size={16} className="text-emerald-500" />}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-4 pl-2">Testing Parameter</th>
                        <th className="pb-4">Initial (Before)</th>
                        <th className="pb-4">Final (After)</th>
                        <th className="pb-4">14-Day Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attnFields.map((field) => (
                        <tr key={field.key} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-2 font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                               <ChevronRight size={12} className="text-slate-300" />
                               {field.label}
                            </div>
                          </td>
                          <td className="py-4">
                            <FormikInput name={`${field.key}_before`} placeholder="0.00" />
                          </td>
                          <td className="py-4">
                            <FormikInput name={`${field.key}_after`} placeholder="0.00" />
                          </td>
                          <td className="py-4">
                            <FormikInput name={`${field.key}_14days`} placeholder="0.00" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                     <FormikInput label="Testing Operator" name="testingOpr" placeholder="Enter Operator ID" />
                     <FormikInput label="Entry Operator" name="entryOpr" placeholder="Enter Entry ID" />
                  </div>
                </div>
              </ModuleCard>
            </div>

            {/* Side Controls */}
            <div className="lg:col-span-4 space-y-6">
              <ModuleCard title="Batch Repository" icon={<Database className="text-indigo-500" size={14} />}>
                <div className="space-y-4">
                  <FormikSelect label="Pending Batches" name="pendingBatch" options={['BATCH-001', 'BATCH-002']} />
                  <FormikSelect label="Flagged / Fail Batches" name="failBatch" options={['FAIL-990', 'FAIL-991']} />
                </div>
              </ModuleCard>

              <div className="bg-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-rose-100">
                 <h3 className="font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                   <AlertCircle size={16} /> Re-Issue Handling
                 </h3>
                 <div className="space-y-3">
                   <FormikInput name="reissueBarcode" placeholder="Scan New Barcode" />
                   <button type="button" className="w-full bg-white text-rose-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 transition-all shadow-lg">
                     <RotateCcw size={14} /> Process Re-Issue
                   </button>
                 </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-blue-600 transition-all active:scale-95">
                  <Save size={18} /> Save Record
                </button>
                <button type="reset" className="px-5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <ModuleCard title="Live Batch Activity Log" icon={<Activity size={16} className="text-blue-500" />}>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-black">Ref Batch ID</th>
                  <th className="pb-3 font-black">Scan Serial</th>
                  <th className="pb-3 font-black text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3].map(i => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-4 font-mono font-bold text-indigo-600 text-xs">B-D2-H2-00{i}</td>
                    <td className="py-4 text-slate-500 font-mono text-xs">SCN-X-990{i}</td>
                    <td className="py-4 text-right text-[10px] font-bold text-slate-400">12:45 PM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ModuleCard>
        </div>
      </Form>
    </Formik>
  );
};

export default H2Ageing;