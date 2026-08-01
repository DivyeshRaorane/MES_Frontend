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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-200 border-2 border-purple-300 flex items-center justify-center shadow-sm">
            <Database size={20} className="text-purple-700" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Select Main Table</h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Choose the primary table for your report. All tables from the database are listed below.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading.tables}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
        >
          <RefreshCw size={12} className={loading.tables ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tables..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border-2 border-slate-300 text-sm text-slate-900
            placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {filteredTables.length} found
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {wizard.mainTable && (
        <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-300 flex items-center gap-2 shadow-sm">
          <Table2 size={14} className="text-blue-700" />
          <span className="text-xs text-blue-800 font-bold">
            Selected: <span className="text-blue-900">{wizard.mainTable}</span>
          </span>
        </div>
      )}

      {/* Table list */}
      {loading.tables ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={20} className="animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-slate-500">Loading tables...</span>
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
                className={`text-left px-3.5 py-2.5 rounded-lg border-2 transition-all text-xs font-semibold flex items-center gap-2
                  ${isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-md shadow-blue-100 ring-1 ring-blue-200'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-sm'
                  }`}
              >
                <Table2 size={12} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                <span className="truncate">{tableName}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading.tables && filteredTables.length === 0 && (
        <div className="text-center py-8">
          <Database size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">
            {search ? 'No tables match your search' : 'No tables found in database'}
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Tables are loaded dynamically from PostgreSQL. When new tables are created in the database, 
          they automatically appear here without any code changes. Click <strong className="text-slate-700">Refresh</strong> to reload.
        </p>
      </div>
    </div>
  );
};

export default StepSelectTable;
