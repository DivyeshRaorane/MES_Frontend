import React from 'react';
import { useFormik, FormikProvider, Field, Form } from 'formik';
import { 
  FileText, 
  BarChart3, 
  Layers, 
  Scissors, 
  History, 
  Search, 
  Download, 
  Calendar,
  Clock,
  Eye,
  Activity
} from 'lucide-react';

const PTReport = () => {
  const formik = useFormik({
    initialValues: {
      reportDate: '2026-04-30',
      fromTime: '',
      toTime: '',
      dateType: 'PT', // PT Date or Draw Date
      preformSearchId: '',
      shiftFrom: '',
      shiftTo: '',
      shiftId: 'A'
    },
    onSubmit: (values) => console.log('Generating Report:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
        <Form className="max-w-7xl mx-auto space-y-6">
          
          {/* Header & Date Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <BarChart3 size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">PT REPORTING CENTER</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Range</label>
                <div className="flex items-center gap-2">
                  <Field name="reportDate" type="date" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <span className="text-slate-300">to</span>
                  <Field name="toTime" type="time" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Date Type</label>
                <div className="flex gap-3 bg-slate-100 p-1 rounded-lg">
                  {['PT', 'Draw'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md transition-all has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-indigo-600">
                      <Field type="radio" name="dateType" value={type} className="sr-only" />
                      <span className="text-xs font-bold">{type} Date</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report Quick-Access Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ReportButton icon={<Layers className="text-blue-500" />} label="PT WIP Report" />
            <ReportButton icon={<Scissors className="text-rose-500" />} label="PT Scrap Report" />
            <ReportButton icon={<Scissors className="text-orange-500" />} label="Draw Scrap Report" />
            <ReportButton icon={<Activity className="text-amber-500" />} label="PT Break Report" />
            <ReportButton icon={<History className="text-indigo-500" />} label="PT Rewinding" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Visual Log Sheet Section */}
            <div className="lg:col-span-12">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <h2 className="font-bold flex items-center gap-2 text-slate-700">
                      <Eye size={18} className="text-indigo-500" /> Visual Log Sheet
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Field name="preformSearchId" placeholder="Enter Preform ID..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <button type="button" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">View Logs</button>
                    </div>
                  </div>

                  {/* Dynamic Status Bars (Visual Representation of Preform) */}
                  <div className="flex-1 flex flex-col gap-4 justify-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-16">DRAW LOG</span>
                      <div className="h-6 bg-slate-100 rounded-full flex-1 relative overflow-hidden border border-slate-200">
                        <div className="absolute left-[30%] w-1 h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10" />
                        <div className="absolute left-[55%] w-1 h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10" />
                        <div className="h-full bg-indigo-500/20 w-[80%]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-16">PT LOG</span>
                      <div className="h-6 bg-slate-100 rounded-full flex-1 relative overflow-hidden border border-slate-200">
                        <div className="absolute left-[30%] w-1 h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10" />
                        <div className="absolute left-[55%] w-1 h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10" />
                        <div className="h-full bg-emerald-500/20 w-[65%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th rowSpan="2" className="px-4 py-3 border-r border-slate-200">Preform ID</th>
                        <th rowSpan="2" className="px-4 py-3 border-r border-slate-200 text-center">Status</th>
                        <th colSpan="3" className="px-4 py-2 border-b border-r border-slate-200 text-center text-indigo-600">Draw Instruction</th>
                        <th colSpan="3" className="px-4 py-2 border-b text-center text-emerald-600">PT Actual Cutting</th>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-2 border-r border-slate-100">Start Pos</th>
                        <th className="px-4 py-2 border-r border-slate-100">End Pos</th>
                        <th className="px-4 py-2 border-r border-slate-200">Cutting Len</th>
                        <th className="px-4 py-2 border-r border-slate-100">Start Pos</th>
                        <th className="px-4 py-2 border-r border-slate-100">End Pos</th>
                        <th className="px-4 py-2">Cutting Len</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic font-mono text-xs">
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-700">PF-990{i}</td>
                          <td className="px-4 py-3 border-r border-slate-100 text-center">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Completed</span>
                          </td>
                          <td className="px-4 py-3 border-r border-slate-100">0.00</td>
                          <td className="px-4 py-3 border-r border-slate-100">25.40</td>
                          <td className="px-4 py-3 border-r border-slate-200 font-bold text-indigo-600">25.40</td>
                          <td className="px-4 py-3 border-r border-slate-100">0.00</td>
                          <td className="px-4 py-3 border-r border-slate-100">25.38</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">25.38</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Shift Report Sidebar */}
            <div className="lg:col-span-12">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-4">
                  <h2 className="font-bold flex items-center gap-2 text-indigo-400">
                    <Clock size={18} /> PT Shift Report
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">From</label>
                      <Field name="shiftFrom" type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">To</label>
                      <Field name="shiftTo" type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Shift</label>
                      <Field as="select" name="shiftId" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none">
                        <option value="A">Shift A</option>
                        <option value="B">Shift B</option>
                        <option value="C">Shift C</option>
                      </Field>
                    </div>
                    <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40">
                      <Download size={16} /> Export Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Form>
      </div>
    </FormikProvider>
  );
};

const ReportButton = ({ icon, label }) => (
  <button type="button" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center gap-3 group">
    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="text-xs font-black text-slate-600 uppercase tracking-tight text-center">{label}</span>
  </button>
);

export default PTReport;