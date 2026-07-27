/**
 * Step 10 - Preview & Save
 * Preview report results before saving
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Play, Code2, Clock, Rows3, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { previewReportData, clearPreview } from '../../../controller/reportBuilder.slice';

const StepPreviewSave = () => {
  const dispatch = useDispatch();
  const { wizard, previewData, previewSQL, previewExecutionTime, loading, editingReportId } = useSelector(
    (state) => state.reportBuilder
  );
  const [showSQL, setShowSQL] = useState(false);

  const handlePreview = () => {
    const config = {
      main_table: wizard.mainTable,
      columns: wizard.selectedColumns,
      column_display_names: wizard.columnDisplayNames,
      column_order: wizard.columnOrder,
      joins: wizard.joins,
      expressions: wizard.expressions,
      filters: wizard.filters,
      sorting: wizard.sorting,
      group_by: wizard.groupBy,
      aggregates: wizard.aggregates,
      having: wizard.having,
    };
    dispatch(previewReportData(config));
  };

  const handleClearPreview = () => {
    dispatch(clearPreview());
  };

  // Summary card
  const summaryItems = [
    { label: 'Report Name', value: wizard.reportName },
    { label: 'Module', value: wizard.module },
    { label: 'Main Table', value: wizard.mainTable },
    { label: 'Columns', value: `${wizard.selectedColumns.length} selected` },
    { label: 'Joins', value: `${wizard.joins.length} configured` },
    { label: 'Expressions', value: `${wizard.expressions.length} defined` },
    { label: 'Filters', value: `${wizard.filters.length} configured` },
    { label: 'Sort Rules', value: `${wizard.sorting.length} defined` },
    { label: 'Group By', value: `${wizard.groupBy.length} columns` },
    { label: 'Status', value: wizard.status },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
            <Eye size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Preview & Save</h2>
            <p className="text-[11px] text-slate-400">
              Review your report configuration and preview the results.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSQL(!showSQL)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors
              ${showSQL
                ? 'bg-cyan-900/20 border-cyan-700/50 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
          >
            <Code2 size={12} />
            SQL
          </button>
          <button
            onClick={handlePreview}
            disabled={loading.preview || !wizard.mainTable}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {loading.preview ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            Preview
          </button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3">Report Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-[9px] text-slate-500 font-semibold uppercase">{item.label}</p>
              <p className="text-[11px] text-white font-medium">{item.value || '-'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Column order preview */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Column Order</h3>
        <div className="flex flex-wrap gap-1.5">
          {wizard.columnOrder.map((key, idx) => (
            <span key={key} className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
              {idx + 1}. {wizard.columnDisplayNames[key] || key}
            </span>
          ))}
          {wizard.expressions.map((expr) => (
            <span key={expr.alias} className="text-[10px] px-2 py-0.5 rounded bg-orange-900/30 text-orange-300 font-medium">
              {expr.displayName} (calc)
            </span>
          ))}
        </div>
      </div>

      {/* SQL Preview */}
      {showSQL && previewSQL && (
        <div className="rounded-lg border border-cyan-700/50 bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Generated SQL</h3>
            <button
              onClick={() => navigator.clipboard.writeText(previewSQL)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Copy
            </button>
          </div>
          <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-48">
            {previewSQL}
          </pre>
        </div>
      )}

      {/* Execution stats */}
      {previewData && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Rows3 size={12} className="text-emerald-400" />
            <span><strong className="text-white">{previewData.length}</strong> rows (preview limited to 100)</span>
          </div>
          {previewExecutionTime > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock size={12} className="text-blue-400" />
              <span><strong className="text-white">{previewExecutionTime}ms</strong> execution time</span>
            </div>
          )}
        </div>
      )}

      {/* Data preview table */}
      {previewData && previewData.length > 0 && (
        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead className="bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 text-left text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                    #
                  </th>
                  {Object.keys(previewData[0]).map((col) => (
                    <th key={col} className="px-2 py-2 text-left text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                      {wizard.columnDisplayNames[col] || col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-2 py-1.5 text-slate-500 font-mono">{idx + 1}</td>
                    {Object.values(row).map((val, cidx) => (
                      <td key={cidx} className="px-2 py-1.5 text-slate-300 whitespace-nowrap">
                        {val === null ? <span className="text-slate-600 italic">null</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No preview yet */}
      {!previewData && !loading.preview && (
        <div className="text-center py-8 rounded-lg border border-dashed border-slate-700">
          <Eye size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 mb-1">Click Preview to see report results</p>
          <p className="text-[10px] text-slate-600">
            Preview executes the query and shows the first 100 rows.
          </p>
        </div>
      )}

      {/* Loading preview */}
      {loading.preview && (
        <div className="text-center py-8">
          <RefreshCw size={24} className="mx-auto text-blue-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Executing query...</p>
        </div>
      )}

      {/* Save confirmation */}
      <div className="p-4 rounded-lg bg-emerald-900/10 border border-emerald-700/30">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">Ready to Save</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Click <strong className="text-white">Save Report</strong> in the bottom navigation bar to save this report.
          {editingReportId
            ? ' This will update the existing report.'
            : ' Once saved, the report will appear in Dynamic Reports for authorized users.'}
        </p>
      </div>
    </div>
  );
};

export default StepPreviewSave;
