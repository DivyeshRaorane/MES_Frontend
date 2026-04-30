import React from 'react';
import { useFormik } from 'formik';
import { 
  Database, 
  FileSpreadsheet, 
  RefreshCw, 
  ScanLine, 
  Send, 
  LogOut, 
  FileText,
  Clock,
  Activity
} from 'lucide-react';

const D2Recieving = () => {
  const formik = useFormik({
    initialValues: {
      tank: '',
      batchId: '',
      startDate: '',
      endDate: '',
      processHours: '',
      status: '',
      startOpr: '',
      endOpr: ''
    },
    onSubmit: (values) => {
      console.log('Receiving Data:', values);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      {/* Header Section */}
      <header className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">D2 Production Control</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Real-Time Monitoring Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Clock className="text-indigo-500" size={20} />
            <h2 className="font-semibold text-slate-700">D2 Real Time Monitoring</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Batch ID</th>
                  <th className="px-6 py-4 font-semibold">Bobbin Count</th>
                  <th className="px-6 py-4 font-semibold">Stage</th>
                  <th className="px-6 py-4 font-semibold">Concentration</th>
                  <th className="px-6 py-4 font-semibold">Start Time</th>
                  <th className="px-6 py-4 font-semibold">Process Hours</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2].map((i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600">B-990{i}</td>
                    <td className="px-6 py-4 text-slate-600">42</td>
                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">AGEING</span></td>
                    <td className="px-6 py-4 text-slate-600">85%</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">10:30 AM</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">04:20</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* D2 Receiving Form */}
        <section className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Database className="text-violet-500" size={20} />
            <h2 className="font-semibold text-slate-700">D2 Receiving Entry</h2>
          </div>
          <form onSubmit={formik.handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Select Tank', name: 'tank', type: 'text' },
                { label: 'Batch ID', name: 'batchId', type: 'text' },
                { label: 'Start Date', name: 'startDate', type: 'date' },
                { label: 'End Date', name: 'endDate', type: 'date' },
                { label: 'Process Hours', name: 'processHours', type: 'number' },
                { label: 'Status', name: 'status', type: 'text' },
                { label: 'Start Operator', name: 'startOpr', type: 'text' },
                { label: 'End Operator', name: 'endOpr', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-500 mb-1">{field.label}</label>
                  <input
                    {...field}
                    onChange={formik.handleChange}
                    value={formik.values[field.name]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                <Send size={20} /> Receive Material
              </button>
              <button type="button" className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <LogOut size={20} /> Exit Portal
              </button>
            </div>
          </form>
        </section>

        {/* Scan Barcode Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-violet-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <ScanLine className="absolute right-[-10px] bottom-[-10px] opacity-10" size={120} />
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ScanLine size={20} /> Scan for H2 Ageing
            </h3>
            <div className="space-y-4 relative z-10">
              <input 
                placeholder="Scan Barcode..." 
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 placeholder:text-violet-100 outline-none focus:bg-white/30"
              />
              <div className="bg-white/10 rounded-lg p-4 text-sm space-y-2 backdrop-blur-sm">
                <div className="flex justify-between"><span>PT Len:</span> <span className="font-bold">--</span></div>
                <div className="flex justify-between"><span>Grade:</span> <span className="font-bold">--</span></div>
                <div className="flex justify-between"><span>Reason:</span> <span className="font-bold italic">H2Ageing</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-700 font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-500" /> Generate Report
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">From</label>
                <input type="date" className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">To</label>
                <input type="date" className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded" />
              </div>
            </div>
            <button className="w-full bg-emerald-500 text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors">
              Download Report
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default D2Recieving;