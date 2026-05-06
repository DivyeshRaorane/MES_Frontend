import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  FileUp, XCircle, PlayCircle, ChevronRight, 
  ChevronLeft, ClipboardList, Layers, CheckSquare, 
  FileText, UploadCloud, Trash2, Database
} from 'lucide-react';
import { ModuleCard } from '../../../components/common_fields';

const CustomerAllocation = () => {
  const initialValues = {
    fiberType: 'Natural',
    specifications: Array.from({ length: 12 }, (_, i) => ({ id: i, name: `Spec Item - Batch 00${i + 1}` })),
    selectedSpecs: [],
    uploadedFile: null,
    allocationRecords: [
      { id: 'ALC-0982-001', date: '2026-05-01' },
      { id: 'ALC-0982-002', date: '2026-05-02' },
      { id: 'ALC-0982-003', date: '2026-05-03' },
    ]
  };

  const onSubmit = (values) => {
    console.log('Running Allocation for:', values.selectedSpecs);
    alert(`Allocation Process Started for ${values.selectedSpecs.length} items`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
      {/* 1. TOP HEADER (Independent) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
        
          <div className="flex items-center gap-4">
            <div className="bg-slate/10 p-2">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight uppercase leading-none">Customer Allocation</h1>
              <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Inventory assignment engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">System Status: </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Online</span>
             </div>
          </div>
        
      </div>

      <div className="max-w-[1400px] bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 mx-auto px-6 pb-10">
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form>
              {/* 2. MODE SWITCHER & CONTROLS */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                <div className="w-full md:w-72">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fiber Classification</span>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['Natural', 'Col'].map((type) => (
                      <label key={type} className="flex-1 text-center cursor-pointer py-2 rounded-lg transition-all has-[:checked]:bg-blue-600 has-[:checked]:text-white text-slate-500 text-xs font-black uppercase tracking-tighter">
                        <Field type="radio" name="fiberType" value={type} className="sr-only" />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                   <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                      <FileUp size={14} /> Import Bulk
                   </button>
                   <button type="button" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                      <Trash2 size={14} className="text-rose-500" /> Clear All
                   </button>
                </div>
              </div>

              {/* 3. MAIN CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Spec Master */}
                <div className="lg:col-span-4">
                  <ModuleCard title="Specification Master" icon={<Database size={16} className="text-blue-600" />}>
                    <div className="h-[500px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                      {values.specifications.map((spec) => (
                        <div 
                          key={spec.id}
                          onClick={() => {
                              const newSelected = [...values.selectedSpecs, spec];
                              const newSpecs = values.specifications.filter(s => s.id !== spec.id);
                              setFieldValue('selectedSpecs', newSelected);
                              setFieldValue('specifications', newSpecs);
                          }}
                          className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-all"
                        >
                          <span>{spec.name}</span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                        </div>
                      ))}
                    </div>
                  </ModuleCard>
                </div>

                {/* Transfer Arrows */}
                <div className="lg:col-span-1 flex lg:flex-col justify-center items-center gap-3 opacity-30">
                  <div className="p-2 bg-slate-200 rounded-full"><ChevronRight size={20} className="rotate-90 lg:rotate-0" /></div>
                  <div className="p-2 bg-slate-200 rounded-full"><ChevronLeft size={20} className="rotate-90 lg:rotate-0" /></div>
                </div>

                {/* Right Side: Allocation Queue & Results */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList size={14} /> Allocation Queue
                      </h3>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">{values.selectedSpecs.length} ITEMS READY</span>
                    </div>
                    
                    <div className="p-4 h-[250px] overflow-y-auto bg-slate-50/30">
                      {values.selectedSpecs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 italic text-xs gap-3">
                           <UploadCloud size={32} strokeWidth={1} />
                           Move specifications here to process
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {values.selectedSpecs.map((spec) => (
                            <div key={spec.id} className="flex items-center justify-between bg-white p-3 border border-blue-100 rounded-xl shadow-sm">
                              <span className="text-[11px] font-bold text-slate-700">{spec.name}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  const newSpecs = [...values.specifications, spec];
                                  const newSelected = values.selectedSpecs.filter(s => s.id !== spec.id);
                                  setFieldValue('specifications', newSpecs);
                                  setFieldValue('selectedSpecs', newSelected);
                                }}
                                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <button type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-4 transition-all shadow-xl shadow-slate-200 group">
                        <PlayCircle size={22} className="text-blue-400 group-hover:text-white" />
                        <span className="font-black tracking-[0.2em] uppercase text-xs">Run Allocation Engine</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom History Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckSquare size={14} className="text-emerald-500" /> Recent Successes
                      </h3>
                      <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline">VIEW ALL REPORTS</button>
                    </div>
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-50">
                        {values.allocationRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 text-[11px] font-mono font-bold text-blue-600 underline decoration-blue-100 cursor-pointer">{record.id}</td>
                            <td className="px-5 py-3 text-[11px] font-bold text-slate-500">{record.date}</td>
                            <td className="px-5 py-3 text-right">
                              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-black text-[9px] uppercase tracking-tighter">Verified</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
    </div>
  );
};

export default CustomerAllocation;