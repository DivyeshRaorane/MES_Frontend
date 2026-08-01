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
      integer: 'bg-blue-50 text-blue-600 border-blue-200',
      bigint: 'bg-blue-50 text-blue-600 border-blue-200',
      smallint: 'bg-blue-50 text-blue-600 border-blue-200',
      numeric: 'bg-purple-50 text-purple-600 border-purple-200',
      'double precision': 'bg-purple-50 text-purple-600 border-purple-200',
      real: 'bg-purple-50 text-purple-600 border-purple-200',
      'character varying': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      text: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      boolean: 'bg-amber-50 text-amber-600 border-amber-200',
      date: 'bg-rose-50 text-rose-600 border-rose-200',
      'timestamp without time zone': 'bg-rose-50 text-rose-600 border-rose-200',
      'timestamp with time zone': 'bg-rose-50 text-rose-600 border-rose-200',
    };
    const short = dataType?.replace('character varying', 'varchar').replace('timestamp without time zone', 'timestamp').replace('timestamp with time zone', 'timestamptz').replace('double precision', 'double');
    return { className: typeMap[dataType] || 'bg-slate-50 text-slate-500 border-slate-200', label: short || dataType };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 border-2 border-emerald-300 flex items-center justify-center shadow-sm">
          <Columns3 size={20} className="text-emerald-700" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Select Columns</h2>
          <p className="text-[11px] text-slate-600 font-medium">
            Choose columns, set aggregates and grouping. Selected: <span className="font-bold text-blue-600">{wizard.selectedColumns.length}</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns across all tables..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
      </div>

      {/* Aggregate Report Indicator */}
      {hasAggregates && (
        <div className="p-3 rounded-lg bg-violet-50 border-2 border-violet-300 flex items-center gap-3 shadow-sm">
          <BarChart3 size={16} className="text-violet-700" />
          <div>
            <p className="text-[11px] text-violet-800 font-bold">Aggregate Report Detected</p>
            <p className="text-[10px] text-slate-500">
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
            <div key={table} className="rounded-xl border-2 border-slate-300 overflow-hidden bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-blue-50/50 cursor-pointer border-b-2 border-slate-200" onClick={() => toggleTableExpand(table)}>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
                  <span className="text-xs font-extrabold text-slate-900">{table}</span>
                  {table === wizard.mainTable && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border-2 border-blue-300">PRIMARY</span>}
                  <span className="text-[10px] text-slate-400">({selectedCount}/{columns.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(table); }} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">All</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeselectAll(table); }} className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold hover:underline">None</button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-2 space-y-1">
                  {loading.columns && columns.length === 0 ? (
                    <div className="flex items-center gap-2 py-4 justify-center">
                      <RefreshCw size={12} className="animate-spin text-blue-500" />
                      <span className="text-[11px] text-slate-500">Loading columns...</span>
                    </div>
                  ) : (
                    filtered.map((col) => {
                      const selected = isColumnSelected(table, col.column_name);
                      const badge = getDataTypeBadge(col.data_type);
                      const selectedCol = wizard.selectedColumns.find((c) => c.table === table && c.column === col.column_name);
                      return (
                        <div key={`${table}.${col.column_name}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                          ${selected ? 'bg-blue-50 border-2 border-blue-300 shadow-sm' : 'border-2 border-transparent hover:bg-slate-50'}`}>
                          {/* Checkbox */}
                          <button onClick={() => handleToggleColumn(table, col.column_name, col.data_type)} className="flex-shrink-0">
                            {selected ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} className="text-slate-300" />}
                          </button>
                          {/* Column name */}
                          <span className={`text-[11px] font-semibold flex-1 min-w-0 truncate ${selected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {col.column_name}
                          </span>
                          {/* Type badge */}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 border ${badge.className}`}>{badge.label}</span>
                          
                          {/* Aggregate & Group By - only show for selected columns */}
                          {selected && (
                            <>
                              {/* Aggregate select */}
                              <select
                                value={selectedCol?.aggregate || ''}
                                onChange={(e) => handleAggregateChange(table, col.column_name, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] text-indigo-700 font-semibold focus:outline-none focus:border-indigo-400 w-20"
                              >
                                {AGGREGATE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {/* Group By toggle */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleGroupByToggle(table, col.column_name); }}
                                title="Group By"
                                className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold border transition-colors flex items-center gap-0.5
                                  ${selectedCol?.groupBy
                                    ? 'bg-violet-50 border-violet-300 text-violet-700'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
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
        <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 space-y-1">
          <p className="text-[10px] text-slate-600">
            <span className="text-blue-600 font-bold">{wizard.selectedColumns.length}</span> columns selected
            {aggCount > 0 && <> • <span className="text-indigo-600 font-bold">{aggCount}</span> aggregated</>}
            {groupByCount > 0 && <> • <span className="text-violet-600 font-bold">{groupByCount}</span> grouped</>}
          </p>
          {hasAggregates && groupByCount === 0 && (
            <p className="text-[10px] text-amber-700 font-medium">
              ⚠ You have aggregate columns but no Group By. Non-aggregated columns will be auto-grouped.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StepSelectColumns;
