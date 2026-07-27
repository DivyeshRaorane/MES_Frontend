/**
 * Step 2 - Select Main Table
 * Dynamically loads all PostgreSQL tables for selection
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Database, Search, Table2, RefreshCw } from 'lucide-react';
import { getTables, setMainTable } from '../../../controller/reportBuilder.slice';

const StepSelectTable = () => {
  const dispatch = useDispatch();
  const { tables: rawTables, wizard, loading } = useSelector((state) => state.reportBuilder);
  const [search, setSearch] = useState('');

  // Ensure tables is always an array
  const tables = Array.isArray(rawTables) ? rawTables : [];

  // Debug: log wizard state
  console.log('[StepSelectTable] wizard.mainTable:', wizard.mainTable, '| selectedColumns:', wizard.selectedColumns?.length);

  useEffect(() => {
    if (tables.length === 0) {
      dispatch(getTables());
    }
  }, [dispatch, tables.length]);

  const filteredTables = tables.filter((t) =>
    (t.table_name || t).toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTable = (tableName) => {
    dispatch(setMainTable(tableName));
  };

  const handleRefresh = () => {
    dispatch(getTables());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <Database size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Select Main Table</h2>
            <p className="text-[11px] text-slate-400">
              Choose the primary table for your report. All tables from the database are listed below.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading.tables}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={12} className={loading.tables ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tables..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white
            placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
            {filteredTables.length} found
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {wizard.mainTable && (
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/50 flex items-center gap-2">
          <Table2 size={14} className="text-blue-400" />
          <span className="text-xs text-blue-300 font-semibold">
            Selected: <span className="text-blue-100">{wizard.mainTable}</span>
          </span>
        </div>
      )}

      {/* Table list */}
      {loading.tables ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={20} className="animate-spin text-blue-400" />
          <span className="ml-2 text-sm text-slate-400">Loading tables...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredTables.map((table) => {
            const tableName = table.table_name || table;
            const isSelected = wizard.mainTable === tableName;
            return (
              <button
                key={tableName}
                onClick={() => handleSelectTable(tableName)}
                className={`text-left px-3 py-2.5 rounded-lg border transition-all text-xs font-medium flex items-center gap-2
                  ${isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600'
                  }`}
              >
                <Table2 size={12} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
                <span className="truncate">{tableName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading.tables && filteredTables.length === 0 && (
        <div className="text-center py-8">
          <Database size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">
            {search ? 'No tables match your search' : 'No tables found in database'}
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Tables are loaded dynamically from PostgreSQL. When new tables are created in the database, 
          they automatically appear here without any code changes. Click <strong>Refresh</strong> to reload.
        </p>
      </div>
    </div>
  );
};

export default StepSelectTable;
