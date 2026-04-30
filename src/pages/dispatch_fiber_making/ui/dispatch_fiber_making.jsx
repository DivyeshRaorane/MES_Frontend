import React from 'react';
import { useFormik, FormikProvider, Field, Form } from 'formik';
import { 
  Scan, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Database, 
  Maximize2, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const FiberMakingCheck = () => {
  const formik = useFormik({
    initialValues: {
      barcode: '',
      opticalLen: '',
      customerLen: '',
      productType: '',
      colour: '',
      grade: '',
      coatType: ''
    },
    onSubmit: (values) => console.log('Checking Allocation:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-800">
        <Form className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
                  <Scan size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Scanner Portal</h1>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Entry & Verification</p>
                </div>
              </div>

              <div className="space-y-5">
                <ScanInput label="Scan Barcode here" name="barcode" icon={<Search size={16}/>} highlight />
                <div className="grid grid-cols-2 gap-4">
                  <ScanInput label="Optical Len" name="opticalLen" />
                  <ScanInput label="Customer Len" name="customerLen" />
                </div>
                <ScanInput label="Product Type" name="productType" />
                <div className="grid grid-cols-2 gap-4">
                  <ScanInput label="Colour" name="colour" />
                  <ScanInput label="Grade" name="grade" />
                </div>
                <ScanInput label="Coat Type" name="coatType" />
              </div>

              <button 
                type="submit"
                className="w-full mt-8 flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 group"
              >
                <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                Check Customer Allocation
              </button>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">System Status</p>
                <h3 className="text-lg font-bold">Database Synchronized</h3>
                <p className="text-slate-400 text-sm mt-1">Last update: 2 minutes ago</p>
              </div>
              <Database className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={120} />
            </div>
          </div>

          {/* Right Column: Data Table */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <ClipboardList className="text-indigo-600" size={20} />
                  <h2 className="font-bold text-slate-700">Allocation Records</h2>
                </div>
                <button 
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100"
                >
                  <FileSpreadsheet size={18} />
                  Export To Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Sr. No</th>
                      <th className="px-6 py-4">Barcode</th>
                      <th className="px-6 py-4">Fid</th>
                      <th className="px-6 py-4">OptLen</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Colour</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">Spec</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">#0{i}</td>
                        <td className="px-6 py-4 text-sm font-mono font-medium text-indigo-600">BC-99201-X</td>
                        <td className="px-6 py-4 text-sm text-slate-600">F-102</td>
                        <td className="px-6 py-4 text-sm text-slate-600">25.4</td>
                        <td className="px-6 py-4 text-sm text-slate-600">25.0</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-tight">Optical</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 italic">Natural</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">A+</td>
                        <td className="px-6 py-4">
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Empty state filler for look */}
              <div className="flex-1 bg-slate-50/20 flex flex-col items-center justify-center p-12 text-slate-300 border-t border-slate-50">
                <Maximize2 size={48} strokeWidth={1} className="mb-2 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-widest opacity-40">EndOf Records</p>
              </div>
            </div>
          </div>

        </Form>
      </div>
    </FormikProvider>
  );
};

const ScanInput = ({ label, name, icon, highlight }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {icon}
        </div>
      )}
      <Field 
        name={name} 
        className={`w-full ${icon ? 'pl-11' : 'px-4'} py-3.5 rounded-2xl border transition-all outline-none text-sm font-medium
          ${highlight 
            ? 'bg-amber-50/50 border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-50' 
            : 'bg-slate-50 border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50'
          }`}
      />
    </div>
  </div>
);

export default FiberMakingCheck;