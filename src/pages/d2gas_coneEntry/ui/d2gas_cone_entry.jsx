import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  Database, Gauge, Clock, Droplets, Save, 
  LogOut, FileBarChart, Zap, ChevronRight, Activity 
} from 'lucide-react';

const NitrogenConsumptionEntry = () => {
  const initialValues = {
    tankNo: '',
    batchId: '',
    gasConcentration: '',
    freshGas: '',
    usedGas: '',
    n2Gas: '',
    tankPressure: '',
    startTimeDate: '',
    startTimeTime: '',
    cycleTime: '',
    opr: '',
    materialCode: '',
    batch: '',
    totalBobbin: '',
    qty: '',
    gasType: '',
    cylinderNo: '',
    sideGasType: '',
    sideCylinderNo: '',
    sideStatus: '',
    sidePassword: '',
    fromDate: '',
    toDate: ''
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans text-slate-800">
      {/* Refined Header Banner */}
      <div className="bg-white border-l-8 border-sky-500 shadow-sm p-5 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3 text-slate-800">
          <Activity className="text-sky-500" size={28} /> 
          Nitrogen Consumption Entry <span className="text-sky-500 italic">D2 Portal</span>
        </h1>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 border border-slate-200">
          <span className="text-xs font-bold uppercase text-slate-500">System Date:</span>
          <span className="font-mono font-bold text-sky-600">4/30/2026</span>
        </div>
      </div>

      <Formik initialValues={initialValues} onSubmit={(v) => console.log(v)}>
        {({ values }) => (
          <Form className="max-w-[1700px] mx-auto space-y-6">
            
            <div className="grid grid-cols-12 gap-6">
              
              {/* Main Controller Section */}
              <div className="col-span-12 lg:col-span-9 bg-white border border-slate-200 shadow-md p-8 relative">
                <div className="absolute top-0 left-0 bg-sky-500 text-white px-6 py-1 text-[10px] font-black uppercase tracking-widest">
                  Primary Data Entry
                </div>

                <div className="grid grid-cols-2 gap-x-16 gap-y-6 mt-4">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Select Tank No</label>
                      <Field name="tankNo" className="w-full bg-yellow-50 border-2 border-slate-300 h-11 px-4 font-bold text-slate-800 focus:border-sky-500 focus:bg-white outline-none transition-all" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Batch ID</label>
                      <Field name="batchId" className="w-full bg-yellow-50 border-2 border-slate-300 h-11 px-4 font-bold text-slate-800 focus:border-sky-500 focus:bg-white outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Gas Concentration</label>
                      <Field name="gasConcentration" className="w-full bg-yellow-50 border-2 border-slate-300 h-11 px-4 font-bold text-slate-800 focus:border-sky-500 outline-none" />
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 space-y-4">
                      <h3 className="text-xs font-black uppercase text-sky-600 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Droplets size={14} /> Gas Consumption Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Fresh</label>
                          <Field name="freshGas" className="bg-white border border-slate-300 h-9 px-3 font-bold text-sky-700 outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500">Used</label>
                          <Field name="usedGas" className="bg-white border border-slate-300 h-9 px-3 font-bold text-sky-700 outline-none" />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="text-[10px] font-bold text-slate-500">N2 (Nitrogen)</label>
                          <Field name="n2Gas" className="bg-white border border-slate-300 h-9 px-3 font-bold text-sky-700 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Operator (OPR)</label>
                      <Field name="opr" className="w-40 bg-yellow-50 border-2 border-slate-300 h-11 px-4 font-bold text-slate-800 focus:border-sky-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Material Code</label>
                        <div className="flex gap-1">
                          <Field name="materialCode" className="flex-1 bg-sky-50 border-2 border-sky-200 h-10 px-3 font-bold text-slate-800 outline-none" />
                          <div className="w-10 bg-sky-100 border border-sky-200" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Batch</label>
                        <Field name="batch" className="w-full bg-sky-50 border-2 border-sky-200 h-10 px-3 font-bold text-slate-800 outline-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Total No of Bobbin</label>
                      <Field name="totalBobbin" className="w-full bg-sky-50 border-2 border-sky-200 h-10 px-4 font-bold outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Quantity (Qty)</label>
                      <Field name="qty" className="w-full bg-sky-50 border-2 border-sky-200 h-10 px-4 font-bold outline-none" />
                    </div>

                    <div className="flex flex-col gap-1 pt-4">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Tank Pressure (PSI/Bar)</label>
                      <Field name="tankPressure" className="w-full bg-yellow-50 border-2 border-slate-300 h-11 px-4 font-bold text-rose-600 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Bottom Timeline Section */}
                <div className="mt-10 grid grid-cols-3 gap-6 border-t-2 border-slate-100 pt-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pressure Start Time</label>
                    <div className="flex gap-1">
                      <Field name="startTimeDate" placeholder="DD/MM/YY" className="flex-1 bg-yellow-50 border border-slate-300 h-10 px-3 font-bold text-xs outline-none" />
                      <Field name="startTimeTime" placeholder="00:00" className="w-24 bg-sky-50 border border-sky-200 h-10 px-3 font-bold text-xs outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Gas Info</label>
                    <div className="flex gap-1">
                      <Field name="gasType" placeholder="Type" className="flex-1 bg-sky-50 border border-sky-200 h-10 px-3 font-bold text-xs outline-none" />
                      <Field name="cylinderNo" placeholder="Cyl #" className="flex-1 bg-sky-50 border border-sky-200 h-10 px-3 font-bold text-xs outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Cycle Duration</label>
                    <Field name="cycleTime" className="w-full bg-yellow-50 border border-slate-300 h-10 px-4 font-black text-sky-600 outline-none" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-12">
                   <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-3 font-black uppercase tracking-tighter shadow-lg shadow-emerald-100 transition-all flex items-center gap-2">
                    <Save size={20} /> Save Transaction
                   </button>
                   <button type="button" className="bg-slate-800 hover:bg-black text-white px-12 py-3 font-black uppercase tracking-tighter transition-all flex items-center gap-2">
                    <LogOut size={20} /> Close Screen
                   </button>
                </div>
              </div>

              {/* Sidebar Component */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="bg-white border border-slate-200 p-6 shadow-md">
                  <h2 className="text-xs font-black uppercase text-slate-400 mb-5 border-b pb-2 flex items-center gap-2">
                    <Database size={14} className="text-sky-500" /> Cylinder Registry
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Gas Type</label>
                      <Field name="sideGasType" className="w-full bg-sky-50 border border-sky-100 h-8 px-3 font-bold text-slate-700 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Cylinder No</label>
                      <Field name="sideCylinderNo" className="w-full bg-sky-50 border border-sky-100 h-8 px-3 font-bold text-slate-700 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Status</label>
                      <Field name="sideStatus" className="w-full bg-sky-50 border border-sky-100 h-8 px-3 font-bold text-slate-700 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Auth Password</label>
                      <Field name="sidePassword" type="password" className="w-full bg-sky-50 border border-sky-100 h-8 px-3 font-bold text-slate-700 outline-none" />
                    </div>
                    <button type="button" className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 font-black text-xs uppercase tracking-widest mt-2 shadow-sm transition-colors">
                      Update Registry
                    </button>
                  </div>

                  <div className="mt-8 border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-[10px] text-center">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase">
                        <tr>
                          <th className="py-3 px-1 border-r border-slate-200">Gas</th>
                          <th className="py-3 px-1 border-r border-slate-200">Cyl #</th>
                          <th className="py-3 px-1">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr key={i} className="h-9 hover:bg-sky-50 cursor-default transition-colors">
                            <td className="border-r border-slate-100 text-slate-400">-</td>
                            <td className="border-r border-slate-100 text-slate-400">-</td>
                            <td className="text-slate-400">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporting Section */}
            <div className="bg-white border border-slate-200 p-8 shadow-md flex items-end justify-between">
              <div className="flex gap-12 items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase text-sky-600 flex items-center gap-2">
                    <FileBarChart size={14} /> Analytics Range
                  </p>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1">Start Date</label>
                      <Field name="fromDate" className="w-48 bg-slate-50 border border-slate-300 h-10 px-4 font-bold text-slate-800 outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 mb-1 ml-1">End Date</label>
                      <Field name="toDate" className="w-48 bg-slate-50 border border-slate-300 h-10 px-4 font-bold text-slate-800 outline-none focus:border-sky-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" className="bg-sky-50 text-sky-600 border-2 border-sky-600 hover:bg-sky-600 hover:text-white px-12 py-3 font-black uppercase tracking-widest transition-all">
                Generate Report
              </button>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NitrogenConsumptionEntry;