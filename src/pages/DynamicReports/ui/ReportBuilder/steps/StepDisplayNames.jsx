/**
 * Step 4 - Column Display Names
 * Configure display names for each selected column
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Type, ArrowRight } from 'lucide-react';
import { setColumnDisplayName } from '../../../controller/reportBuilder.slice';

const StepDisplayNames = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);

  const handleDisplayNameChange = (key, displayName) => {
    dispatch(setColumnDisplayName({ key, displayName }));
  };

  // Group columns by table
  const groupedColumns = {};
  wizard.selectedColumns.forEach((col) => {
    if (!groupedColumns[col.table]) groupedColumns[col.table] = [];
    groupedColumns[col.table].push(col);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-amber-300 flex items-center justify-center shadow-sm">
          <Type size={20} className="text-amber-700" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Column Display Names</h2>
          <p className="text-[11px] text-slate-600 font-medium">
            Set user-friendly names for each column. These will appear in the report header.
          </p>
        </div>
      </div>

      {/* Column list grouped by table */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
        {Object.entries(groupedColumns).map(([table, columns]) => (
          <div key={table} className="rounded-xl border-2 border-slate-300 overflow-hidden bg-white shadow-sm">
            <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-amber-50/50 border-b-2 border-slate-200">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">{table}</span>
            </div>
            <div className="p-3 space-y-2.5">
              {columns.map((col) => {
                const key = `${col.table}.${col.column}`;
                const displayName = wizard.columnDisplayNames[key] || '';
                return (
                  <div key={key} className="flex items-center gap-3">
                    {/* Database column name */}
                    <div className="w-1/3 flex-shrink-0">
                      <span className="text-[11px] text-slate-700 font-mono bg-slate-100 border-2 border-slate-300 px-2.5 py-1 rounded-md inline-block">
                        {col.column}
                      </span>
                    </div>

                    <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />

                    {/* Display name input */}
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => handleDisplayNameChange(key, e.target.value)}
                      placeholder="Display Name"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border-2 border-slate-300 text-xs text-slate-900
                        placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-generate hint */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-amber-50/30 border border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Display names are auto-generated from column names (e.g., <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">machine_no</code> → <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Machine No</code>). 
          You can customize them as needed.
        </p>
      </div>
    </div>
  );
};

export default StepDisplayNames;
