import React, { useState } from 'react';
import { 
  ChevronDown, 
  RefreshCcw, 
  LayoutGrid,
  Search,
  Settings,
  Bell,
  Download,
  CheckCircle2,
  AlertCircle,
  Zap,
  Filter,
  Layers,
  Activity,
  User,
  Clock
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const PTAllocation = () => {
  const [data] = useState([
    { id: 1, dtNo: "DT07", barcode: "DTB0003711", spoolId: "TEF123038072", identifier: "A", drawnLen: 624.82, totalPt: 473.98, bal: 150.84, remarks: "pt complet" },
    { id: 2, dtNo: "DT05", barcode: "CA10003300", spoolId: "TEFC22434051", identifier: "B", drawnLen: 803.04, totalPt: 723.403, bal: 79.637, remarks: "" },
    { id: 3, dtNo: "DT04", barcode: "DTB0015292", spoolId: "TEF623068042", identifier: "A", drawnLen: 802.84, totalPt: 746.051, bal: 56.789, remarks: "P" },
    { id: 4, dtNo: "DT07", barcode: "DTB0016134", spoolId: "TEF623328072", identifier: "A", drawnLen: 977.65, totalPt: 921.844, bal: 55.806, remarks: "P" },
    { id: 5, dtNo: "DT02", barcode: "DTB0016522", spoolId: "TEF623322021", identifier: "A", drawnLen: 658.53, totalPt: 604.407, bal: 54.123, remarks: "" },
    { id: 6, dtNo: "DT03", barcode: "DTB0017217", spoolId: "TEF723050030", identifier: "A", drawnLen: 397.55, totalPt: 359.924, bal: 37.626, remarks: "" },
    { id: 7, dtNo: "DT07", barcode: "DTB0017569", spoolId: "TEF723024070", identifier: "A", drawnLen: 573.80, totalPt: 521.833, bal: 51.967, remarks: "" },
    { id: 8, dtNo: "DT03", barcode: "DTB0020770", spoolId: "TEFA23039030", identifier: "B", drawnLen: 337.28, totalPt: 286.761, bal: 50.519, remarks: "CWA error, LD at all points" },
    { id: 9, dtNo: "DT04", barcode: "DTB0021932", spoolId: "TEFA23248045", identifier: "B", drawnLen: 99.39, totalPt: 0, bal: 99.39, remarks: "" },
    { id: 10, dtNo: "DT10", barcode: "DTB0021938", spoolId: "TEFA23317102", identifier: "B", drawnLen: 423.78, totalPt: 368.758, bal: 55.022, remarks: "okk" },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] p-4 lg:p-8 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Simplified Premium Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 border border-white">
              <Zap size={28} className="text-blue-600 fill-blue-50" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                PT Allocation
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">STABLE</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Connected to Production Node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all shadow-sm">
              <Bell size={18} />
            </button>
            <button className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all shadow-sm">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* EYE-PROTECTIVE Filter Panel */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/40 mb-8 overflow-hidden">
          {/* Subtle Gradient Header for the Panel */}
          <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-blue-500" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Master Parameters</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400">Environment: <span className="text-blue-500">Live Production</span></span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Fields Grid */}
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-5">
                <FormField label="PT Machine" type="select" options={["MC-ALPHA", "MC-BETA", "MC-GAMMA"]} icon={Layers} />
                <FormField label="Operator" type="select" options={["Tapas Mondal", "Bappa Namata"]} icon={User} />
                <FormField label="Supervisor" type="select" options={["Saurav Pandey", "Dumne Venkatesh"]} icon={User} />
                <FormField label="Fiber Identifier" placeholder="Scan or Type..." icon={Search} />
                
                <FormField label="PT WIP (m)" value="15,536.63" icon={Activity} />
                <FormField label="Rejected Spool" type="select" options={["None", "Fault-01", "Fault-02"]} icon={AlertCircle} />
                <div className="xl:col-span-2">
                  <FormField label="Rejection Remark" placeholder="Enter detailed observation..." icon={AlertCircle} />
                </div>
              </div>

              {/* Clean Action Sidebar */}
              <div className="lg:w-56 flex flex-col justify-center gap-3 border-l border-slate-100 lg:pl-8">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
                  <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  Apply & Sync
                </button>
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-slate-200/50">
                  <Filter size={16} />
                  Reset View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Data Presentation Layer */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/40 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Queue</h3>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md">{data.length} Batches Found</span>
            </div>
            
            <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-slate-200 hover:border-blue-200">
              <Download size={14} />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-5 w-12 text-center">
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </div>
                  </th>
                  {[
                    "DT NO", "Barcode", "Spool Identifier", "ID", "Drawn Len", 
                    "Total PT", "Balance", "Remarks", "Commit"
                  ].map((header) => (
                    <th key={header} className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-blue-50/40 transition-all duration-200 group ${selectedRows.includes(row.id) ? 'bg-blue-50/80' : ''}`}
                  >
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded-md font-bold text-[11px] border border-slate-100">
                        {row.dtNo}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 tracking-tight">{row.barcode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-medium text-slate-500 font-mono italic">{row.spoolId}</td>
                    <td className="px-4 py-5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        row.identifier === 'A' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {row.identifier}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-xs font-mono font-bold text-slate-600">{row.drawnLen.toFixed(2)}</td>
                    <td className="px-4 py-5 text-xs font-mono text-slate-400">{row.totalPt.toFixed(2)}</td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-black ${row.bal < 100 ? 'text-rose-500' : 'text-slate-800'}`}>
                          {row.bal.toFixed(2)}
                        </span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                            className={`h-full rounded-full transition-all duration-500 ${row.bal < 100 ? 'bg-rose-400' : 'bg-blue-400'}`} 
                            style={{ width: `${Math.min(100, (row.bal / row.drawnLen) * 100)}%` }}
                           ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {row.remarks ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100/50 px-2 py-1 rounded-md border border-slate-100 max-w-[120px] truncate">
                          <AlertCircle size={12} className="text-orange-400 flex-shrink-0" />
                          {row.remarks}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase">None</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-200 hover:scale-110 active:scale-95 transition-all">
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Statistics Footer */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield %</span>
              <span className="text-lg font-black text-slate-700 tracking-tight">98.4%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Cycle</span>
              <span className="text-lg font-black text-slate-700 tracking-tight">14.2m</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</span>
              <span className="text-lg font-black text-emerald-500 tracking-tight">Stable</span>
            </div>
            <div className="flex justify-end items-center gap-2">
               {[1, 2, 3].map(i => (
                 <button key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${i === 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-500'}`}>
                  {i}
                 </button>
               ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PTAllocation;