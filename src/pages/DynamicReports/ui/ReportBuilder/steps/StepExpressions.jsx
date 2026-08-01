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
  Aggregate: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  Math: 'text-blue-700 bg-blue-50 border-blue-200',
  Date: 'text-rose-700 bg-rose-50 border-rose-200',
  Text: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Conditional: 'text-amber-700 bg-amber-50 border-amber-200',
  Window: 'text-violet-700 bg-violet-50 border-violet-200',
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-200 border-2 border-orange-300 flex items-center justify-center shadow-sm">
            <Calculator size={20} className="text-orange-700" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Calculated Columns & Expressions</h2>
            <p className="text-[11px] text-slate-600 font-medium">Build aggregate, calculated, and window function expressions.</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-200">
            <Plus size={12} /> Add Expression
          </button>
        )}
      </div>

      {/* Existing expressions */}
      {wizard.expressions.length > 0 && (
        <div className="space-y-2">
          {wizard.expressions.map((expr, idx) => (
            <div key={idx} className="rounded-xl border-2 border-slate-300 bg-white p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-slate-900">{expr.displayName}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 font-mono font-bold border-2 border-orange-300">{expr.alias}</span>
                </div>
                <code className="text-[10px] text-slate-500 font-mono block truncate">{expr.expression}</code>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button onClick={() => handleEdit(idx)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit3 size={12} /></button>
                <button onClick={() => dispatch(removeExpression(idx))} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expression Builder Form */}
      {showForm && (
        <div className="rounded-xl border-2 border-orange-300 bg-orange-50/30 p-4 space-y-4 shadow-sm">
          <p className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider">
            {editIndex !== null ? 'Edit Expression' : 'New Expression'}
          </p>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Total Production"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Total Production (KM)"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Alias</label>
              <input type="text" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="total_production"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          {/* Expression textarea */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Expression *</label>
            <textarea value={form.expression} onChange={(e) => setForm({ ...form, expression: e.target.value })}
              placeholder="Build your expression using functions and columns below..." rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-emerald-700 font-mono placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none" />
          </div>

          {/* Operators */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-semibold uppercase">Operators</label>
            <div className="flex flex-wrap gap-1">
              {OPERATORS.map((op) => (
                <button key={op} onClick={() => handleInsertOperator(op)}
                  className="w-8 h-7 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-sm">{op}</button>
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
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold border transition-colors
                    ${activeCategory === cat ? CATEGORY_COLORS[cat] : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                  {cat}
                </button>
              ))}
            </div>
            {/* Functions in selected category */}
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {FUNCTION_CATEGORIES[activeCategory]?.map((fn) => (
                <button key={fn.value} onClick={() => handleInsertFunction(fn.value)} title={fn.desc}
                  className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-indigo-700 font-mono font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm">
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
                  className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] text-blue-700 font-mono hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm">{col}</button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <button onClick={handleSave} disabled={!form.name || !form.expression}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
              <Check size={12} /> {editIndex !== null ? 'Update' : 'Add'}
            </button>
            <button onClick={resetForm} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wizard.expressions.length === 0 && !showForm && (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
          <Calculator size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No calculated columns yet</p>
          <p className="text-[10px] text-slate-400">Use for aggregates, calculations, window functions, and derived values.</p>
        </div>
      )}

      {/* Examples */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-orange-50/30 border border-slate-200">
        <p className="text-[10px] text-slate-600 font-semibold mb-2">Examples:</p>
        <div className="space-y-1 text-[10px] text-slate-500 font-mono">
          <p>• Total Production: <span className="text-emerald-600">SUM(draw_entry.drawn_length)</span></p>
          <p>• Avg Weight: <span className="text-emerald-600">ROUND(AVG(draw_entry.drawn_weight), 2)</span></p>
          <p>• Net Length: <span className="text-emerald-600">SUM(drawn_length) - SUM(scrap_length)</span></p>
          <p>• Efficiency: <span className="text-emerald-600">ROUND((COUNT(DISTINCT spool_id)::numeric / COUNT(*)) * 100, 1)</span></p>
          <p>• Running Total: <span className="text-emerald-600">SUM(drawn_length) OVER(ORDER BY created_at)</span></p>
        </div>
      </div>
    </div>
  );
};

export default StepExpressions;
