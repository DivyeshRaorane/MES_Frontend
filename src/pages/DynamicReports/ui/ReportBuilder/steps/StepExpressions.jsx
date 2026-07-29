/**
 * Step 7 - Enhanced Expression Builder
 * Categorized functions, aggregate support, window functions
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calculator, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { addExpression, updateExpression, removeExpression } from '../../../controller/reportBuilder.slice';

const OPERATORS = ['+', '-', '*', '/', '%', '(', ')', ',', '||'];

const FUNCTION_CATEGORIES = {
  Aggregate: [
    { label: 'SUM()', value: 'SUM(', desc: 'Sum of values' },
    { label: 'COUNT()', value: 'COUNT(', desc: 'Count of rows' },
    { label: 'COUNT(DISTINCT)', value: 'COUNT(DISTINCT ', desc: 'Distinct count' },
    { label: 'AVG()', value: 'AVG(', desc: 'Average' },
    { label: 'MIN()', value: 'MIN(', desc: 'Minimum' },
    { label: 'MAX()', value: 'MAX(', desc: 'Maximum' },
    { label: 'STRING_AGG()', value: 'STRING_AGG(', desc: 'Concatenate strings' },
    { label: 'ARRAY_AGG()', value: 'ARRAY_AGG(', desc: 'Collect into array' },
  ],
  Math: [
    { label: 'ROUND()', value: 'ROUND(', desc: 'Round to N places' },
    { label: 'ABS()', value: 'ABS(', desc: 'Absolute value' },
    { label: 'CEIL()', value: 'CEIL(', desc: 'Round up' },
    { label: 'FLOOR()', value: 'FLOOR(', desc: 'Round down' },
    { label: 'CAST()', value: 'CAST(', desc: 'Type conversion' },
  ],
  Date: [
    { label: 'DATE()', value: 'DATE(', desc: 'Extract date' },
    { label: 'DATE_TRUNC()', value: "DATE_TRUNC('month', ", desc: 'Truncate date' },
    { label: 'CURRENT_DATE', value: 'CURRENT_DATE', desc: 'Today' },
    { label: 'CURRENT_TIMESTAMP', value: 'CURRENT_TIMESTAMP', desc: 'Now' },
    { label: 'EXTRACT()', value: "EXTRACT(MONTH FROM ", desc: 'Extract part' },
    { label: 'TO_CHAR()', value: "TO_CHAR(", desc: 'Format date' },
    { label: 'AGE()', value: 'AGE(', desc: 'Date difference' },
  ],
  Text: [
    { label: 'CONCAT()', value: 'CONCAT(', desc: 'Concatenate' },
    { label: 'LOWER()', value: 'LOWER(', desc: 'Lowercase' },
    { label: 'UPPER()', value: 'UPPER(', desc: 'Uppercase' },
    { label: 'TRIM()', value: 'TRIM(', desc: 'Remove spaces' },
    { label: 'REPLACE()', value: 'REPLACE(', desc: 'Replace text' },
    { label: 'SUBSTRING()', value: 'SUBSTRING(', desc: 'Extract part' },
    { label: 'LENGTH()', value: 'LENGTH(', desc: 'String length' },
    { label: 'LEFT()', value: 'LEFT(', desc: 'Left chars' },
    { label: 'RIGHT()', value: 'RIGHT(', desc: 'Right chars' },
  ],
  Conditional: [
    { label: 'CASE WHEN', value: 'CASE WHEN ', desc: 'Conditional' },
    { label: 'COALESCE()', value: 'COALESCE(', desc: 'First non-null' },
    { label: 'NULLIF()', value: 'NULLIF(', desc: 'NULL if equal' },
    { label: 'GREATEST()', value: 'GREATEST(', desc: 'Maximum of list' },
    { label: 'LEAST()', value: 'LEAST(', desc: 'Minimum of list' },
  ],
  Window: [
    { label: 'ROW_NUMBER()', value: 'ROW_NUMBER() OVER(', desc: 'Row number' },
    { label: 'RANK()', value: 'RANK() OVER(', desc: 'Rank with gaps' },
    { label: 'DENSE_RANK()', value: 'DENSE_RANK() OVER(', desc: 'Rank no gaps' },
    { label: 'LAG()', value: 'LAG(', desc: 'Previous row value' },
    { label: 'LEAD()', value: 'LEAD(', desc: 'Next row value' },
    { label: 'FIRST_VALUE()', value: 'FIRST_VALUE(', desc: 'First in partition' },
    { label: 'LAST_VALUE()', value: 'LAST_VALUE(', desc: 'Last in partition' },
    { label: 'SUM() OVER', value: 'SUM() OVER(', desc: 'Running sum' },
  ],
};

const CATEGORY_COLORS = {
  Aggregate: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/50',
  Math: 'text-blue-300 bg-blue-900/30 border-blue-700/50',
  Date: 'text-rose-300 bg-rose-900/30 border-rose-700/50',
  Text: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50',
  Conditional: 'text-amber-300 bg-amber-900/30 border-amber-700/50',
  Window: 'text-violet-300 bg-violet-900/30 border-violet-700/50',
};

const StepExpressions = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', displayName: '', expression: '', alias: '' });
  const [activeCategory, setActiveCategory] = useState('Aggregate');

  const allColumns = wizard.selectedColumns.map((c) => `${c.table}.${c.column}`);

  const handleInsertColumn = (col) => setForm((prev) => ({ ...prev, expression: prev.expression + col }));
  const handleInsertOperator = (op) => setForm((prev) => ({ ...prev, expression: prev.expression + ` ${op} ` }));
  const handleInsertFunction = (fn) => setForm((prev) => ({ ...prev, expression: prev.expression + fn }));

  const handleSave = () => {
    if (!form.name || !form.expression) return;
    const data = {
      name: form.name,
      displayName: form.displayName || form.name,
      expression: form.expression,
      alias: form.alias || form.name.toLowerCase().replace(/\s+/g, '_'),
    };
    if (editIndex !== null) dispatch(updateExpression({ index: editIndex, expression: data }));
    else dispatch(addExpression(data));
    resetForm();
  };

  const handleEdit = (idx) => {
    const expr = wizard.expressions[idx];
    setForm({ name: expr.name, displayName: expr.displayName, expression: expr.expression, alias: expr.alias });
    setEditIndex(idx); setShowForm(true);
  };

  const resetForm = () => { setForm({ name: '', displayName: '', expression: '', alias: '' }); setEditIndex(null); setShowForm(false); };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
            <Calculator size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Calculated Columns & Expressions</h2>
            <p className="text-[11px] text-slate-400">Build aggregate, calculated, and window function expressions.</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-500 transition-colors">
            <Plus size={12} /> Add Expression
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
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-300 font-mono">{expr.alias}</span>
                </div>
                <code className="text-[10px] text-slate-400 font-mono block truncate">{expr.expression}</code>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button onClick={() => handleEdit(idx)} className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"><Edit3 size={12} /></button>
                <button onClick={() => dispatch(removeExpression(idx))} className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-colors"><Trash2 size={12} /></button>
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

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Total Production"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Total Production (KM)"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Alias</label>
              <input type="text" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="total_production"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500" />
            </div>
          </div>

          {/* Expression textarea */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Expression *</label>
            <textarea value={form.expression} onChange={(e) => setForm({ ...form, expression: e.target.value })}
              placeholder="Build your expression using functions and columns below..." rows={3}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none" />
          </div>

          {/* Operators */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Operators</label>
            <div className="flex flex-wrap gap-1">
              {OPERATORS.map((op) => (
                <button key={op} onClick={() => handleInsertOperator(op)}
                  className="w-8 h-7 rounded bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors">{op}</button>
              ))}
            </div>
          </div>

          {/* Function Categories */}
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Functions</label>
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1">
              {Object.keys(FUNCTION_CATEGORIES).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded text-[9px] font-semibold border transition-colors
                    ${activeCategory === cat ? CATEGORY_COLORS[cat] : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                  {cat}
                </button>
              ))}
            </div>
            {/* Functions in selected category */}
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {FUNCTION_CATEGORIES[activeCategory]?.map((fn) => (
                <button key={fn.value} onClick={() => handleInsertFunction(fn.value)} title={fn.desc}
                  className="px-2 py-1 rounded bg-slate-700 text-[10px] text-cyan-300 font-mono font-medium hover:bg-slate-600 transition-colors">
                  {fn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Columns (click to insert)</label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {allColumns.map((col) => (
                <button key={col} onClick={() => handleInsertColumn(col)}
                  className="px-2 py-1 rounded bg-slate-700 text-[10px] text-blue-300 font-mono hover:bg-slate-600 transition-colors">{col}</button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
            <button onClick={handleSave} disabled={!form.name || !form.expression}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Check size={12} /> {editIndex !== null ? 'Update' : 'Add'}
            </button>
            <button onClick={resetForm} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 bg-slate-700 hover:bg-slate-600 transition-colors">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wizard.expressions.length === 0 && !showForm && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Calculator size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No calculated columns yet</p>
          <p className="text-[10px] text-slate-600">Use for aggregates, calculations, window functions, and derived values.</p>
        </div>
      )}

      {/* Examples */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-[10px] text-slate-500 font-semibold mb-2">Examples:</p>
        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
          <p>• Total Production: <span className="text-emerald-400">SUM(draw_entry.drawn_length)</span></p>
          <p>• Avg Weight: <span className="text-emerald-400">ROUND(AVG(draw_entry.drawn_weight), 2)</span></p>
          <p>• Net Length: <span className="text-emerald-400">SUM(drawn_length) - SUM(scrap_length)</span></p>
          <p>• Efficiency: <span className="text-emerald-400">ROUND((COUNT(DISTINCT spool_id)::numeric / COUNT(*)) * 100, 1)</span></p>
          <p>• Running Total: <span className="text-emerald-400">SUM(drawn_length) OVER(ORDER BY created_at)</span></p>
        </div>
      </div>
    </div>
  );
};

export default StepExpressions;
