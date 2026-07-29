/**
 * Step 3 - Select Columns with Aggregate & Group By support
 * Each selected column can have an aggregate function and/or be marked as Group By
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Columns3, Search, CheckSquare, Square, RefreshCw, ChevronDown, ChevronRight, BarChart3, Layers } from 'lucide-react';
import {
  getTableColumns, toggleColumn, selectAllColumns, deselectAllColumns,
  updateWizardField,
} from '../../../controller/reportBuilder.slice';

const AGGREGATE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'SUM', label: 'SUM' },
  { value: 'COUNT', label: 'COUNT' },
  { value: 'COUNT_DISTINCT', label: 'COUNT DISTINCT' },
  { value: 'AVG', label: 'AVG' },
  { value: 'MIN', label: 'MIN' },
  { value: 'MAX', label: 'MAX' },
];

const StepSelectColumns = () => {
  const dispatch = useDispatch();
  const { wizard, tableColumns, loading } = useSelector((state) => state.reportBuilder);
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState({});

  const allTables = [
    wizard.mainTable,
    ...wizard.joins.map((j) => j.rightTable).filter(Boolean),
  ].filter((t, i, arr) => t && arr.indexOf(t) === i);

  useEffect(() => {
    allTables.forEach((table) => {
      if (!tableColumns[table]) dispatch(getTableColumns(table));
    });
    const tablesWithSelections = [...new Set(wizard.selectedColumns.map((c) => c.table))];
    const newExpanded = { ...expandedTables };
    allTables.forEach((table) => {
      if (newExpanded[table] === undefined) {
        newExpanded[table] = tablesWithSelections.includes(table) || table === wizard.mainTable;
      }
    });
    setExpandedTables(newExpanded);
  }, [dispatch, allTables.join(',')]);

  const toggleTableExpand = (table) => setExpandedTables((prev) => ({ ...prev, [table]: !prev[table] }));

  const isColumnSelected = (table, column) => wizard.selectedColumns.some((c) => c.table === table && c.column === column);
  const getSelectedCountForTable = (table) => wizard.selectedColumns.filter((c) => c.table === table).length;

  const handleToggleColumn = (table, column, dataType) => dispatch(toggleColumn({ table, column, dataType }));
  const handleSelectAll = (table) => { const columns = tableColumns[table] || []; dispatch(selectAllColumns({ table, columns })); };
  const handleDeselectAll = (table) => dispatch(deselectAllColumns({ table }));

  // Update aggregate for a selected column
  const handleAggregateChange = (table, column, aggregate) => {
    const updated = wizard.selectedColumns.map((c) =>
      (c.table === table && c.column === column) ? { ...c, aggregate } : c
    );
    dispatch(updateWizardField({ field: 'selectedColumns', value: updated }));
  };

  // Toggle groupBy for a selected column
  const handleGroupByToggle = (table, column) => {
    const updated = wizard.selectedColumns.map((c) =>
      (c.table === table && c.column === column) ? { ...c, groupBy: !c.groupBy } : c
    );
    dispatch(updateWizardField({ field: 'selectedColumns', value: updated }));
  };

  // Check if report has any aggregates
  const hasAggregates = wizard.selectedColumns.some((c) => c.aggregate);
  const groupByCount = wizard.selectedColumns.filter((c) => c.groupBy).length;
  const aggCount = wizard.selectedColumns.filter((c) => c.aggregate).length;

  const getDataTypeBadge = (dataType) => {
    const typeMap = {
      integer: 'bg-blue-900/40 text-blue-300',
      bigint: 'bg-blue-900/40 text-blue-300',
      smallint: 'bg-blue-900/40 text-blue-300',
      numeric: 'bg-purple-900/40 text-purple-300',
      'double precision': 'bg-purple-900/40 text-purple-300',
      real: 'bg-purple-900/40 text-purple-300',
      'character varying': 'bg-emerald-900/40 text-emerald-300',
      text: 'bg-emerald-900/40 text-emerald-300',
      boolean: 'bg-amber-900/40 text-amber-300',
      date: 'bg-rose-900/40 text-rose-300',
      'timestamp without time zone': 'bg-rose-900/40 text-rose-300',
      'timestamp with time zone': 'bg-rose-900/40 text-rose-300',
    };
    const short = dataType?.replace('character varying', 'varchar').replace('timestamp without time zone', 'timestamp').replace('timestamp with time zone', 'timestamptz').replace('double precision', 'double');
    return { className: typeMap[dataType] || 'bg-slate-700 text-slate-400', label: short || dataType };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
          <Columns3 size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Select Columns</h2>
          <p className="text-[11px] text-slate-400">
            Choose columns, set aggregates and grouping. Selected: {wizard.selectedColumns.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns across all tables..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
      </div>

      {/* Aggregate Report Indicator */}
      {hasAggregates && (
        <div className="p-3 rounded-lg bg-violet-900/20 border border-violet-700/50 flex items-center gap-3">
          <BarChart3 size={16} className="text-violet-400" />
          <div>
            <p className="text-[11px] text-violet-300 font-semibold">Aggregate Report Detected</p>
            <p className="text-[10px] text-slate-400">
              {aggCount} aggregate column(s), {groupByCount} group-by column(s). 
              Non-aggregated columns will be auto-included in GROUP BY.
            </p>
          </div>
        </div>
      )}

      {/* Tables with columns */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {allTables.map((table) => {
          const columns = Array.isArray(tableColumns[table]) ? tableColumns[table] : [];
          const filtered = search ? columns.filter((c) => c.column_name.toLowerCase().includes(search.toLowerCase())) : columns;
          const selectedCount = getSelectedCountForTable(table);
          const isExpanded = expandedTables[table] !== false;
          if (search && filtered.length === 0) return null;

          return (
            <div key={table} className="rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 cursor-pointer" onClick={() => toggleTableExpand(table)}>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                  <span className="text-xs font-bold text-white">{table}</span>
                  {table === wizard.mainTable && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-semibold">PRIMARY</span>}
                  <span className="text-[10px] text-slate-500">({selectedCount}/{columns.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(table); }} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold">All</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeselectAll(table); }} className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold">None</button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-2 space-y-1">
                  {loading.columns && columns.length === 0 ? (
                    <div className="flex items-center gap-2 py-4 justify-center">
                      <RefreshCw size={12} className="animate-spin text-slate-400" />
                      <span className="text-[11px] text-slate-400">Loading columns...</span>
                    </div>
                  ) : (
                    filtered.map((col) => {
                      const selected = isColumnSelected(table, col.column_name);
                      const badge = getDataTypeBadge(col.data_type);
                      const selectedCol = wizard.selectedColumns.find((c) => c.table === table && c.column === col.column_name);
                      return (
                        <div key={`${table}.${col.column_name}`} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all
                          ${selected ? 'bg-blue-600/10 border border-blue-600/30' : 'border border-transparent hover:bg-slate-700/30'}`}>
                          {/* Checkbox */}
                          <button onClick={() => handleToggleColumn(table, col.column_name, col.data_type)} className="flex-shrink-0">
                            {selected ? <CheckSquare size={13} className="text-blue-400" /> : <Square size={13} className="text-slate-600" />}
                          </button>
                          {/* Column name */}
                          <span className={`text-[11px] font-medium flex-1 min-w-0 truncate ${selected ? 'text-white' : 'text-slate-300'}`}>
                            {col.column_name}
                          </span>
                          {/* Type badge */}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${badge.className}`}>{badge.label}</span>
                          
                          {/* Aggregate & Group By - only show for selected columns */}
                          {selected && (
                            <>
                              {/* Aggregate select */}
                              <select
                                value={selectedCol?.aggregate || ''}
                                onChange={(e) => handleAggregateChange(table, col.column_name, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-[9px] text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500 w-20"
                              >
                                {AGGREGATE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {/* Group By toggle */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleGroupByToggle(table, col.column_name); }}
                                title="Group By"
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border transition-colors flex items-center gap-0.5
                                  ${selectedCol?.groupBy
                                    ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                    : 'bg-slate-700 border-slate-600 text-slate-500 hover:text-slate-300'}`}
                              >
                                <Layers size={9} />
                                GB
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {wizard.selectedColumns.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-1">
          <p className="text-[10px] text-slate-400">
            <span className="text-blue-400 font-semibold">{wizard.selectedColumns.length}</span> columns selected
            {aggCount > 0 && <> • <span className="text-cyan-400 font-semibold">{aggCount}</span> aggregated</>}
            {groupByCount > 0 && <> • <span className="text-violet-400 font-semibold">{groupByCount}</span> grouped</>}
          </p>
          {hasAggregates && groupByCount === 0 && (
            <p className="text-[10px] text-amber-400">
              ⚠ You have aggregate columns but no Group By. Non-aggregated columns will be auto-grouped.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StepSelectColumns;
