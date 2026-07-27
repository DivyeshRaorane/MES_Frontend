/**
 * Step 1 - Report Information
 * Report name, description, module, status
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateWizardField } from '../../../controller/reportBuilder.slice';
import { FileText } from 'lucide-react';

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
  const { reportName, description, module, status } = useSelector(
    (state) => state.reportBuilder.wizard
  );

  const handleChange = (field, value) => {
    dispatch(updateWizardField({ field, value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
          <FileText size={20} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Report Information</h2>
          <p className="text-[11px] text-slate-400">Define basic details about this report</p>
        </div>
      </div>

      {/* Report Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Report Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => handleChange('reportName', e.target.value)}
          placeholder="e.g., Daily Draw Report"
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white
            placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description of what this report shows..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white
            placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Module */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Module / Section <span className="text-red-400">*</span>
        </label>
        <select
          value={module}
          onChange={(e) => handleChange('module', e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          <option value="">Select Module</option>
          {MODULES.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Status
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => handleChange('status', 'active')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all
              ${status === 'active'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
          >
            Active
          </button>
          <button
            onClick={() => handleChange('status', 'inactive')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all
              ${status === 'inactive'
                ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Validation hint */}
      {(!reportName || !module) && (
        <div className="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-700/50">
          <p className="text-[11px] text-amber-400">
            Please fill in the Report Name and select a Module to proceed.
          </p>
        </div>
      )}
    </div>
  );
};

export default StepReportInfo;
