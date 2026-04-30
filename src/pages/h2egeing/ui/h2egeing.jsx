import React from 'react';
import { useFormik } from 'formik';
import { 
  Scan, 
  Layers, 
  ClipboardCheck, 
  AlertCircle, 
  Save, 
  LogOut, 
  History,
  RotateCcw,
  Calendar
} from 'lucide-react';

const H2Ageing = () => {
  const formik = useFormik({
    initialValues: {
      barcode: '',
      batchId: '',
      date: '',
      attn1240_before: '', attn1240_after: '', attn1240_14days: '',
      attn1310_before: '', attn1310_after: '', attn1310_14days: '',
      attn1383_before: '', attn1383_after: '', attn1383_14days: '',
      attn1550_before: '', attn1550_after: '', attn1550_14days: '',
      attn1625_before: '', attn1625_after: '', attn1625_14days: '',
      testingOpr: '',
      entryOpr: ''
    },
    onSubmit: (values) => {
      console.log('Saving Record:', values);
    },
  });

  const attnFields = [
    { label: 'Attn 1240', key: 'attn1240' },
    { label: 'Attn 1310', key: 'attn1310' },
    { label: 'Attn 1383(OH)', key: 'attn1383' },
    { label: 'Attn 1550', key: 'attn1550' },
    { label: 'Attn 1625', key: 'attn1625' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      {/* Top Header / Barcode Scanner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1 bg-violet-600 rounded-2xl p-4 text-white shadow-lg flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Scan size={28} />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase opacity-80">Scan Barcode</label>
            <input 
              name="barcode"
              className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none text-lg font-bold py-1"
              placeholder="0000000000"
            />
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl"><Layers size={24} /></div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase">D2 Batch ID</p>
               <input className="text-lg font-bold text-slate-700 outline-none" placeholder="Enter Batch ID..." />
             </div>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-slate-400 uppercase flex items-center justify-end gap-1">
               <Calendar size={12} /> System Date
             </p>
             <p className="text-lg font-mono font-bold text-slate-600">04/30/2026</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Attn Testing Matrix */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2 font-bold text-slate-600 uppercase tracking-wider text-sm">
            <ClipboardCheck size={18} className="text-emerald-500" /> Attn Quality Testing
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-4">Parameter</th>
                  <th className="pb-4">Before</th>
                  <th className="pb-4">After</th>
                  <th className="pb-4">14 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attnFields.map((field) => (
                  <tr key={field.key} className="group">
                    <td className="py-3 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{field.label}</td>
                    <td className="py-3">
                      <input className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </td>
                    <td className="py-3">
                      <input className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </td>
                    <td className="py-3">
                      <input className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Testing Operator</label>
                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Entry Operator</label>
                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none" />
               </div>
            </div>
          </div>
          <div className="bg-emerald-500 h-2 w-full"></div>
        </section>

        {/* Right: Batch Management */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Issue Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <History className="text-blue-500" size={18} /> Batch Selection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pending Batches</label>
                <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm mt-1">
                  <option>Select Batch...</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fail Batches</label>
                <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm mt-1">
                  <option>Select Batch...</option>
                </select>
              </div>
            </div>
          </div>

          {/* Re-Issue for Fail Batches */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
             <h3 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
               <AlertCircle size={18} /> Re-Issue Handling
             </h3>
             <div className="space-y-3">
               <input placeholder="Scan Barcode" className="w-full p-2 rounded-lg border border-rose-200 text-sm" />
               <input placeholder="Batch ID" className="w-full p-2 rounded-lg border border-rose-200 text-sm" />
               <button className="w-full bg-rose-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors">
                 <RotateCcw size={16} /> Re-Issue
               </button>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <Save size={20} /> Save Entry
            </button>
            <button className="px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
              <LogOut size={20} />
            </button>
          </div>

        </aside>
      </div>

      {/* Bottom Table: Batch Status */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-sm font-bold text-slate-600">
          Recent Batch Activity
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="px-6 py-3">Batch ID</th>
              <th className="px-6 py-3">Barcode</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map(i => (
              <tr key={i} className="text-sm">
                <td className="px-6 py-3 font-mono text-indigo-600">BATCH-00{i}</td>
                <td className="px-6 py-3 text-slate-600 font-mono">SCN-990{i}</td>
                <td className="px-6 py-3">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">COMPLETED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default H2Ageing;