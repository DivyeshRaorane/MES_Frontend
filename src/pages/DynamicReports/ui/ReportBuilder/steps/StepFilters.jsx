/**
 * Step 8 - Filter Builder
 * Configure which filters users will see when running the report
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, Plus, Trash2, Edit3, Check, X, GripVertical } from 'lucide-react';
import { addFilter, updateFilter, removeFilter } from '../../../controller/reportBuilder.slice';

const FILTER_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'date', label: 'Date' },
  { value: 'daterange', label: 'Date Range' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'autocomplete', label: 'Autocomplete' },
];

const StepFilters = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    column: '',
    filterType: 'text',
    label: '',
    required: false,
    defaultValue: '',
    visible: true,
    options: '', // comma-separated for dropdown/multiselect
  });

  // All available columns
  const allColumns = wizard.selectedColumns.map((c) => ({
    key: `${c.table}.${c.column}`,
    label: wizard.columnDisplayNames[`${c.table}.${c.column}`] || c.column,
    dataType: c.dataType,
  }));

  const handleSave = () => {
    if (!form.column || !form.label) return;
    const data = {
      column: form.column,
      filterType: form.filterType,
      label: form.label,
      required: form.required,
      defaultValue: form.defaultValue,
      visible: form.visible,
      options: form.options ? form.options.split(',').map((o) => o.trim()) : [],
    };
    if (editIndex !== null) {
      dispatch(updateFilter({ index: editIndex, filter: data }));
    } else {
      dispatch(addFilter(data));
    }
    resetForm();
  };

  const handleEdit = (idx) => {
    const f = wizard.filters[idx];
    setForm({
      column: f.column,
      filterType: f.filterType,
      label: f.label,
      required: f.required,
      defaultValue: f.defaultValue || '',
      visible: f.visible !== false,
      options: Array.isArray(f.options) ? f.options.join(', ') : '',
    });
    setEditIndex(idx);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ column: '', filterType: 'text', label: '', required: false, defaultValue: '', visible: true, options: '' });
    setEditIndex(null);
    setShowForm(false);
  };

  // Auto-suggest filter type based on column data type
  const suggestFilterType = (columnKey) => {
    const col = wizard.selectedColumns.find((c) => `${c.table}.${c.column}` === columnKey);
    if (!col) return 'text';
    const dt = col.dataType?.toLowerCase() || '';
    if (dt.includes('date') || dt.includes('timestamp')) return 'daterange';
    if (dt.includes('int') || dt.includes('numeric') || dt.includes('double') || dt.includes('real')) return 'number';
    if (dt.includes('bool')) return 'checkbox';
    return 'text';
  };

  const handleColumnChange = (columnKey) => {
    const colInfo = allColumns.find((c) => c.key === columnKey);
    setForm({
      ...form,
      column: columnKey,
      filterType: suggestFilterType(columnKey),
      label: colInfo?.label || '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 flex items-center justify-center">
            <Filter size={20} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Filter Configuration</h2>
            <p className="text-[11px] text-slate-400">
              Define which filters users will see when viewing this report.
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              text-white bg-rose-600 hover:bg-rose-500 transition-colors"
          >
            <Plus size={12} />
            Add Filter
          </button>
        )}
      </div>

      {/* Existing filters */}
      {wizard.filters.length > 0 && (
        <div className="space-y-2">
          {wizard.filters.map((filter, idx) => (
            <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3 flex items-center gap-3">
              <GripVertical size={12} className="text-slate-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white">{filter.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                    {filter.filterType}
                  </span>
                  {filter.required && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-300 font-medium">
                      Required
                    </span>
                  )}
                  {!filter.visible && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-500 font-medium">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate">{filter.column}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(idx)}
                  className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => dispatch(removeFilter(idx))}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-lg border border-rose-700/50 bg-rose-900/5 p-4 space-y-4">
          <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
            {editIndex !== null ? 'Edit Filter' : 'New Filter'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Column */}
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Column *</label>
              <select
                value={form.column}
                onChange={(e) => handleColumnChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="">Select column...</option>
                {allColumns.map((col) => (
                  <option key={col.key} value={col.key}>{col.label} ({col.key})</option>
                ))}
              </select>
            </div>

            {/* Filter Type */}
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Filter Type</label>
              <select
                value={form.filterType}
                onChange={(e) => setForm({ ...form, filterType: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  focus:outline-none focus:border-rose-500 transition-colors"
              >
                {FILTER_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            {/* Label */}
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Label *</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., Machine No"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Default Value */}
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">Default Value</label>
              <input
                type="text"
                value={form.defaultValue}
                onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
                placeholder="Optional default"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Options for dropdown/multiselect */}
          {(form.filterType === 'dropdown' || form.filterType === 'multiselect') && (
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-semibold uppercase">
                Options (comma-separated, or leave blank for dynamic from DB)
              </label>
              <input
                type="text"
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                placeholder="Option1, Option2, Option3 (leave blank for auto-populated)"
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-white
                  placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm({ ...form, required: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-[11px] text-slate-300 font-medium">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-[11px] text-slate-300 font-medium">Visible</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={handleSave}
              disabled={!form.column || !form.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
      {wizard.filters.length === 0 && !showForm && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Filter size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No filters configured</p>
          <p className="text-[10px] text-slate-600">
            Filters allow users to narrow down report results. Add filters for commonly used criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepFilters;
