/**
 * Table Configuration Modal
 * A full-screen modal with mini-step wizard for configuring a single table.
 * Reuses the same configuration concepts as the main wizard steps but operates
 * on the multiSheetReport.editingTableConfig state.
 *
 * Steps: Table Info → Select Source → Columns → Display Names → Column Order →
 *        Joins → Expressions → Filters → Sort & Group → Preview
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X, ChevronLeft, ChevronRight, Save, Database, Columns3,
  Type, GripVertical, Link2, Calculator, Filter, ArrowUpDown,
  Eye, FileText, Search, CheckSquare, Square, RefreshCw,
  ChevronDown, ChevronRight as ChevronR, Plus, Trash2, BarChart3, Layers,
} from 'lucide-react';
import {
  msCancelEditingTable,
  msSaveEditingTable,
  msUpdateTableField,
  msSetTableMainTable,
  msToggleColumn,
  msSelectAllColumns,
  msDeselectAllColumns,
  msSetColumnDisplayName,
  msSetColumnOrder,
  msAddJoin,
  msUpdateJoin,
  msRemoveJoin,
  msAddExpression,
  msUpdateExpression,
  msRemoveExpression,
  msAddFilter,
  msUpdateFilter,
  msRemoveFilter,
  msAddSort,
  msUpdateSort,
  msRemoveSort,
  msSetGroupBy,
  msToggleGroupByColumn,
  msAddAggregate,
  msUpdateAggregate,
  msRemoveAggregate,
  msUpdateTableFormatting,
  msSetTableSpacing,
  getTables,
  getTableColumns,
  previewReportData,
  clearPreview,
} from '../../../controller/reportBuilder.slice';

const STEPS = [
  { key: 'info', label: 'Table Info', icon: FileText },
  { key: 'source', label: 'Source Table', icon: Database },
  { key: 'columns', label: 'Columns', icon: Columns3 },
  { key: 'display', label: 'Display Names', icon: Type },
  { key: 'order', label: 'Column Order', icon: GripVertical },
  { key: 'joins', label: 'Joins', icon: Link2 },
  { key: 'expressions', label: 'Expressions', icon: Calculator },
  { key: 'filters', label: 'Filters', icon: Filter },
  { key: 'sortgroup', label: 'Sort & Group', icon: ArrowUpDown },
  { key: 'preview', label: 'Preview', icon: Eye },
];

const AGGREGATE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'SUM', label: 'SUM' },
  { value: 'COUNT', label: 'COUNT' },
  { value: 'COUNT_DISTINCT', label: 'COUNT DISTINCT' },
  { value: 'AVG', label: 'AVG' },
  { value: 'MIN', label: 'MIN' },
  { value: 'MAX', label: 'MAX' },
];

const JOIN_TYPES = ['INNER', 'LEFT', 'RIGHT', 'FULL'];

const FILTER_TYPES = [
  { value: 'text', label: 'Text (ILIKE)' },
  { value: 'number', label: 'Number (=)' },
  { value: 'date', label: 'Date' },
  { value: 'daterange', label: 'Date Range' },
  { value: 'select', label: 'Dropdown' },
];

const TableConfigModal = () => {
  const dispatch = useDispatch();
  const tc = useSelector((state) => state.reportBuilder.wizard.editingTableConfig);
  const rawTables = useSelector((state) => state.reportBuilder.tables);
  const tableColumns = useSelector((state) => state.reportBuilder.tableColumns);
  const loading = useSelector((state) => state.reportBuilder.loading);
  const previewData = useSelector((state) => state.reportBuilder.previewData);
  const previewSQL = useSelector((state) => state.reportBuilder.previewSQL);

  const [step, setStep] = useState(0);
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState({});

  const tables = Array.isArray(rawTables) ? rawTables : [];

  // Load tables on mount
  useEffect(() => {
    if (tables.length === 0) dispatch(getTables());
  }, [dispatch, tables.length]);

  // Load columns for main table and joined tables
  useEffect(() => {
    if (!tc) return;
    const allTables = [tc.mainTable, ...tc.joins.map(j => j.rightTable)].filter(Boolean);
    allTables.forEach(t => {
      if (!tableColumns[t]) dispatch(getTableColumns(t));
    });
  }, [dispatch, tc?.mainTable, tc?.joins?.length]);

  if (!tc) return null;

  // All tables used in this table config
  const allUsedTables = useMemo(() => {
    return [tc.mainTable, ...tc.joins.map(j => j.rightTable)].filter((t, i, a) => t && a.indexOf(t) === i);
  }, [tc.mainTable, tc.joins]);

  const canGoNext = () => {
    switch (step) {
      case 0: return tc.tableName?.trim();
      case 1: return tc.mainTable;
      case 2: return tc.selectedColumns.length > 0;
      default: return true;
    }
  };

  const handleSave = () => {
    dispatch(msSaveEditingTable());
  };

  const handleCancel = () => {
    dispatch(msCancelEditingTable());
  };

  const handlePreview = () => {
    dispatch(previewReportData({
      main_table: tc.mainTable,
      columns: tc.selectedColumns,
      column_order: tc.columnOrder,
      column_display_names: tc.columnDisplayNames,
      joins: tc.joins,
      expressions: tc.expressions,
      filters: tc.filters,
      sorting: tc.sorting,
      group_by: tc.groupBy,
      aggregates: tc.aggregates,
      having: tc.having,
    }));
  };

  // ─── Step Renderers ─────────────────────────────────────────────────────

  const renderStepInfo = () => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Table Title *</label>
        <input
          type="text" value={tc.tableName}
          onChange={(e) => dispatch(msUpdateTableField({ field: 'tableName', value: e.target.value }))}
          placeholder="e.g., Draw Entry Summary"
          className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700
            focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
        <p className="text-[10px] text-slate-400 mt-1">This title appears above the table in the Excel sheet.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Spacing After Table</label>
          <input
            type="number" min="0" max="10" value={tc.spacing ?? 2}
            onChange={(e) => dispatch(msSetTableSpacing(Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700
              focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          <p className="text-[10px] text-slate-400 mt-1">Blank rows after this table in Excel output.</p>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Header Bold</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={tc.formatting?.headerBold !== false}
              onChange={(e) => dispatch(msUpdateTableFormatting({ headerBold: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <span className="text-xs text-slate-600">Bold column headers</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStepSource = () => {
    const filteredTables = tables.filter(t =>
      (t.table_name || t).toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700
              placeholder-slate-400 focus:outline-none focus:border-blue-400"
          />
        </div>
        {loading.tables ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={16} className="animate-spin text-blue-500" />
            <span className="ml-2 text-xs text-slate-500">Loading tables...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
            {filteredTables.map((t) => {
              const name = t.table_name || t;
              const isSelected = tc.mainTable === name;
              return (
                <button key={name}
                  onClick={() => dispatch(msSetTableMainTable(name))}
                  className={`text-left p-2.5 rounded-lg border text-[11px] transition-all
                    ${isSelected ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <Database size={11} className={`inline mr-1.5 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStepColumns = () => {
    const isColumnSelected = (table, column) =>
      tc.selectedColumns.some(c => c.table === table && c.column === column);

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <p className="text-[11px] text-slate-500">
          Selected: <span className="font-bold text-blue-600">{tc.selectedColumns.length}</span> column(s)
        </p>
        <div className="max-h-[450px] overflow-y-auto space-y-3">
          {allUsedTables.map(table => {
            const cols = tableColumns[table] || [];
            const isExpanded = expandedTables[table] !== false;
            const selectedCount = tc.selectedColumns.filter(c => c.table === table).length;

            return (
              <div key={table} className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 cursor-pointer"
                  onClick={() => setExpandedTables(prev => ({ ...prev, [table]: !isExpanded }))}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronR size={12} />}
                    <Database size={11} className="text-blue-500" />
                    <span className="text-[11px] font-semibold text-slate-700">{table}</span>
                    {selectedCount > 0 && (
                      <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); dispatch(msSelectAllColumns({ table, columns: cols })); }}
                      className="text-[9px] text-blue-600 hover:underline">All</button>
                    <button onClick={(e) => { e.stopPropagation(); dispatch(msDeselectAllColumns({ table })); }}
                      className="text-[9px] text-slate-400 hover:underline">None</button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-2">
                    {cols.map(col => {
                      const colName = col.column_name || col;
                      const dataType = col.data_type || 'text';
                      const selected = isColumnSelected(table, colName);
                      return (
                        <button key={colName}
                          onClick={() => dispatch(msToggleColumn({ table, column: colName, dataType }))}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] text-left transition-all
                            ${selected ? 'bg-blue-50 border border-blue-200 text-blue-700 font-medium'
                              : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {selected ? <CheckSquare size={10} className="text-blue-500" /> : <Square size={10} className="text-slate-300" />}
                          <span className="truncate">{colName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepDisplayNames = () => (
    <div className="max-w-2xl mx-auto space-y-3 max-h-[450px] overflow-y-auto">
      {tc.columnOrder.map(key => {
        const display = tc.columnDisplayNames[key] || key.split('.').pop();
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 w-40 truncate font-mono">{key}</span>
            <input
              type="text" value={display}
              onChange={(e) => dispatch(msSetColumnDisplayName({ key, displayName: e.target.value }))}
              className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-[11px] text-slate-700
                focus:outline-none focus:border-blue-400"
            />
          </div>
        );
      })}
      {tc.columnOrder.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-8">Select columns first (Step 3)</p>
      )}
    </div>
  );

  const renderStepColumnOrder = () => {
    const handleDragStart = (e, idx) => { e.dataTransfer.setData('text/plain', idx); };
    const handleDrop = (e, toIdx) => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      if (fromIdx === toIdx) return;
      const newOrder = [...tc.columnOrder];
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, moved);
      dispatch(msSetColumnOrder(newOrder));
    };

    return (
      <div className="max-w-2xl mx-auto space-y-2 max-h-[450px] overflow-y-auto">
        <p className="text-[10px] text-slate-400 mb-2">Drag to reorder columns in the output.</p>
        {tc.columnOrder.map((key, idx) => (
          <div key={key} draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, idx)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-slate-50"
          >
            <GripVertical size={12} className="text-slate-300" />
            <span className="text-[10px] text-slate-400 w-5 font-mono">{idx + 1}</span>
            <span className="text-[11px] text-slate-700 font-medium">
              {tc.columnDisplayNames[key] || key.split('.').pop()}
            </span>
            <span className="text-[9px] text-slate-400 ml-auto font-mono">{key}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStepJoins = () => (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">{tc.joins.length} join(s) configured</p>
        <button onClick={() => dispatch(msAddJoin({ leftTable: tc.mainTable, leftColumn: '', rightTable: '', rightColumn: '', joinType: 'INNER' }))}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100">
          <Plus size={10} /> Add Join
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {tc.joins.map((join, idx) => (
          <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">Join #{idx + 1}</span>
              <button onClick={() => dispatch(msRemoveJoin(idx))}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <Trash2 size={11} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <select value={join.joinType}
                onChange={(e) => dispatch(msUpdateJoin({ index: idx, join: { ...join, joinType: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]">
                {JOIN_TYPES.map(jt => <option key={jt} value={jt}>{jt}</option>)}
              </select>
              <input value={join.leftTable} placeholder="Left Table"
                onChange={(e) => dispatch(msUpdateJoin({ index: idx, join: { ...join, leftTable: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={join.leftColumn} placeholder="Left Column"
                onChange={(e) => dispatch(msUpdateJoin({ index: idx, join: { ...join, leftColumn: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={join.rightTable} placeholder="Right Table"
                onChange={(e) => dispatch(msUpdateJoin({ index: idx, join: { ...join, rightTable: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={join.rightColumn} placeholder="Right Column"
                onChange={(e) => dispatch(msUpdateJoin({ index: idx, join: { ...join, rightColumn: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepExpressions = () => (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">{tc.expressions.length} expression(s)</p>
        <button onClick={() => dispatch(msAddExpression({ name: '', displayName: '', expression: '', alias: '' }))}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100">
          <Plus size={10} /> Add Expression
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {tc.expressions.map((expr, idx) => (
          <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">Expression #{idx + 1}</span>
              <button onClick={() => dispatch(msRemoveExpression(idx))}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <Trash2 size={11} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={expr.name} placeholder="Name"
                onChange={(e) => dispatch(msUpdateExpression({ index: idx, expression: { ...expr, name: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={expr.alias} placeholder="Alias (SQL)"
                onChange={(e) => dispatch(msUpdateExpression({ index: idx, expression: { ...expr, alias: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={expr.displayName} placeholder="Display Name"
                onChange={(e) => dispatch(msUpdateExpression({ index: idx, expression: { ...expr, displayName: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
              <input value={expr.expression} placeholder="SQL Expression"
                onChange={(e) => dispatch(msUpdateExpression({ index: idx, expression: { ...expr, expression: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px] font-mono" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepFilters = () => (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">{tc.filters.length} filter(s)</p>
        <button onClick={() => dispatch(msAddFilter({ column: '', filterType: 'text', label: '', required: false, defaultValue: '', visible: true }))}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100">
          <Plus size={10} /> Add Filter
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {tc.filters.map((filter, idx) => (
          <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">Filter #{idx + 1}</span>
              <button onClick={() => dispatch(msRemoveFilter(idx))}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                <Trash2 size={11} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={filter.column}
                onChange={(e) => dispatch(msUpdateFilter({ index: idx, filter: { ...filter, column: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]">
                <option value="">Select Column</option>
                {tc.columnOrder.map(key => (
                  <option key={key} value={key}>{tc.columnDisplayNames[key] || key.split('.').pop()}</option>
                ))}
              </select>
              <select value={filter.filterType}
                onChange={(e) => dispatch(msUpdateFilter({ index: idx, filter: { ...filter, filterType: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]">
                {FILTER_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
              <input value={filter.label} placeholder="Label"
                onChange={(e) => dispatch(msUpdateFilter({ index: idx, filter: { ...filter, label: e.target.value } }))}
                className="px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepSortGroup = () => (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Sorting */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-700">Sorting</h4>
          <button onClick={() => dispatch(msAddSort({ column: '', direction: 'ASC' }))}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100">
            <Plus size={10} /> Add Sort
          </button>
        </div>
        {tc.sorting.map((sort, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select value={sort.column}
              onChange={(e) => dispatch(msUpdateSort({ index: idx, sort: { ...sort, column: e.target.value } }))}
              className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-[10px]">
              <option value="">Select Column</option>
              {tc.columnOrder.map(key => (
                <option key={key} value={key}>{tc.columnDisplayNames[key] || key.split('.').pop()}</option>
              ))}
            </select>
            <select value={sort.direction}
              onChange={(e) => dispatch(msUpdateSort({ index: idx, sort: { ...sort, direction: e.target.value } }))}
              className="px-2 py-1.5 rounded border border-slate-200 text-[10px]">
              <option value="ASC">ASC</option>
              <option value="DESC">DESC</option>
            </select>
            <button onClick={() => dispatch(msRemoveSort(idx))}
              className="p-1 rounded text-slate-400 hover:text-rose-500">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Group By */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-slate-700">Group By</h4>
        <div className="flex flex-wrap gap-1.5">
          {tc.columnOrder.map(key => {
            const isGrouped = tc.groupBy.includes(key);
            return (
              <button key={key}
                onClick={() => dispatch(msToggleGroupByColumn(key))}
                className={`px-2 py-1 rounded text-[10px] border transition-all
                  ${isGrouped ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Layers size={9} className={`inline mr-1 ${isGrouped ? 'text-purple-500' : 'text-slate-400'}`} />
                {tc.columnDisplayNames[key] || key.split('.').pop()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aggregates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-700">Aggregates</h4>
          <button onClick={() => dispatch(msAddAggregate({ column: '', function: 'COUNT', alias: '' }))}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100">
            <Plus size={10} /> Add Aggregate
          </button>
        </div>
        {tc.aggregates.map((agg, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select value={agg.function}
              onChange={(e) => dispatch(msUpdateAggregate({ index: idx, aggregate: { ...agg, function: e.target.value } }))}
              className="px-2 py-1.5 rounded border border-slate-200 text-[10px]">
              {AGGREGATE_OPTIONS.filter(a => a.value).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <input value={agg.column} placeholder="Column (or *)"
              onChange={(e) => dispatch(msUpdateAggregate({ index: idx, aggregate: { ...agg, column: e.target.value } }))}
              className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
            <input value={agg.alias} placeholder="Alias"
              onChange={(e) => dispatch(msUpdateAggregate({ index: idx, aggregate: { ...agg, alias: e.target.value } }))}
              className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-[10px]" />
            <button onClick={() => dispatch(msRemoveAggregate(idx))}
              className="p-1 rounded text-slate-400 hover:text-rose-500">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepPreview = () => (
    <div className="max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">Preview first 100 rows of this table's query.</p>
        <button onClick={handlePreview} disabled={loading.preview || !tc.mainTable}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          <Eye size={11} /> {loading.preview ? 'Loading...' : 'Run Preview'}
        </button>
      </div>
      {previewSQL && (
        <div className="bg-slate-800 rounded-lg p-3 overflow-x-auto">
          <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{previewSQL}</pre>
        </div>
      )}
      {previewData && previewData.length > 0 ? (
        <div className="border border-slate-200 rounded-lg overflow-auto max-h-[350px]">
          <table className="w-full text-[10px] border-collapse">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                {Object.keys(previewData[0]).map(key => (
                  <th key={key} className="px-2 py-1.5 text-left text-[9px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 50).map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="px-2 py-1 text-slate-600 border-b border-slate-100 whitespace-nowrap">
                      {val === null ? <span className="text-slate-300 italic">null</span> : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : previewData && previewData.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No data returned.</p>
      ) : null}
    </div>
  );

  // ─── Step Router ────────────────────────────────────────────────────────

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderStepInfo();
      case 1: return renderStepSource();
      case 2: return renderStepColumns();
      case 3: return renderStepDisplayNames();
      case 4: return renderStepColumnOrder();
      case 5: return renderStepJoins();
      case 6: return renderStepExpressions();
      case 7: return renderStepFilters();
      case 8: return renderStepSortGroup();
      case 9: return renderStepPreview();
      default: return renderStepInfo();
    }
  };

  // ─── Main Render ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 via-white to-blue-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Database size={14} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800">
              Configure Table: {tc.tableName || 'Untitled'}
            </h2>
            <p className="text-[10px] text-slate-400">
              {tc.mainTable ? `Source: ${tc.mainTable}` : 'Select a source table'}
              {tc.selectedColumns.length > 0 && ` • ${tc.selectedColumns.length} columns`}
            </p>
          </div>
        </div>
        <button onClick={handleCancel}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-100 px-5 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === step;
            const isCompleted = idx < step;
            return (
              <button key={s.key}
                onClick={() => setStep(idx)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all
                  ${isActive ? 'bg-blue-600 text-white shadow-sm' : ''}
                  ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ''}
                  ${!isActive && !isCompleted ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : ''}
                `}
              >
                <Icon size={10} />
                <span className="hidden md:inline">{s.label}</span>
                <span className="md:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {renderCurrentStep()}
      </div>

      {/* Footer Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold
            text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-colors">
          <ChevronLeft size={12} /> Previous
        </button>

        <div className="flex items-center gap-2">
          <button onClick={handleCancel}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          {step === STEPS.length - 1 ? (
            <button onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 rounded-md text-xs font-semibold
                text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors">
              <Save size={12} /> Save Table
            </button>
          ) : (
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={!canGoNext()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold
                text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-30 shadow-sm transition-colors">
              Next <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableConfigModal;
