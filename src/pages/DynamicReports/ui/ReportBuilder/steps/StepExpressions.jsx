/**
 * Step 7 - Expression Builder (Calculated Columns)
 * Create calculated columns using visual expression builder
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calculator, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { addExpression, updateExpression, removeExpression } from '../../../controller/reportBuilder.slice';

const OPERATORS = ['+', '-', '*', '/', '%', '(', ')'];

const FUNCTIONS = [
  { label: 'ROUND()', value: 'ROUND(', desc: 'Round to decimal places' },
  { label: 'ABS()', value: 'ABS(', desc: 'Absolute value' },
  { label: 'SUM()', value: 'SUM(', desc: 'Sum of values' },
  { label: 'AVG()', value: 'AVG(', desc: 'Average of values' },
  { label: 'COUNT()', value: 'COUNT(', desc: 'Count of rows' },
  { label: 'MIN()', value: 'MIN(', desc: 'Minimum value' },
  { label: 'MAX()', value: 'MAX(', desc: 'Maximum value' },
  { label: 'COALESCE()', value: 'COALESCE(', desc: 'First non-null value' },
  { label: 'CONCAT()', value: 'CONCAT(', desc: 'Concatenate strings' },
  { label: 'UPPER()', value: 'UPPER(', desc: 'Uppercase text' },
  { label: 'LOWER()', value: 'LOWER(', desc: 'Lowercase text' },
  { label: 'TRIM()', value: 'TRIM(', desc: 'Remove whitespace' },
  { label: 'CAST()', value: 'CAST(', desc: 'Type conversion' },
  { label: 'NULLIF()', value: 'NULLIF(', desc: 'Return NULL if equal' },
  { label: 'DATE()', value: 'DATE(', desc: 'Extract date' },
  { label: 'CASE WHEN', value: 'CASE WHEN ', desc: 'Conditional logic' },
];

const StepExpressions = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', displayName: '', expression: '', alias: '' });

  // All available columns from selected tables
  const allColumns = wizard.selectedColumns.map((c) => `${c.table}.${c.column}`);

  const handleInsertColumn = (col) => {
    setForm((prev) => ({ ...prev, expression: prev.expression + col }));
  };

  const handleInsertOperator = (op) => {
    setForm((prev) => ({ ...prev, expression: prev.expression + ` ${op} ` }));
  };

  const handleInsertFunction = (fn) => {
    setForm((prev) => ({ ...prev, expression: prev.expression + fn }));
  };

  const handleSave = () => {
    if (!form.name || !form.expression) return;
    const data = {
      name: form.name,
      displayName: form.displayName || form.name,
      expression: form.expression,
      alias: form.alias || form.name.toLowerCase().replace(/\s+/g, '_'),
    };
    if (editIndex !== null) {
      dispatch(updateExpression({ index: editIndex, expression: data }));
    } else {
      dispatch(addExpression(data));
    }
    resetForm();
  };

  const handleEdit = (idx) => {
    const expr = wizard.expressions[idx];
    setForm({ name: expr.name, displayName: expr.displayName, expression: expr.expression, alias: expr.alias });
    setEditIndex(idx);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', displayName: '', expression: '', alias: '' });
    setEditIndex(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
            <Calculator size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Calculated Columns</h2>
            <p className="text-[11px] text-slate-400">
              Build expressions for computed values without writing SQL directly.
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              text-white bg-orange-600 hover:bg-orange-500 transition-colors"
          >
            <Plus size={12} />
            Add Expression
          </button>
        )}
      </div>

      {/* Existing expressions */}
      {wizard.expressions.length > 0 && (
        <div className="space-y-2">
          {wizard.expressions.map((expr, idx) => (
            <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{expr.displayName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-300 font-mono">
                    {expr.alias}
                  </span>
                </div>
                <code className="text-[10px] text-slate-400 font-mono block truncate">
                  {expr.expression}
                </code>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => handleEdit(idx)}
                  className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => dispatch(removeExpression(idx))}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expression Builder Form */}
      {showForm && (
        <div className="rounded-lg border border-orange-700/50 bg-orange-900/5 p-4 space-y-4">
          <p className="text-[11px] font-bold text-orange-300 uppercase tracking-wider">
            {editIndex !== null ? 'Edit Expression' : 'New Expression'}
          </p>

          {/* Name & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Production Loss"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Production Loss (KM)"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Alias</label>
              <input
                type="text"
                value={form.alias}
                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                placeholder="production_loss"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white font-mono
                  placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Expression textarea */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Expression *</label>
            <textarea
              value={form.expression}
              onChange={(e) => setForm({ ...form, expression: e.target.value })}
              placeholder="Click columns, operators, and functions below to build the expression..."
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono
                placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Operators */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Operators</label>
            <div className="flex flex-wrap gap-1">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  onClick={() => handleInsertOperator(op)}
                  className="w-8 h-7 rounded bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors"
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Functions */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Functions</label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {FUNCTIONS.map((fn) => (
                <button
                  key={fn.value}
                  onClick={() => handleInsertFunction(fn.value)}
                  title={fn.desc}
                  className="px-2 py-1 rounded bg-slate-700 text-[10px] text-cyan-300 font-mono font-medium
                    hover:bg-slate-600 transition-colors"
                >
                  {fn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Available Columns */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Columns (click to insert)</label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {allColumns.map((col) => (
                <button
                  key={col}
                  onClick={() => handleInsertColumn(col)}
                  className="px-2 py-1 rounded bg-slate-700 text-[10px] text-blue-300 font-mono
                    hover:bg-slate-600 transition-colors"
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={handleSave}
              disabled={!form.name || !form.expression}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Check size={12} />
              {editIndex !== null ? 'Update' : 'Add'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                text-slate-400 bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wizard.expressions.length === 0 && !showForm && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Calculator size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No calculated columns yet</p>
          <p className="text-[10px] text-slate-600">
            Calculated columns are optional. Use them for derived values like totals, differences, or ratios.
          </p>
        </div>
      )}

      {/* Examples */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 font-semibold mb-2">Examples:</p>
        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
          <p>• Production Loss: <span className="text-emerald-400">drawn_length - fiber_length</span></p>
          <p>• Efficiency: <span className="text-emerald-400">(ok_count / total_count) * 100</span></p>
          <p>• Net Weight: <span className="text-emerald-400">gross_weight - tray_weight</span></p>
          <p>• Average: <span className="text-emerald-400">ROUND(AVG(length), 2)</span></p>
        </div>
      </div>
    </div>
  );
};

export default StepExpressions;
