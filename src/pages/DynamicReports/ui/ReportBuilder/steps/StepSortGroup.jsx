/**
 * Step 9 - Sorting, Grouping, Aggregates & Having
 * Configure default sorting, group by, aggregate functions, and having conditions
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUpDown, Plus, Trash2, Layers, BarChart3, Filter,
  ArrowUp, ArrowDown, CheckSquare, Square,
} from 'lucide-react';
import {
  addSort, updateSort, removeSort,
  toggleGroupByColumn,
  addAggregate, updateAggregate, removeAggregate,
  addHaving, updateHaving, removeHaving,
} from '../../../controller/reportBuilder.slice';

const AGGREGATE_FUNCTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'COUNT DISTINCT'];
const HAVING_OPERATORS = ['=', '!=', '>', '<', '>=', '<='];

const StepSortGroup = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [activeTab, setActiveTab] = useState('sort');

  // All columns available
  const allColumns = wizard.selectedColumns.map((c) => ({
    key: `${c.table}.${c.column}`,
    label: wizard.columnDisplayNames[`${c.table}.${c.column}`] || c.column,
  }));

  const tabs = [
    { key: 'sort', label: 'Sorting', icon: ArrowUpDown, count: wizard.sorting.length },
    { key: 'group', label: 'Group By', icon: Layers, count: wizard.groupBy.length },
    { key: 'aggregate', label: 'Aggregates', icon: BarChart3, count: wizard.aggregates.length },
    { key: 'having', label: 'Having', icon: Filter, count: wizard.having.length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
          <ArrowUpDown size={20} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Sorting, Grouping & Aggregates</h2>
          <p className="text-[11px] text-slate-400">
            Configure how data is sorted, grouped, and aggregated.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-semibold transition-all
                ${activeTab === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <Icon size={12} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-[9px] px-1 py-0.5 rounded-full
                  ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'sort' && <SortingPanel allColumns={allColumns} />}
        {activeTab === 'group' && <GroupByPanel allColumns={allColumns} />}
        {activeTab === 'aggregate' && <AggregatePanel allColumns={allColumns} />}
        {activeTab === 'having' && <HavingPanel />}
      </div>
    </div>
  );
};

// ─── Sorting Panel ──────────────────────────────────────────────────────────

const SortingPanel = ({ allColumns }) => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [newSort, setNewSort] = useState({ column: '', direction: 'ASC' });

  const handleAdd = () => {
    if (!newSort.column) return;
    dispatch(addSort({ ...newSort }));
    setNewSort({ column: '', direction: 'ASC' });
  };

  return (
    <div className="space-y-3">
      {/* Existing sorts */}
      {wizard.sorting.map((sort, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <span className="text-[10px] text-slate-500 font-bold w-4">{idx + 1}.</span>
          <select
            value={sort.column}
            onChange={(e) => dispatch(updateSort({ index: idx, sort: { ...sort, column: e.target.value } }))}
            className="flex-1 px-2 py-1 rounded bg-slate-700 border border-slate-600 text-[11px] text-white focus:outline-none focus:border-violet-500"
          >
            {allColumns.map((col) => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
          <button
            onClick={() => dispatch(updateSort({ index: idx, sort: { ...sort, direction: sort.direction === 'ASC' ? 'DESC' : 'ASC' } }))}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border transition-colors
              ${sort.direction === 'ASC'
                ? 'bg-emerald-900/20 border-emerald-700/50 text-emerald-400'
                : 'bg-orange-900/20 border-orange-700/50 text-orange-400'
              }`}
          >
            {sort.direction === 'ASC' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {sort.direction}
          </button>
          <button
            onClick={() => dispatch(removeSort(idx))}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {/* Add new sort */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-700">
        <select
          value={newSort.column}
          onChange={(e) => setNewSort({ ...newSort, column: e.target.value })}
          className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">Select column...</option>
          {allColumns.map((col) => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>
        <select
          value={newSort.direction}
          onChange={(e) => setNewSort({ ...newSort, direction: e.target.value })}
          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-violet-500"
        >
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>
        <button
          onClick={handleAdd}
          disabled={!newSort.column}
          className="p-1.5 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Group By Panel ─────────────────────────────────────────────────────────

const GroupByPanel = ({ allColumns }) => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500">Select columns to group by:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto">
        {allColumns.map((col) => {
          const isGrouped = wizard.groupBy.includes(col.key);
          return (
            <button
              key={col.key}
              onClick={() => dispatch(toggleGroupByColumn(col.key))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border
                ${isGrouped
                  ? 'bg-violet-600/15 border-violet-600/40 text-white'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                }`}
            >
              {isGrouped ? <CheckSquare size={13} className="text-violet-400" /> : <Square size={13} className="text-slate-600" />}
              <span className="text-[11px] font-medium truncate">{col.label}</span>
            </button>
          );
        })}
      </div>
      {wizard.groupBy.length > 0 && (
        <div className="p-2 rounded bg-slate-800 border border-slate-700">
          <code className="text-[10px] text-slate-400 font-mono">
            GROUP BY {wizard.groupBy.join(', ')}
          </code>
        </div>
      )}
    </div>
  );
};

// ─── Aggregate Panel ────────────────────────────────────────────────────────

const AggregatePanel = ({ allColumns }) => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [newAgg, setNewAgg] = useState({ column: '', function: 'SUM', alias: '' });

  const handleAdd = () => {
    if (!newAgg.column || !newAgg.function) return;
    const alias = newAgg.alias || `${newAgg.function.toLowerCase()}_${newAgg.column.split('.').pop()}`;
    dispatch(addAggregate({ ...newAgg, alias }));
    setNewAgg({ column: '', function: 'SUM', alias: '' });
  };

  return (
    <div className="space-y-3">
      {/* Existing aggregates */}
      {wizard.aggregates.map((agg, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <span className="text-[11px] text-cyan-400 font-bold font-mono">{agg.function}</span>
          <span className="text-[11px] text-slate-300">({agg.column})</span>
          <span className="text-[10px] text-slate-500">AS</span>
          <span className="text-[11px] text-emerald-400 font-mono">{agg.alias}</span>
          <div className="flex-1" />
          <button
            onClick={() => dispatch(removeAggregate(idx))}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {/* Add form */}
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-dashed border-slate-700">
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Function</label>
          <select
            value={newAgg.function}
            onChange={(e) => setNewAgg({ ...newAgg, function: e.target.value })}
            className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-violet-500"
          >
            {AGGREGATE_FUNCTIONS.map((fn) => (
              <option key={fn} value={fn}>{fn}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[120px]">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Column</label>
          <select
            value={newAgg.column}
            onChange={(e) => setNewAgg({ ...newAgg, column: e.target.value })}
            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-violet-500"
          >
            <option value="">Select...</option>
            <option value="*">* (all rows)</option>
            {allColumns.map((col) => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Alias</label>
          <input
            type="text"
            value={newAgg.alias}
            onChange={(e) => setNewAgg({ ...newAgg, alias: e.target.value })}
            placeholder="Auto-generated"
            className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white font-mono
              placeholder-slate-600 focus:outline-none focus:border-violet-500 w-32"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newAgg.column}
          className="p-1.5 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Having Panel ───────────────────────────────────────────────────────────

const HavingPanel = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [newHaving, setNewHaving] = useState({ expression: '', operator: '>', value: '' });

  const handleAdd = () => {
    if (!newHaving.expression || !newHaving.value) return;
    dispatch(addHaving({ ...newHaving }));
    setNewHaving({ expression: '', operator: '>', value: '' });
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-slate-500">
        HAVING conditions filter aggregated results. Only applies when using GROUP BY.
      </p>

      {/* Existing */}
      {wizard.having.map((h, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <code className="text-[11px] text-slate-300 font-mono flex-1">
            {h.expression} {h.operator} {h.value}
          </code>
          <button
            onClick={() => dispatch(removeHaving(idx))}
            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {/* Add form */}
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-dashed border-slate-700">
        <div className="space-y-1 flex-1 min-w-[150px]">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Expression</label>
          <input
            type="text"
            value={newHaving.expression}
            onChange={(e) => setNewHaving({ ...newHaving, expression: e.target.value })}
            placeholder="e.g., SUM(length)"
            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white font-mono
              placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Operator</label>
          <select
            value={newHaving.operator}
            onChange={(e) => setNewHaving({ ...newHaving, operator: e.target.value })}
            className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-violet-500"
          >
            {HAVING_OPERATORS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-slate-500 font-semibold uppercase">Value</label>
          <input
            type="text"
            value={newHaving.value}
            onChange={(e) => setNewHaving({ ...newHaving, value: e.target.value })}
            placeholder="100"
            className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-white
              placeholder-slate-600 focus:outline-none focus:border-violet-500 w-24"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newHaving.expression || !newHaving.value}
          className="p-1.5 rounded bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>

      {wizard.having.length > 0 && (
        <div className="p-2 rounded bg-slate-800 border border-slate-700">
          <code className="text-[10px] text-slate-400 font-mono">
            HAVING {wizard.having.map((h) => `${h.expression} ${h.operator} ${h.value}`).join(' AND ')}
          </code>
        </div>
      )}
    </div>
  );
};

export default StepSortGroup;
