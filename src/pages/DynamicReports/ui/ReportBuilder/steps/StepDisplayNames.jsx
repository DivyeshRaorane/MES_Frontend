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
        <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
          <Type size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Column Display Names</h2>
          <p className="text-[11px] text-slate-400">
            Set user-friendly names for each column. These will appear in the report header.
          </p>
        </div>
      </div>

      {/* Column list grouped by table */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
        {Object.entries(groupedColumns).map(([table, columns]) => (
          <div key={table} className="rounded-lg border border-slate-700/50 overflow-hidden">
            <div className="px-3 py-2 bg-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{table}</span>
            </div>
            <div className="p-3 space-y-2">
              {columns.map((col) => {
                const key = `${col.table}.${col.column}`;
                const displayName = wizard.columnDisplayNames[key] || '';
                return (
                  <div key={key} className="flex items-center gap-3">
                    {/* Database column name */}
                    <div className="w-1/3 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                        {col.column}
                      </span>
                    </div>

                    <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />

                    {/* Display name input */}
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => handleDisplayNameChange(key, e.target.value)}
                      placeholder="Display Name"
                      className="flex-1 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                        placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-generate hint */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Display names are auto-generated from column names (e.g., <code className="text-slate-400">machine_no</code> → <code className="text-slate-400">Machine No</code>). 
          You can customize them as needed.
        </p>
      </div>
    </div>
  );
};

export default StepDisplayNames;
