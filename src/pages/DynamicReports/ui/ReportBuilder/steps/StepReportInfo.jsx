/**
 * Step 1 - Report Information
 * Report name, description, module, status
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateWizardField, setMultiSheetMode } from '../../../controller/reportBuilder.slice';
import { FileText, Layers, Table2 } from 'lucide-react';

const MODULES = [
  'Draw Management',
  'Proof Testing',
  'QC',
  'QA',
  'FG',
  'Dispatch',
  'Stores',
  'Common',
];

const StepReportInfo = () => {
  const dispatch = useDispatch();
  const { reportName, description, module, status, isMultiSheet } = useSelector(
    (state) => state.reportBuilder.wizard
  );

  const handleChange = (field, value) => {
    dispatch(updateWizardField({ field, value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-blue-300 flex items-center justify-center">
          <FileText size={20} className="text-blue-700" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Report Information</h2>
          <p className="text-[11px] text-slate-600 font-medium">Define basic details about this report</p>
        </div>
      </div>

      {/* Report Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Report Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => handleChange('reportName', e.target.value)}
          placeholder="e.g., Daily Draw Report"
          className="w-full px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-sm text-slate-900
            placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description of what this report shows..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-sm text-slate-900
            placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors resize-none"
        />
      </div>

      {/* Module */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Module / Section <span className="text-red-500">*</span>
        </label>
        <select
          value={module}
          onChange={(e) => handleChange('module', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-sm text-slate-900
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
        >
          <option value="">Select Module</option>
          {MODULES.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Status
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => handleChange('status', 'active')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold border-2 transition-all
              ${status === 'active'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
          >
            Active
          </button>
          <button
            onClick={() => handleChange('status', 'inactive')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold border-2 transition-all
              ${status === 'inactive'
                ? 'bg-orange-50 border-orange-400 text-orange-800'
                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Report Type */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Report Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => dispatch(setMultiSheetMode(false))}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
              ${!isMultiSheet
                ? 'bg-blue-50 border-blue-400 text-blue-800'
                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
          >
            <Table2 size={18} className={!isMultiSheet ? 'text-blue-600' : 'text-slate-400'} />
            <div>
              <p className="text-[11px] font-extrabold">Single Table</p>
              <p className="text-[9px] text-slate-500 mt-0.5">One query, one table, one sheet</p>
            </div>
          </button>
          <button
            onClick={() => dispatch(setMultiSheetMode(true))}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
              ${isMultiSheet
                ? 'bg-purple-50 border-purple-400 text-purple-800'
                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
          >
            <Layers size={18} className={isMultiSheet ? 'text-purple-600' : 'text-slate-400'} />
            <div>
              <p className="text-[11px] font-extrabold">Multi-Sheet / Multi-Table</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Multiple sheets, multiple tables per sheet</p>
            </div>
          </button>
        </div>
      </div>

      {/* Validation hint */}
      {(!reportName || !module) && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border-2 border-amber-300">
          <p className="text-[11px] text-amber-800 font-semibold">
            Please fill in the Report Name and select a Module to proceed.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepReportInfo;
