/**
 * Step 6 - Join Builder
 * Visual join builder for connecting multiple tables
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link2, Plus, Trash2, ArrowRight } from 'lucide-react';
import {
  addJoin, updateJoin, removeJoin,
  getTables, getTableColumns,
} from '../../../controller/reportBuilder.slice';

const JOIN_TYPES = [
  { value: 'INNER', label: 'INNER JOIN', desc: 'Only matching rows' },
  { value: 'LEFT', label: 'LEFT JOIN', desc: 'All from left + matching right' },
  { value: 'RIGHT', label: 'RIGHT JOIN', desc: 'All from right + matching left' },
  { value: 'FULL', label: 'FULL JOIN', desc: 'All rows from both' },
];

const StepJoinBuilder = () => {
  const dispatch = useDispatch();
  const { wizard, tables: rawTables, tableColumns } = useSelector((state) => state.reportBuilder);
  const tables = Array.isArray(rawTables) ? rawTables : [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJoin, setNewJoin] = useState({
    leftTable: '',
    leftColumn: '',
    joinType: 'INNER',
    rightTable: '',
    rightColumn: '',
  });
  const [fetchedTables, setFetchedTables] = useState(new Set());

  // Load all tables list
  useEffect(() => {
    if (tables.length === 0) dispatch(getTables());
  }, [dispatch, tables.length]);

  // Fetch columns for all tables referenced in joins (debounced via fetchedTables set)
  useEffect(() => {
    const needed = new Set();
    if (wizard.mainTable) needed.add(wizard.mainTable);
    wizard.joins.forEach((j) => {
      if (j.leftTable) needed.add(j.leftTable);
      if (j.rightTable) needed.add(j.rightTable);
    });
    if (newJoin.leftTable) needed.add(newJoin.leftTable);
    if (newJoin.rightTable) needed.add(newJoin.rightTable);

    needed.forEach((table) => {
      if (table && !tableColumns[table] && !fetchedTables.has(table)) {
        setFetchedTables((prev) => new Set([...prev, table]));
        dispatch(getTableColumns(table));
      }
    });
  }, [wizard.mainTable, wizard.joins, newJoin.leftTable, newJoin.rightTable, tableColumns, dispatch, fetchedTables]);

  const availableTables = tables.map((t) => t.table_name || t);

  const getColumnsForTable = useCallback((table) => {
    if (!table) return [];
    const cols = tableColumns[table];
    return Array.isArray(cols) ? cols : [];
  }, [tableColumns]);

  // Tables currently in the report
  const reportTables = [
    wizard.mainTable,
    ...wizard.joins.map((j) => j.rightTable),
  ].filter((t, i, arr) => t && arr.indexOf(t) === i);

  const handleAddJoin = () => {
    if (!newJoin.leftTable || !newJoin.leftColumn || !newJoin.rightTable || !newJoin.rightColumn) return;
    dispatch(addJoin({ ...newJoin }));
    setNewJoin({ leftTable: '', leftColumn: '', joinType: 'INNER', rightTable: '', rightColumn: '' });
    setShowAddForm(false);
  };

  const handleUpdateJoinField = (index, field, value) => {
    const updated = { ...wizard.joins[index], [field]: value };
    if (field === 'leftTable') updated.leftColumn = '';
    if (field === 'rightTable') updated.rightColumn = '';
    dispatch(updateJoin({ index, join: updated }));
  };

  const handleRemoveJoin = (index) => {
    dispatch(removeJoin(index));
  };

  // Render a column select that shows the saved value even if columns haven't loaded
  const ColumnSelect = ({ table, value, onChange }) => {
    const columns = getColumnsForTable(table);
    const hasValue = value && !columns.find((c) => c.column_name === value);
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 rounded-md bg-slate-700 border border-slate-600 text-[11px] text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">Select column...</option>
        {hasValue && <option value={value}>{value} (saved)</option>}
        {columns.map((col) => (
          <option key={col.column_name} value={col.column_name}>{col.column_name}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Link2 size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Join Builder</h2>
            <p className="text-[11px] text-slate-400">
              Connect tables together. Add unlimited joins to build complex reports.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setNewJoin({ leftTable: wizard.mainTable || '', leftColumn: '', joinType: 'INNER', rightTable: '', rightColumn: '' });
            setShowAddForm(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus size={12} />
          Add Join
        </button>
      </div>

      {/* Tables in report */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">Tables in this report:</p>
        <div className="flex flex-wrap gap-1.5">
          {reportTables.map((table, idx) => (
            <span key={table} className="flex items-center gap-1">
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium
                ${idx === 0 ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30' : 'bg-slate-700 text-slate-300 border border-slate-600'}`}>
                {table}
                {idx === 0 && <span className="ml-1 text-[9px] opacity-60">(primary)</span>}
              </span>
              {idx < reportTables.length - 1 && <ArrowRight size={10} className="text-slate-600" />}
            </span>
          ))}
        </div>
      </div>

      {/* Existing joins */}
      {wizard.joins.length > 0 && (
        <div className="space-y-2">
          {wizard.joins.map((join, idx) => (
            <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join #{idx + 1}</span>
                <button onClick={() => handleRemoveJoin(idx)} className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {/* Left table */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold uppercase">Left Table</label>
                  <select
                    value={join.leftTable || ''}
                    onChange={(e) => handleUpdateJoinField(idx, 'leftTable', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-700 border border-slate-600 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    {reportTables.map((t) => (<option key={t} value={t}>{t}</option>))}
                    {join.leftTable && !reportTables.includes(join.leftTable) && (
                      <option value={join.leftTable}>{join.leftTable}</option>
                    )}
                  </select>
                </div>

                {/* Left column */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold uppercase">Left Column</label>
                  <ColumnSelect table={join.leftTable} value={join.leftColumn} onChange={(v) => handleUpdateJoinField(idx, 'leftColumn', v)} />
                </div>

                {/* Join type */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold uppercase">Join Type</label>
                  <select
                    value={join.joinType || 'INNER'}
                    onChange={(e) => handleUpdateJoinField(idx, 'joinType', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-700 border border-slate-600 text-[11px] font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    {JOIN_TYPES.map((jt) => (<option key={jt.value} value={jt.value}>{jt.label}</option>))}
                  </select>
                </div>

                {/* Right table */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold uppercase">Right Table</label>
                  <select
                    value={join.rightTable || ''}
                    onChange={(e) => handleUpdateJoinField(idx, 'rightTable', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-700 border border-slate-600 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select...</option>
                    {availableTables.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {/* Right column */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold uppercase">Right Column</label>
                  <ColumnSelect table={join.rightTable} value={join.rightColumn} onChange={(v) => handleUpdateJoinField(idx, 'rightColumn', v)} />
                </div>
              </div>

              {/* SQL Preview */}
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <code className="text-[10px] text-slate-400 font-mono">
                  <span className="text-indigo-400">{join.joinType || 'INNER'} JOIN</span>{' '}
                  <span className="text-emerald-400">{join.rightTable || '?'}</span>{' '}
                  <span className="text-slate-500">ON</span>{' '}
                  <span className="text-blue-300">{join.leftTable || '?'}.{join.leftColumn || '?'}</span>{' '}
                  <span className="text-slate-500">=</span>{' '}
                  <span className="text-emerald-300">{join.rightTable || '?'}.{join.rightColumn || '?'}</span>
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add join form */}
      {showAddForm && (
        <div className="rounded-lg border border-indigo-700/50 bg-indigo-900/10 p-4 space-y-3">
          <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">New Join</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Left Table</label>
              <select
                value={newJoin.leftTable}
                onChange={(e) => setNewJoin({ ...newJoin, leftTable: e.target.value, leftColumn: '' })}
                className="w-full px-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                {reportTables.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Left Column</label>
              <ColumnSelect table={newJoin.leftTable} value={newJoin.leftColumn} onChange={(v) => setNewJoin({ ...newJoin, leftColumn: v })} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Join Type</label>
              <select
                value={newJoin.joinType}
                onChange={(e) => setNewJoin({ ...newJoin, joinType: e.target.value })}
                className="w-full px-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-blue-500"
              >
                {JOIN_TYPES.map((jt) => (<option key={jt.value} value={jt.value}>{jt.label}</option>))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Right Table</label>
              <select
                value={newJoin.rightTable}
                onChange={(e) => setNewJoin({ ...newJoin, rightTable: e.target.value, rightColumn: '' })}
                className="w-full px-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                {availableTables.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Right Column</label>
              <ColumnSelect table={newJoin.rightTable} value={newJoin.rightColumn} onChange={(v) => setNewJoin({ ...newJoin, rightColumn: v })} />
            </div>
          </div>

          {/* SQL Preview */}
          {newJoin.leftTable && newJoin.rightTable && (
            <div className="p-2 rounded bg-slate-900 border border-slate-700">
              <code className="text-[10px] text-slate-400 font-mono">
                <span className="text-indigo-400">{newJoin.joinType} JOIN</span>{' '}
                <span className="text-emerald-400">{newJoin.rightTable}</span>{' '}
                <span className="text-slate-500">ON</span>{' '}
                <span className="text-blue-300">{newJoin.leftTable}.{newJoin.leftColumn || '?'}</span>{' '}
                <span className="text-slate-500">=</span>{' '}
                <span className="text-emerald-300">{newJoin.rightTable}.{newJoin.rightColumn || '?'}</span>
              </code>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAddJoin}
              disabled={!newJoin.leftTable || !newJoin.leftColumn || !newJoin.rightTable || !newJoin.rightColumn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} /> Add Join
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wizard.joins.length === 0 && !showAddForm && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Link2 size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No joins configured yet</p>
          <p className="text-[10px] text-slate-600">
            Joins are optional. Add them if your report needs data from multiple tables.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          After adding a join, go back to Step 3 (Columns) to select columns from the joined table.
          You can chain unlimited joins: main → table2 → table3 → etc.
        </p>
      </div>
    </div>
  );
};

export default StepJoinBuilder;
