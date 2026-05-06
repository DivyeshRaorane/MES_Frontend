import React from 'react';
import { Formik, Form } from 'formik';
import { 
  Scan, Save, Trash2, LogOut, Activity, 
  ClipboardList, Factory, Boxes, History ,FileText
} from 'lucide-react';
import { ModuleCard,FormikInput,FormikSelect } from '../../../components/common_fields';



const D2Issue = () => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const initialValues = {
    chamberNo: '3',
    date: today,
    batchId: '',
    plant: '',
    fromDate: '',
    toDate: '',
    operator: '',
    shiftIncharge: '',
    scanBarcode: '',
    qtyInNo: '0',
    qtyInKms: '0.00',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Banner */}
        
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
            <h1 className="text-xl font-black tracking-tight uppercase flex items-center gap-3 italic">
              <Activity size={24} /> 
              D2 Issue Portal
            </h1>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
              <span className="text-[10px] font-bold uppercase opacity-80 italic">System Date</span>
              <span className="font-mono font-bold text-sm">{today}</span>
            </div>
          </div>


        <Formik initialValues={initialValues} onSubmit={(v) => console.log(v)}>
          {({ values }) => (
            <Form className="grid grid-cols-12 gap-6 bg-white shadow-xl border-x border-b border-slate-200">
              
              {/* Top Controls & Status Section */}
              <div className="col-span-12 lg:col-span-8 m-2">
                <ModuleCard title="Primary Controls" icon={<Factory className="text-blue-500" size={18} />}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormikSelect 
                      label="Select Chamber No" 
                      name="chamberNo" 
                      options={['3', '4', '5']} 
                    />
                    <FormikInput label="Current Date" name="date" readOnly />
                    <FormikInput label="Batch ID" name="batchId" placeholder="Enter ID..." />
                  </div>

                  {/* Scan Area */}
                  <div className="mt-8 relative group">
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-44 flex flex-col items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30">
                      <Scan size={48} className="text-slate-300 group-hover:text-blue-500 transition-colors mb-3" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-400 group-hover:text-blue-600">
                        Scan Barcode Here
                      </h3>
                      <input name="scanBarcode" className="opacity-0 absolute inset-0 cursor-pointer" autoFocus />
                    </div>
                  </div>
                </ModuleCard>
              </div>

              {/* Testing Status Sidebar */}
              <div className="col-span-12 lg:col-span-4 m-2">
                <ModuleCard title="Testing Status" icon={<Boxes className="text-indigo-500" size={18} />}>
                  <div className="space-y-4">
                    <FormikInput label="Plant Location" name="plant" />
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-[11px]">
                        <thead className="bg-slate-800 text-white font-bold uppercase italic">
                          <tr>
                            <th className="py-2 px-3 text-left">Status</th>
                            <th className="py-2 px-3 border-x border-slate-700">Qty (No)</th>
                            <th className="py-2 px-3">Qty (Kms)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                          <tr className="bg-emerald-50/50">
                            <td className="py-2.5 px-3 text-slate-500">Final Testing Done</td>
                            <td className="py-2.5 px-3 border-x border-slate-100 text-center">-</td>
                            <td className="py-2.5 px-3 text-center">-</td>
                          </tr>
                          <tr className="bg-amber-50/50">
                            <td className="py-2.5 px-3 text-slate-500">Testing Pending</td>
                            <td className="py-2.5 px-3 border-x border-slate-100 text-center">-</td>
                            <td className="py-2.5 px-3 text-center">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Total Qty (No)</span>
                        <span className="text-xl font-mono font-black text-slate-700">{values.qtyInNo}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Total Qty (Kms)</span>
                        <span className="text-xl font-mono font-black text-slate-700">{values.qtyInKms}</span>
                      </div>
                    </div>
                  </div>
                </ModuleCard>
              </div>

              {/* Main Data Table */}
              <div className="col-span-12 lg:col-span-8 m-2">
                <ModuleCard title="Production Log" icon={<ClipboardList className="text-blue-500" size={18} />}>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-[11px] text-center">
                      <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-2 border-r border-slate-200">Sr</th>
                          <th className="py-3 px-2 border-r border-slate-200">Barcode</th>
                          <th className="py-3 px-2 border-r border-slate-200">PT Len</th>
                          <th className="py-3 px-2 border-r border-slate-200">D2 Chamber</th>
                          <th className="py-3 px-2 border-r border-slate-200">Date/Time</th>
                          <th className="py-3 px-2">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Array(8).fill(0).map((_, i) => (
                          <tr key={i} className="h-9 hover:bg-slate-50/80 transition-colors font-medium">
                            <td className="border-r border-slate-100 text-slate-400">{i + 1}</td>
                            <td className="border-r border-slate-100"></td>
                            <td className="border-r border-slate-100"></td>
                            <td className="border-r border-slate-100"></td>
                            <td className="border-r border-slate-100"></td>
                            <td></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ModuleCard>
              </div>

              {/* Side Actions & H2 Details */}
              <div className="col-span-12 lg:col-span-4 space-y-6 m-2">
                <ModuleCard title="Personnel & Actions" icon={<History className="text-slate-500" size={18} />}>
                  <div className="space-y-4">
                    <FormikInput label="Operator Name" name="operator" />
                    <FormikInput label="Shift Incharge" name="shiftIncharge" />
                    
                    <div className="grid grid-cols-1 gap-3 pt-4">
                      <button type="submit" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
                        <Save size={18} /> Save Entry
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white py-2.5 rounded-xl font-bold uppercase text-[10px] transition-all">
                          <Trash2 size={16} /> Delete
                        </button>
                        <button type="button" onClick={() => window.close()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-2.5 rounded-xl font-bold uppercase text-[10px] transition-all">
                          <LogOut size={16} /> Exit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">H2 Ageing Details</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-[10px]">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase">
                          <tr>
                            <th className="py-2 px-2 text-left border-r border-slate-200">Barcode ID</th>
                            <th className="py-2 px-2 text-left">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Array(3).fill(0).map((_, i) => (
                            <tr key={i} className="h-8"><td className="border-r border-slate-100"></td><td></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ModuleCard>

                <ModuleCard title="Reporting" icon={<FileText className="text-emerald-500" size={18} />}>
                  <div className="space-y-4">
                    <FormikInput label="From Date" name="fromDate" type="date" />
                    <FormikInput label="To Date" name="toDate" type="date" />
                    <button type="button" className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white py-2.5 rounded-xl font-bold uppercase text-xs transition-all">
                      Generate Report
                    </button>
                  </div>
                </ModuleCard>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default D2Issue;