import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ReportTable = ({ columns, data, expandable = false, renderExpanded, loading = false, emptyMessage = 'No data available' }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
          <div className="h-2 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-xs text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-white border border-slate-200 rounded-lg">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-slate-800 text-white z-10">
          <tr>
            {expandable && <th className="px-2 py-2 w-8" />}
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap border-r border-slate-700 last:border-0">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, idx) => (
            <>
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                {expandable && (
                  <td className="px-2 py-1.5">
                    <button onClick={() => toggleExpand(idx)} className="text-slate-400 hover:text-blue-600">
                      {expanded[idx] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                  </td>
                )}
                {columns.map((col, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-[10px] text-slate-700 whitespace-nowrap border-r border-slate-50 last:border-0">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
              {expandable && expanded[idx] && renderExpanded && (
                <tr key={`exp-${idx}`}>
                  <td colSpan={columns.length + 1} className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    {renderExpanded(row)}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
