import React from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  User, 
  Cpu, 
  FileWarning 
} from 'lucide-react';

// Using your reusable ModuleCard component
import { ModuleCard } from '../../../components/common_fields';

const Rejected_Spools_In_PT_Allocation = () => {
  
  // Dummy Data for Rejected Spools
  const rejectedData = [
    {
      preform_id: 'PF-2026-009',
      Drawn_spool_id: 'SP-1045',
      DT_no: 'DT-X5',
      Pt_machine: 'PT-MAC-01',
      rejected_by: 'Divyesh',
      rejection_remark: 'Surface scratch detected during PT'
    },
    {
      preform_id: 'PF-2026-012',
      Drawn_spool_id: 'SP-2088',
      DT_no: 'DT-Y2',
      Pt_machine: 'PT-MAC-03',
      rejected_by: 'Suresh K.',
      rejection_remark: 'Tension fluctuation beyond limits'
    },
    {
      preform_id: 'PF-2026-021',
      Drawn_spool_id: 'SP-1090',
      DT_no: 'DT-A8',
      Pt_machine: 'PT-MAC-02',
      rejected_by: 'Amit V.',
      rejection_remark: 'Fiber breakage at start'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <ModuleCard 
        title="Rejected Spools Logs" 
        icon={<Trash2 size={18} className="text-rose-600" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preform ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drawn Spool ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">DT No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">PT Machine</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejected By</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rejection Remark</th>
              </tr>
            </thead>
            <tbody>
              {rejectedData.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b border-slate-100 hover:bg-rose-50/30 transition-colors group"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-rose-600">
                    {row.preform_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                    {row.Drawn_spool_id}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {row.DT_no}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded-md">
                      <Cpu size={12} className="text-slate-400" />
                      {row.Pt_machine}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User size={12} className="text-slate-400" />
                      {row.rejected_by}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2 text-xs text-slate-500 italic max-w-xs">
                      <FileWarning size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                      {row.rejection_remark}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State Footer */}
        {rejectedData.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-400 text-sm">No rejected spools found for this period.</p>
          </div>
        )}
      </ModuleCard>
    </div>
  );
};

export default Rejected_Spools_In_PT_Allocation;