import React from 'react';
import { useEffect,useState } from 'react';
import { Trash2, AlertTriangle, User, Cpu, FileWarning } from 'lucide-react';
import { rejectedSpools } from '../service/rejected_spool_in_pt.api';

const rejectedData = [
  { preform_id: 'PF-2026-009', Drawn_spool_id: 'SP-1045', DT_no: 'DT-X5', Pt_machine: 'PT-MAC-01', rejected_by: 'Divyesh',   rejection_remark: 'Surface scratch detected during PT'   },
  { preform_id: 'PF-2026-012', Drawn_spool_id: 'SP-2088', DT_no: 'DT-Y2', Pt_machine: 'PT-MAC-03', rejected_by: 'Suresh K.', rejection_remark: 'Tension fluctuation beyond limits'     },
  { preform_id: 'PF-2026-021', Drawn_spool_id: 'SP-1090', DT_no: 'DT-A8', Pt_machine: 'PT-MAC-02', rejected_by: 'Amit V.',   rejection_remark: 'Fiber breakage at start'               },
];

const Rejected_Spools_In_PT_Allocation = () => {

  const [rejectedData, setRejectedData] = useState([]);
const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRejectedSpools = async () => {
        try {
            const response = await rejectedSpools(true);

            if (response.success) {
                setRejectedData(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchRejectedSpools();
}, []);

console.log("rejected spools:,", rejectedData)
  
  return(
  <div className="h-full flex flex-col overflow-hidden">

    {/* ── Rejected Spools Table — scrolls internally ── */}
    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
        <Trash2 size={13} className="text-rose-600" />
        <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Rejected Spools Log</span>
      </div>

      {rejectedData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <AlertTriangle className="text-slate-300" size={28} />
          <p className="text-slate-400 text-xs">No rejected spools found for this period.</p>
        </div>
      ) : (
        /* scrollable body */
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200">
                {['Preform ID','Drawn Spool ID','DT No','PT Machine','Rejected By','Rejection Remark'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rejectedData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-rose-50/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-semibold text-rose-600">{row.preform_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600 font-mono">{row.spool_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{row.tower_no}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                      <Cpu size={11} className="text-slate-400" />
                      {row.pt_machine_no}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User size={11} className="text-slate-400" />
                      {row.allocated_by}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 italic max-w-xs">
                      <FileWarning size={12} className="text-rose-400 mt-0.5 flex-shrink-0" />
                      {row.allocation_remark}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  </div>
);}

export default Rejected_Spools_In_PT_Allocation;
