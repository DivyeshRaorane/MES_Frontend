import { useState } from "react";
import { 
  Save,
  Grid,
} from 'lucide-react';

const BulkEntryTable = () => {
  const [rows] = useState(Array(10).fill({}));
  const headers = [
    "SELECT", "PREFORM ID", "MATERIAL", "PREFORM USABLE WEIGHT", 
    "PREFORM USABLE LENGTH", "DIA", "MAX DIA", "MIN DIA", "ATL DIA VAR", 
    "DIA 1", "DIA 2", "DIA 3", "DIA 4", "DIA 5", "DIA 6", "DIA 7", "DIA 8", "DIA 9", "DIA 10", "CONE LEN"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
          <Grid size={22} className="text-blue-600" /> Preform Acceptance Entry
        </h2>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2">
            <Save size={16} /> Save All Rows
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[2000px]">
          <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={`px-2 py-3 text-[10px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-r-0 ${i === 0 ? 'w-16' : 'w-32'}`}>
                  <div className="text-center">{header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2 border-r border-slate-100"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></td>
                {Array(19).fill(0).map((__, colIndex) => (
                  <td key={colIndex} className="px-1 py-1 border-r border-slate-100"><input type="text" className="w-full px-2 py-1.5 text-xs text-center border rounded-md outline-none" placeholder="-" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default BulkEntryTable