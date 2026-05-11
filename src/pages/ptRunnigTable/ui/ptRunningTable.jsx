import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  UserCheck, 
  FileText, 
  ClipboardCheck 
} from 'lucide-react';
import { ModuleCard } from '../../../components/common_fields';

const PTRunningTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy Data
  const dummyRecords = [
    { 
      id: 1,
      preform_id: 'PF-2026-001',
      operator: 'Rahul S.', 
      shift_incharge: 'Amit V.', 
      pt_no: 'PT-45', 
      drawn_spool_id: 'SP-990', 
      drawn_length: '5200m', 
      total_pt: '4800m', 
      balance: '400m', 
      remark: 'Normal' 
    },
    { 
      id: 2,
      preform_id: 'PF-2026-005',
      operator: 'Suresh K.', 
      shift_incharge: 'Amit V.', 
      pt_no: 'PT-12', 
      drawn_spool_id: 'SP-882', 
      drawn_length: '3000m', 
      total_pt: '3000m', 
      balance: '0m', 
      remark: 'Completed' 
    }
  ];

  // Filter logic based on Preform ID
  const filteredData = dummyRecords.filter(item => 
    item.preform_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = (id) => {
    console.log(`Refreshing data for Record ID: ${id}`);
    alert(`Refreshing data for ${id}...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Section */}
      <ModuleCard title="Search Preform Records" icon={<Search size={16} className="text-indigo-600" />}>
        <div className="flex flex-col gap-1.5 max-w-sm">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Search Preform ID</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. PF-2026"
              className="w-full bg-slate-100 border border-slate-200 rounded-sm px-9 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </ModuleCard>

      {/* Table Section */}
      <ModuleCard title="PT Records Overview" icon={<ClipboardCheck size={16} className="text-indigo-600" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Operator</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Shift Incharge</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">PT No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Drawn Spool ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Drawn Length</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Total PT</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Balance</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Remark</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                          {row.operator.charAt(0)}
                        </div>
                        {row.operator}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.shift_incharge}</td>
                    <td className="px-4 py-3 text-xs font-mono text-indigo-600">{row.pt_no}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.drawn_spool_id}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{row.drawn_length}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{row.total_pt}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-bold ${row.balance === '0m' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {row.balance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 italic">
                      <div className="flex items-center gap-1">
                        <FileText size={12} /> {row.remark}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleRefresh(row.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                        title="Refresh Row"
                      >
                        <RotateCw size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-10 text-center text-slate-400 text-sm">
                    No records found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ModuleCard>
      
    </div>
  );
};

export default PTRunningTable;