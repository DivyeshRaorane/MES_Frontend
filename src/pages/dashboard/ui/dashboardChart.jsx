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

const DashboardChart = ({ title }) =>{
    
    return(
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{title}</h3>
        <TrendingUp size={14} className="text-green-500" />
      </div>
      <div className="flex-1 flex items-end gap-2 px-2 pb-2">
        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
          <div key={i} className="flex-1 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all cursor-pointer group relative" style={{ height: `${h}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {h}km
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
      </div>
    </div>
  );
}

export default DashboardChart