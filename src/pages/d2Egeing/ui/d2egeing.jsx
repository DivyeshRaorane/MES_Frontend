import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  Scan, Save, Trash2, LogOut, FileText, 
  ChevronDown, Calendar, Factory, Activity, Info 
} from 'lucide-react';

const D2Issue = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
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
    tableData: Array(10).fill({ srNo: '', barcode: '', ptLen: '', chamber: '', dateTime: '', grade: '' }),
    h2Details: Array(4).fill({ barcode: '', remarks: '' })
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-2 font-sans text-slate-900">
      {/* Top Banner Header - Swapped Yellow for Light Grey/Blue Border */}
      <div className="bg-[#e2e8f0] border-b-4 border-sky-400 py-3 mb-4 shadow-sm">
        <h1 className="text-center font-black text-2xl tracking-tighter text-slate-800 uppercase italic">
          D2 Issue Screen
        </h1>
      </div>

      <Formik initialValues={initialValues} onSubmit={(values) => console.log(values)}>
        {({ values }) => (
          <Form className="max-w-[1600px] mx-auto space-y-4">
            
            {/* Top Control Section */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* Left Group */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Select Chamber No</label>
                  <div className="relative">
                    <Field as="select" name="chamberNo" className="w-full h-10 bg-white border-2 border-sky-200 px-3 font-bold appearance-none outline-none focus:border-sky-500 transition-colors">
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </Field>
                    <ChevronDown className="absolute right-2 top-2.5 pointer-events-none text-sky-500" size={16} />
                  </div>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Current Date</label>
                  <Field name="date" readOnly className="w-full h-10 bg-[#f8fafc] border-2 border-slate-300 px-3 font-bold outline-none text-slate-600" />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Batch ID</label>
                  <Field name="batchId" className="w-full h-10 bg-white border-2 border-slate-300 px-3 font-bold outline-none focus:border-sky-400" />
                </div>

                <div className="flex flex-col md:col-span-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 ml-1">&nbsp;</label>
                   <div className="w-full h-10 bg-[#e2e8f0] border-2 border-slate-300" />
                </div>
              </div>

              {/* Right Group: Testing Status Table */}
              <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Plant</label>
                  <Field name="plant" className="w-full h-8 bg-slate-200 border-2 border-slate-300 px-2 font-bold" />
                </div>
                <div className="h-8 bg-sky-50 border-2 border-sky-200 mt-5" />
                
                <div className="col-span-2 overflow-hidden border-2 border-slate-300 text-[10px] font-bold rounded-sm">
                  <div className="grid grid-cols-3 bg-slate-200 text-center border-b-2 border-slate-300">
                    <div className="py-1">Status</div>
                    <div className="py-1 border-x-2 border-slate-300">Qty in No</div>
                    <div className="py-1">Qty in Kms</div>
                  </div>
                  <div className="grid grid-cols-3 bg-white text-center border-b border-slate-200">
                    <div className="py-1 bg-slate-50 text-slate-500">Final Testing Done</div>
                    <div className="py-1 border-x-2 border-slate-200"></div>
                    <div className="py-1"></div>
                  </div>
                  <div className="grid grid-cols-3 bg-white text-center">
                    <div className="py-1 bg-slate-50 text-slate-500">Testing Pending</div>
                    <div className="py-1 border-x-2 border-slate-200"></div>
                    <div className="py-1"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Area & Filters */}
            <div className="grid grid-cols-12 gap-6 items-start">
              
              {/* Massive Scan Box - Replaced Yellow with Light Grey/Blue */}
              <div className="col-span-12 lg:col-span-7">
                <div className="bg-white border-4 border-sky-400 h-48 flex flex-col items-center justify-center shadow-lg group hover:bg-sky-50 transition-all cursor-pointer rounded-lg">
                  <Scan size={64} className="text-sky-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-700">Scan Barcode Here</h2>
                  <Field name="scanBarcode" className="opacity-0 absolute" autoFocus />
                </div>
              </div>

              {/* Mid Filters & Totals */}
              <div className="col-span-12 lg:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black bg-slate-100 border border-slate-300 px-2 py-1 w-24">Report</label>
                    <div className="flex-1 h-6 bg-white border border-slate-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black bg-sky-100 border border-sky-300 px-2 py-1 w-24 italic text-sky-700">From Date</label>
                    <div className="flex-1 h-6 bg-white border border-sky-200" />
                  </div>
                  <div className="flex items-center gap-2 col-start-2">
                    <label className="text-[11px] font-black bg-sky-100 border border-sky-300 px-2 py-1 w-24 italic text-sky-700">To Date</label>
                    <div className="flex-1 h-6 bg-white border border-sky-200" />
                  </div>
                </div>

                {/* Big Display Totals */}
                <div className="border-2 border-slate-300 overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex">
                    <div className="w-32 bg-slate-100 p-2 text-xs font-black border-r-2 border-b-2 border-slate-300 text-slate-500">Qty in No</div>
                    <div className="flex-1 bg-white p-2 border-b-2 border-slate-200 font-black text-xl px-4 text-sky-600">{values.qtyInNo}</div>
                  </div>
                  <div className="flex">
                    <div className="w-32 bg-slate-100 p-2 text-xs font-black border-r-2 border-slate-300 text-slate-500">Qty in Kms</div>
                    <div className="flex-1 bg-white p-2 font-black text-xl px-4 text-sky-600">{values.qtyInKms}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Main Data Entry Table */}
              <div className="col-span-12 lg:col-span-8">
                <div className="border-2 border-slate-300 bg-white overflow-hidden rounded-lg shadow-md">
                  <table className="w-full text-center text-xs">
                    <thead className="bg-slate-800 border-b-2 border-sky-400 font-black uppercase tracking-tighter text-white">
                      <tr>
                        <th className="py-3 border-r border-slate-700">Sr No</th>
                        <th className="py-3 border-r border-slate-700">Barcode</th>
                        <th className="py-3 border-r border-slate-700">PT Len</th>
                        <th className="py-3 border-r border-slate-700">D2 Chamber</th>
                        <th className="py-3 border-r border-slate-700">Date & Time</th>
                        <th className="py-3 border-r border-slate-700">Grade</th>
                        <th className="py-3">Select</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {values.tableData.map((_, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-sky-50'}>
                          <td className="py-2 border-r border-slate-100 h-8 font-bold text-slate-400">{i + 1}</td>
                          <td className="py-2 border-r border-slate-100"></td>
                          <td className="py-2 border-r border-slate-100"></td>
                          <td className="py-2 border-r border-slate-100"></td>
                          <td className="py-2 border-r border-slate-100"></td>
                          <td className="py-2 border-r border-slate-100"></td>
                          <td className="py-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operator and Sidebar Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black text-slate-500 w-32 uppercase">Operator</label>
                    <Field name="operator" className="flex-1 h-9 bg-slate-50 border-2 border-sky-100 px-2 font-bold outline-none focus:border-sky-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-black text-slate-500 w-32 uppercase">Shift Incharge</label>
                    <Field name="shiftIncharge" className="flex-1 h-9 bg-slate-50 border-2 border-sky-100 px-2 font-bold outline-none focus:border-sky-400 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button type="submit" className="h-14 bg-sky-500 border-b-4 border-sky-700 text-white font-black text-lg uppercase hover:bg-sky-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 rounded-md">
                    <Save size={22} /> Save Entry
                  </button>
                  <button type="button" className="h-12 bg-white border-2 border-rose-200 text-rose-500 font-black text-md uppercase hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 rounded-md">
                    <Trash2 size={18} /> Delete
                  </button>
                  <button type="button" onClick={() => window.close()} className="h-12 bg-slate-800 text-white font-black text-md uppercase hover:bg-black transition-all flex items-center justify-center gap-2 rounded-md">
                    <LogOut size={18} /> Exit System
                  </button>
                </div>

                {/* H2 Ageing Details Small Table */}
                <div className="border-2 border-slate-300 bg-white overflow-hidden rounded-md shadow-sm">
                  <div className="bg-slate-100 py-1.5 text-center font-black text-[10px] border-b-2 border-slate-300 uppercase text-slate-600 tracking-widest">
                    H2 Ageing Details
                  </div>
                  <table className="w-full text-[10px] text-center">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                      <tr>
                        <th className="py-2 border-r border-slate-200">Barcode ID</th>
                        <th className="py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {values.h2Details.map((_, i) => (
                        <tr key={i} className="h-7 hover:bg-sky-50">
                          <td className="border-r border-slate-100"></td>
                          <td></td>
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
  );
};

export default D2Issue;