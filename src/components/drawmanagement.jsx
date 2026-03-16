import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DrawManagementPage = () => {
  const navigate = useNavigate();
    
    return(
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Draw Management</h1>
        <p className="text-slate-500 text-sm">Access production entries, allocations, and analytical reports</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'DrawEntry', title: 'Draw Spool Entry', desc: 'Record daily spool parameters, flaws, and consumption.', icon: <Monitor size={32}/>, color: 'blue', route:'/drawmange/drawspoolentry' },
          { id: 'DrawAcceptance', title: 'Acceptance & Allocation', desc: 'Manage preform allocation to towers and quality acceptance.', icon: <ClipboardCheck size={32}/>, color: 'emerald', route:'/drawmange/allowance' },
          { id: 'Reports', title: 'Draw Reports', desc: 'Generate and export comprehensive production & waste reports.', icon: <FileText size={32}/>, color: 'amber', route:'/underdev'}
        ].map(item => (
          <div 
            key={item.id}
            onClick={() => navigate(item.route)}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-colors 
              ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : ''}
              ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : ''}
              ${item.color === 'amber' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' : ''}
            `}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-800 transition-colors">
              Open Module <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DrawManagementPage