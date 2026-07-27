/**
 * Step 3 - Select Columns
 * Load and select columns from the chosen table (and joined tables)
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Columns3, Search, CheckSquare, Square, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getTableColumns, toggleColumn, selectAllColumns, deselectAllColumns,
} from '../../../controller/reportBuilder.slice';

const StepSelectColumns = () => {
  const dispatch = useDispatch();
  const { wizard, tableColumns, loading } = useSelector((state) => state.reportBuilder);
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState({});

  // Get all tables we need columns for (main + joined)
  const allTables = [
    wizard.mainTable,
    ...wizard.joins.map((j) => j.rightTable).filter(Boolean),
  ].filter((t, i, arr) => t && arr.indexOf(t) === i);

  // Load columns for all relevant tables
  useEffect(() => {
    allTables.forEach((table) => {
      if (!tableColumns[table]) {
        dispatch(getTableColumns(table));
      }
    });
    // Expand all tables that have selected columns
    const tablesWithSelections = [...new Set(wizard.selectedColumns.map((c) => c.table))];
    const newExpanded = { ...expandedTables };
    allTables.forEach((table) => {
      if (newExpanded[table] === undefined) {
        newExpanded[table] = tablesWithSelections.includes(table) || table === wizard.mainTable;
      }
    });
    setExpandedTables(newExpanded);
  }, [dispatch, allTables.join(',')]);

  const toggleTableExpand = (table) => {
    setExpandedTables((prev) => ({ ...prev, [table]: !prev[table] }));
  };

  const isColumnSelected = (table, column) => {
    return wizard.selectedColumns.some(
      (c) => c.table === table && c.column === column
    );
  };

  const getSelectedCountForTable = (table) => {
    return wizard.selectedColumns.filter((c) => c.table === table).length;
  };

  const handleToggleColumn = (table, column, dataType) => {
    dispatch(toggleColumn({ table, column, dataType }));
  };

  const handleSelectAll = (table) => {
    const columns = tableColumns[table] || [];
    dispatch(selectAllColumns({ table, columns }));
  };

  const handleDeselectAll = (table) => {
    dispatch(deselectAllColumns({ table }));
  };

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
      character: 'bg-emerald-900/40 text-emerald-300',
      boolean: 'bg-amber-900/40 text-amber-300',
      date: 'bg-rose-900/40 text-rose-300',
      'timestamp without time zone': 'bg-rose-900/40 text-rose-300',
      'timestamp with time zone': 'bg-rose-900/40 text-rose-300',
      json: 'bg-cyan-900/40 text-cyan-300',
      jsonb: 'bg-cyan-900/40 text-cyan-300',
      uuid: 'bg-slate-700 text-slate-300',
    };
    const short = dataType?.replace('character varying', 'varchar')
      .replace('timestamp without time zone', 'timestamp')
      .replace('timestamp with time zone', 'timestamptz')
      .replace('double precision', 'double');
    return {
      className: typeMap[dataType] || 'bg-slate-700 text-slate-400',
      label: short || dataType,
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
          <Columns3 size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Select Columns</h2>
          <p className="text-[11px] text-slate-400">
            Choose which columns to include in the report. Selected: {wizard.selectedColumns.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns across all tables..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white
            placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Tables with columns */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
        {allTables.map((table) => {
          const columns = tableColumns[table] || [];
          const filtered = search
            ? columns.filter((c) => c.column_name.toLowerCase().includes(search.toLowerCase()))
            : columns;
          const selectedCount = getSelectedCountForTable(table);
          const isExpanded = expandedTables[table] !== false;

          if (search && filtered.length === 0) return null;

          return (
            <div key={table} className="rounded-lg border border-slate-700/50 overflow-hidden">
              {/* Table header */}
              <div
                className="flex items-center justify-between px-3 py-2 bg-slate-800/80 cursor-pointer"
                onClick={() => toggleTableExpand(table)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                  <span className="text-xs font-bold text-white">{table}</span>
                  {table === wizard.mainTable && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-semibold">
                      PRIMARY
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    ({selectedCount}/{columns.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectAll(table); }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    All
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeselectAll(table); }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    None
                  </button>
                </div>
              </div>

              {/* Columns list */}
              {isExpanded && (
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {loading.columns && columns.length === 0 ? (
                    <div className="col-span-2 flex items-center gap-2 py-4 justify-center">
                      <RefreshCw size={12} className="animate-spin text-slate-400" />
                      <span className="text-[11px] text-slate-400">Loading columns...</span>
                    </div>
                  ) : (
                    filtered.map((col) => {
                      const selected = isColumnSelected(table, col.column_name);
                      const badge = getDataTypeBadge(col.data_type);
                      return (
                        <button
                          key={`${table}.${col.column_name}`}
                          onClick={() => handleToggleColumn(table, col.column_name, col.data_type)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all
                            ${selected
                              ? 'bg-blue-600/15 border border-blue-600/40'
                              : 'hover:bg-slate-700/50 border border-transparent'
                            }`}
                        >
                          {selected ? (
                            <CheckSquare size={13} className="text-blue-400 flex-shrink-0" />
                          ) : (
                            <Square size={13} className="text-slate-600 flex-shrink-0" />
                          )}
                          <span className={`text-[11px] font-medium truncate flex-1 ${selected ? 'text-white' : 'text-slate-300'}`}>
                            {col.column_name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${badge.className}`}>
                            {badge.label}
                          </span>
                        </button>
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
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-[10px] text-slate-400">
            <span className="text-blue-400 font-semibold">{wizard.selectedColumns.length}</span> columns selected
            from <span className="text-blue-400 font-semibold">
              {[...new Set(wizard.selectedColumns.map((c) => c.table))].length}
            </span> table(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default StepSelectColumns;
