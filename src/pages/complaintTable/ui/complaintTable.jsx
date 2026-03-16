import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search,
  ArrowUpRight
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const ComplaintStatusMonitor = () => {
  // Mock data based on your uploaded image
  const complaints = [
    { id: 'CP00000001', name: 'Avik KumarMridha', regDate: '1-Dec-2021', status: 'Close', closeDate: '2-Dec-2021', age: 1 },
    { id: 'CP00000002', name: 'Super Admin', regDate: '9-Mar-2023', status: 'Open', closeDate: '', age: 449 },
    { id: 'CP00000003', name: 'Prudvi aamuru', regDate: '25-Apr-2023', status: 'Open', closeDate: '', age: 402 },
    { id: 'CP00000004', name: 'Mastanvali shaik', regDate: '18-Dec-2023', status: 'Open', closeDate: '', age: 155 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Dashboard Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2.5 rounded-xl text-white shadow-lg">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Complaint Status - OPEN/CLOSE</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">REAL-TIME RESOLUTION TRACKING</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Complaint ID..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none transition-all w-64"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* 2. Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Tickets</p>
            <p className="text-2xl font-black text-slate-800">1,284</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <ArrowUpRight size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase">Resolved</p>
            <p className="text-2xl font-black text-slate-800">1,140</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase">Awaiting Action</p>
            <p className="text-2xl font-black text-slate-800">144</p>
          </div>
          <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                <th className="p-4 border-b border-slate-700">Complaint No</th>
                <th className="p-4 border-b border-slate-700">Customer/Vendor Name</th>
                <th className="p-4 border-b border-slate-700 text-center">Date of Registration</th>
                <th className="p-4 border-b border-slate-700 text-center">Current Status</th>
                <th className="p-4 border-b border-slate-700 text-center">Date of Closure</th>
                <th className="p-4 border-b border-slate-700 text-center">Age (Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4">
                    <span className="text-sm font-bold text-indigo-600 group-hover:underline cursor-pointer">{item.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-medium text-slate-500">{item.regDate}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      item.status === 'Close' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-medium text-slate-500">{item.closeDate || '—'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock size={14} className={item.age > 100 ? 'text-rose-500' : 'text-slate-400'} />
                      <span className={`text-sm font-bold ${item.age > 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.age}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintStatusMonitor;