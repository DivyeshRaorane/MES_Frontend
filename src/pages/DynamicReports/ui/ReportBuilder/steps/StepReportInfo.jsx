/**
 * Step 1 - Report Information
 * Report name, description, module, status, display sections, report type, excel heading
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateWizardField, setMultiSheetMode, updateReportHeading } from '../../../controller/reportBuilder.slice';
import { FileText, Layers, Table2, LayoutGrid, Type, ChevronDown, ChevronRight } from 'lucide-react';

/* Static sections matching sidebar navigation - NOT dependent on database */
const SIDEBAR_SECTIONS = [
  { section_id: 'DRAW_MANAGEMENT', section_name: 'Draw Management' },
  { section_id: 'PROOF_TESTING', section_name: 'Proof Testing' },
  { section_id: 'QUALITY', section_name: 'Quality' },
  { section_id: 'QUALITY_ASSURANCE', section_name: 'Quality Assurance' },
  { section_id: 'FINISH_GOODS', section_name: 'Finish Goods' },
  { section_id: 'DISPATCH', section_name: 'Dispatch' },
  { section_id: 'DYNAMIC_REPORTS', section_name: 'Dynamic Reports' },
];

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
  const { reportName, description, module, status, isMultiSheet, selectedSections, heading } = useSelector(
    (state) => state.reportBuilder.wizard
  );
  const editingReportId = useSelector((state) => state.reportBuilder.editingReportId);
  const [showHeadingConfig, setShowHeadingConfig] = useState(false);

  const headingConfig = heading || { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 };

  // Use static sections from sidebar - no database dependency
  const sections = SIDEBAR_SECTIONS;

  const handleChange = (field, value) => {
    dispatch(updateWizardField({ field, value }));
  };

  const handleSectionToggle = (sectionId) => {
    const current = selectedSections || [];
    const exists = current.includes(sectionId);
    const updated = exists
      ? current.filter((id) => id !== sectionId)
      : [...current, sectionId];
    handleChange('selectedSections', updated);
  };

  const handleSelectAllSections = () => {
    const allIds = sections.map((s) => s.section_id);
    handleChange('selectedSections', allIds);
  };

  const handleClearSections = () => {
    handleChange('selectedSections', []);
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

      {/* Display In - Multi-Select Sections */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <LayoutGrid size={12} className="text-indigo-500" />
            Display In <span className="text-red-500">*</span>
          </span>
        </label>
        <p className="text-[10px] text-slate-500 font-medium">
          Select one or more sections where this report should appear in the sidebar
        </p>

        {/* Select All / Clear buttons */}
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={handleSelectAllSections}
            className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleClearSections}
            className="text-[9px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider"
          >
            Clear
          </button>
          {(selectedSections || []).length > 0 && (
            <span className="ml-auto text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {(selectedSections || []).length} selected
            </span>
          )}
        </div>

        {/* Section checkboxes */}
        <div className="grid grid-cols-2 gap-2">
          {sections.map((section) => {
            const isChecked = (selectedSections || []).some(s => 
              s === section.section_id || String(s) === String(section.section_id)
            );
            return (
              <label
                key={section.section_id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all
                  ${isChecked
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleSectionToggle(section.section_id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 
                    focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] font-bold">{section.section_name}</span>
              </label>
            );
          })}
        </div>

        {/* Validation: at least one section */}
        {(selectedSections || []).length === 0 && (
          <p className="text-[10px] text-amber-600 font-semibold mt-1">
            At least one section must be selected
          </p>
        )}
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

      {/* Excel Heading Configuration */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setShowHeadingConfig(!showHeadingConfig)}
          className="flex items-center gap-2 w-full text-left"
        >
          {showHeadingConfig ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          <Type size={14} className="text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Excel Heading (Optional)</span>
          {headingConfig.text && (
            <span className="text-[10px] text-slate-400 ml-2 truncate max-w-[200px]">— {headingConfig.text}</span>
          )}
        </button>
        <p className="text-[10px] text-slate-500 ml-7">
          Configure a styled heading that appears at the top of exported Excel file
        </p>

        {showHeadingConfig && (
          <div className="ml-2 mt-2 p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 space-y-4">
            {/* Heading Text */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Heading Text</label>
              <input
                type="text"
                value={headingConfig.text}
                onChange={(e) => dispatch(updateReportHeading({ text: e.target.value }))}
                placeholder="e.g. Draw Entry Report"
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                  placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Font Size */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Font Size</label>
                <input
                  type="number" min="8" max="36" value={headingConfig.fontSize}
                  onChange={(e) => dispatch(updateReportHeading({ fontSize: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Start Cell */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Start Cell</label>
                <input
                  type="text" value={headingConfig.startCell}
                  onChange={(e) => dispatch(updateReportHeading({ startCell: e.target.value.toUpperCase() }))}
                  placeholder="B2"
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                    placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">e.g. A1, B2, C3</p>
              </div>

              {/* Merge Rows */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Merge Rows</label>
                <input
                  type="number" min="1" max="10" value={headingConfig.mergeRows}
                  onChange={(e) => dispatch(updateReportHeading({ mergeRows: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Merge Cols */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Merge Columns</label>
                <input
                  type="number" min="1" max="20" value={headingConfig.mergeCols}
                  onChange={(e) => dispatch(updateReportHeading({ mergeCols: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Background Color */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={headingConfig.bgColor}
                    onChange={(e) => dispatch(updateReportHeading({ bgColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text" value={headingConfig.bgColor}
                    onChange={(e) => dispatch(updateReportHeading({ bgColor: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={headingConfig.textColor}
                    onChange={(e) => dispatch(updateReportHeading({ textColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text" value={headingConfig.textColor}
                    onChange={(e) => dispatch(updateReportHeading({ textColor: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-300 text-sm text-slate-900
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {headingConfig.text && (
              <div className="p-3 rounded-lg border-2 border-slate-200 bg-white">
                <p className="text-[9px] text-slate-400 mb-1.5 uppercase font-bold">Preview</p>
                <div
                  className="inline-block px-4 py-2 rounded-md"
                  style={{ backgroundColor: headingConfig.bgColor, color: headingConfig.textColor, fontSize: `${Math.min(headingConfig.fontSize, 22)}px`, fontWeight: 'bold' }}
                >
                  {headingConfig.text}
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5">
                  Cell {headingConfig.startCell} • Spanning {headingConfig.mergeRows} row(s) x {headingConfig.mergeCols} column(s)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepReportInfo;
