import React, { useState } from 'react';
import { 
  Send, 
  ChevronDown, 
  Plus, 
  Monitor,
  Activity,
  Box,
  Settings,
  Trash2,
  ChevronRight,
  Menu,
  X,
  ClipboardCheck,
  LayoutDashboard,
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import DashboardChart from './dashboardChart';

const Dashboard = () => {
    return(
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Operational Dashboard</h1>
        <p className="text-slate-500 text-sm">Real-time production monitoring and KPIs</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drawn', val: '1,240 KM', color: 'text-blue-600', icon: <Activity size={18}/> },
          { label: 'Avg Speed', val: '18.5 m/s', color: 'text-green-600', icon: <TrendingUp size={18}/> },
          { label: 'Active Towers', val: '08 / 12', color: 'text-purple-600', icon: <Monitor size={18}/> },
          { label: 'Draw Flaws', val: '12 Today', color: 'text-red-500', icon: <AlertCircle size={18}/> }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.val}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{kpi.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart title="Weekly Production Yield" />
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-64">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Recent Spools</h3>
          <div className="overflow-auto flex-1 text-[11px]">
            <table className="w-full text-left">
              <thead className="text-slate-400 border-b">
                <tr><th className="pb-2">SPOOL ID</th><th className="pb-2">LEN</th><th className="pb-2">STATUS</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {['SP-9021', 'SP-9022', 'SP-9023', 'SP-9024', 'SP-9025'].map((id, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 font-medium">{id}</td>
                    <td className="py-2">25.4 KM</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold">COMPLETED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )};

  export default Dashboard