import React from 'react';
import { Formik, Form } from 'formik';
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
import { ModuleCard,FormikSelect,FormikInput } from '../../../components/common_fields';

const D2Recieving = () => {
  const initialValues = {
    tank: '',
    batchId: '',
    startDate: '',
    endDate: '',
    processHours: '',
    status: '',
    startOpr: '',
    endOpr: ''
  };

  const handleSubmit = (values) => {
    console.log('Receiving Data:', values);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
       <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 p-6 space-y-6">
        
        {/* Real-Time Monitoring Table */}
        <section className="lg:col-span-12">
          <ModuleCard 
            title="D2 Real Time Monitoring" 
            icon={<Clock className="text-blue-500" size={20} />}
          >
            <div className="overflow-x-auto -m-5"> {/* Offset ModuleCard padding for full-width table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Batch ID</th>
                    <th className="px-6 py-4 font-bold">Bobbin Count</th>
                    <th className="px-6 py-4 font-bold">Stage</th>
                    <th className="px-6 py-4 font-bold">Concentration</th>
                    <th className="px-6 py-4 font-bold">Start Time</th>
                    <th className="px-6 py-4 font-bold">Process Hours</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2].map((i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-blue-600">B-990{i}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">42</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">AGEING</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">85%</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">10:30 AM</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 text-sm">04:20</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModuleCard>
        </section>

        {/* D2 Receiving Form */}
        <section className="lg:col-span-8">
          <ModuleCard 
            title="D2 Receiving Entry" 
            icon={<Database className="text-blue-500" size={20} />}
          >
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
              {() => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormikSelect 
                      label="Select Tank" 
                      name="tank" 
                      options={['Tank 01', 'Tank 02', 'Tank 03']} 
                    />
                    <FormikInput label="Batch ID" name="batchId" placeholder="Enter Batch ID" />
                    <FormikInput label="Start Date" name="startDate" type="date" />
                    <FormikInput label="End Date" name="endDate" type="date" />
                    <FormikInput label="Process Hours" name="processHours" type="number" />
                    <FormikSelect 
                      label="Status" 
                      name="status" 
                      options={['Pending', 'Completed', 'In-Progress']} 
                    />
                    <FormikInput label="Start Operator" name="startOpr" />
                    <FormikInput label="End Operator" name="endOpr" />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                      <Send size={18} /> Receive Material
                    </button>
                    <button type="button" className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                      <LogOut size={18} /> Exit Portal
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </ModuleCard>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Scan Section */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <ScanLine className="absolute right-[-10px] bottom-[-10px] opacity-10" size={120} />
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
              <ScanLine size={18} /> Scan for H2 Ageing
            </h3>
            <div className="space-y-4 relative z-10">
              <input 
                placeholder="Scan Barcode..." 
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 placeholder:text-blue-100 text-sm outline-none focus:bg-white/30 transition-all"
              />
              <div className="bg-white/10 rounded-lg p-4 text-xs space-y-2 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between"><span>PT Len:</span> <span className="font-bold">--</span></div>
                <div className="flex justify-between"><span>Grade:</span> <span className="font-bold">--</span></div>
                <div className="flex justify-between"><span>Reason:</span> <span className="font-bold italic">H2Ageing</span></div>
              </div>
            </div>
          </div>

          {/* Report Section */}
          <ModuleCard 
            title="Generate Report" 
            icon={<FileText size={18} className="text-emerald-500" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">From</label>
                  <input type="date" className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">To</label>
                  <input type="date" className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <button className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-100">
                Download Report
              </button>
            </div>
          </ModuleCard>
        </aside>

      </div>
      </div>
    </div>
  );
};

export default D2Recieving;