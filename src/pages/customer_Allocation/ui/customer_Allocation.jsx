import React from 'react';
import { useFormik, FormikProvider, Field, Form } from 'formik';
import { 
  FileUp, 
  XCircle, 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  ClipboardList, 
  Layers,
  CheckSquare,
  FileText,
  UploadCloud
} from 'lucide-react';

const CustomerAllocation = () => {
  const formik = useFormik({
    initialValues: {
      fiberType: 'Natural', // Natural or Col
      specifications: [],
      selectedSpecs: [],
      uploadedFile: null,
      allocationSelections: []
    },
    onSubmit: (values) => console.log('Processing Allocation:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
        <Form className="max-w-6xl mx-auto space-y-6">
          
          {/* Header & Fiber Type Selection */}
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-100">
                <Layers size={24} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">FIBER TYPE ALLOCATION</h1>
            </div>

            <div className="flex gap-4 bg-slate-100 p-1.5 rounded-xl">
              {['Natural', 'Col'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer px-6 py-2 rounded-lg transition-all has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-blue-600">
                  <Field type="radio" name="fiberType" value={type} className="sr-only" />
                  <span className="text-sm font-bold uppercase tracking-wider">{type}</span>
                </label>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Section: Specifications Table */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList size={14} /> Specification List
                </h2>
              </div>
              <div className="h-[400px] overflow-y-auto divide-y divide-slate-100">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 text-sm text-slate-600 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between group">
                    <span>Spec Item - Batch 00{i + 1}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Section: Transfer Controls */}
            <div className="lg:col-span-1 flex lg:flex-col justify-center items-center gap-4 py-8">
              <button type="button" className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all">
                <ChevronRight size={24} className="hidden lg:block" />
                <ChevronLeft size={24} className="lg:hidden" />
              </button>
              <button type="button" className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all">
                <ChevronLeft size={24} className="hidden lg:block" />
                <ChevronRight size={24} className="lg:hidden" />
              </button>
            </div>

            {/* Right Section: Selected Items & Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Selected List Container */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Allocation</h2>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">0 Items</span>
                </div>
                <div className="h-[200px] bg-slate-50/30 flex items-center justify-center border-dashed border-2 border-slate-100 m-4 rounded-xl text-slate-400 text-sm italic">
                  Transfer specifications here to allocate
                </div>
              </div>

              {/* Upload & Run Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Load Specification File</label>
                  <div className="relative group">
                    <input type="file" className="sr-only" id="file-upload" />
                    <label htmlFor="file-upload" className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-pointer group-hover:border-blue-400 transition-all">
                      <FileUp size={18} className="text-blue-500" />
                      <span>Select Batch CSV/Excel</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      <UploadCloud size={16} /> Upload
                    </button>
                    <button type="button" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-end">
                  <button type="submit" className="w-full flex items-center justify-center gap-3 py-6 bg-slate-900 text-white rounded-2xl text-lg font-black tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase group">
                    <PlayCircle size={28} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    Run Allocation
                  </button>
                </div>
              </div>

              {/* Allocation ID History Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <CheckSquare size={14} /> Allocation Records
                  </h2>
                  <button type="button" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    <FileText size={14} /> View Full Report
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                      <th className="px-5 py-2">Allocation ID</th>
                      <th className="px-5 py-2">Date Generated</th>
                      <th className="px-5 py-2 text-center w-20">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-slate-700 underline decoration-slate-200">#ALC-0982-00{i}</td>
                        <td className="px-5 py-3 text-slate-500">2026-04-{30 - i}</td>
                        <td className="px-5 py-3 text-center">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </Form>
      </div>
    </FormikProvider>
  );
};

export default CustomerAllocation;