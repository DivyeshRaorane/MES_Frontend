/**
 * Report Builder Wizard - Main Container
 * Multi-step wizard for creating/editing dynamic reports
 * Supports both single-table and multi-sheet modes
 */
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Save, Eye, X,
  FileText, Database, Columns3, Type, GripVertical,
  Link2, Calculator, Filter, ArrowUpDown, Shield, Layers,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  setCurrentStep, nextStep, prevStep, resetWizard,
  saveReport, getReportById, loadReportIntoWizard, getTableColumns,
} from '../../controller/reportBuilder.slice';
import { createMultiSheetReport, updateMultiSheetReport } from '../../services/reportBuilder.api';

import StepReportInfo from './steps/StepReportInfo';
import StepSelectTable from './steps/StepSelectTable';
import StepSelectColumns from './steps/StepSelectColumns';
import StepDisplayNames from './steps/StepDisplayNames';
import StepColumnOrder from './steps/StepColumnOrder';
import StepJoinBuilder from './steps/StepJoinBuilder';
import StepExpressions from './steps/StepExpressions';
import StepFilters from './steps/StepFilters';
import StepSortGroup from './steps/StepSortGroup';
import StepPreviewSave from './steps/StepPreviewSave';
import StepMultiSheetConfig from './steps/StepMultiSheetConfig';

const STEPS_SINGLE = [
  { key: 'info', label: 'Report Info', icon: FileText },
  { key: 'table', label: 'Select Table', icon: Database },
  { key: 'columns', label: 'Columns', icon: Columns3 },
  { key: 'display', label: 'Display Names', icon: Type },
  { key: 'order', label: 'Column Order', icon: GripVertical },
  { key: 'joins', label: 'Joins', icon: Link2 },
  { key: 'expressions', label: 'Expressions', icon: Calculator },
  { key: 'filters', label: 'Filters', icon: Filter },
  { key: 'sortgroup', label: 'Sort & Group', icon: ArrowUpDown },
  { key: 'preview', label: 'Preview & Save', icon: Eye },
];

const STEPS_MULTI = [
  { key: 'info', label: 'Report Info', icon: FileText },
  { key: 'sheets', label: 'Sheets & Tables', icon: Layers },
  { key: 'preview', label: 'Preview & Save', icon: Eye },
];

const ReportBuilderWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { currentStep, wizard, editingReportId, loading } = useSelector(
    (state) => state.reportBuilder
  );

  // Load report for editing
  useEffect(() => {
    if (!editId) return;
    
    // Already loaded correctly - skip completely
    if (String(editingReportId) === String(editId)) return;
    
    // Priority 1: Use report from navigation state (passed directly from list)
    const navReport = location.state?.report;
    if (navReport && (navReport.main_table || navReport.is_multi_sheet)) {
      dispatch(loadReportIntoWizard(navReport));
      return;
    }
    
    // Priority 2: Fetch from API (only if navigation state didn't have report)
    dispatch(getReportById(editId)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        const payload = res.payload;
        const report = payload?.data || payload;
        if (report && (report.id || report.report_name)) {
          dispatch(loadReportIntoWizard(report));
        }
      }
    });
  }, [editId]);

  // Pre-fetch columns for all tables used in the report (for edit mode)
  useEffect(() => {
    if (wizard.mainTable) {
      const allTables = new Set([wizard.mainTable]);
      wizard.joins.forEach((j) => {
        if (j.leftTable) allTables.add(j.leftTable);
        if (j.rightTable) allTables.add(j.rightTable);
      });
      wizard.selectedColumns.forEach((c) => {
        if (c.table) allTables.add(c.table);
      });
      allTables.forEach((table) => {
        dispatch(getTableColumns(table));
      });
    }
  }, [wizard.mainTable, editingReportId]);

  const handleClose = () => {
    dispatch(resetWizard());
    navigate('/admin/reportbuilder');
  };

  // Determine steps based on mode
  const STEPS = wizard.isMultiSheet ? STEPS_MULTI : STEPS_SINGLE;

  const handleSave = async () => {
    const reportIdToSave = editingReportId || editId || null;

    if (wizard.isMultiSheet) {
      // ── Multi-Sheet Save ──────────────────────────────────────────────
      // Validate
      if (!wizard.reportName?.trim() || !wizard.module?.trim()) {
        toast.error('Report name and module are required');
        return;
      }
      if (wizard.sheets.length === 0) {
        toast.error('At least one sheet is required');
        return;
      }
      for (let i = 0; i < wizard.sheets.length; i++) {
        const s = wizard.sheets[i];
        if (!s.tables || s.tables.length === 0) {
          toast.error(`Sheet "${s.sheetName}" must have at least one table`);
          return;
        }
        for (let j = 0; j < s.tables.length; j++) {
          const t = s.tables[j];
          if (!t.mainTable) { toast.error(`Table "${t.tableName}" in "${s.sheetName}" needs a source table`); return; }
          if (!t.selectedColumns || t.selectedColumns.length === 0) { toast.error(`Table "${t.tableName}" in "${s.sheetName}" needs columns`); return; }
        }
      }

      const reportData = {
        report_name: wizard.reportName,
        description: wizard.description,
        module: wizard.module,
        status: wizard.status,
        is_multi_sheet: true,
        permissions: wizard.permissions,
        section_ids: wizard.selectedSections || [],
        sheets: wizard.sheets.map(sheet => ({
          id: sheet.id?.startsWith?.('temp_') ? null : sheet.id,
          sheet_name: sheet.sheetName,
          display_order: sheet.displayOrder,
          tables: sheet.tables.map(table => ({
            id: table.id?.startsWith?.('temp_') ? null : table.id,
            table_name: table.tableName,
            main_table: table.mainTable,
            columns: table.selectedColumns,
            column_display_names: table.columnDisplayNames,
            column_order: table.columnOrder,
            joins: table.joins,
            expressions: table.expressions,
            filters: table.filters,
            sorting: table.sorting,
            group_by: table.groupBy,
            aggregates: table.aggregates,
            having: table.having,
            display_order: table.displayOrder,
            spacing: table.spacing,
            formatting: table.formatting,
          })),
        })),
      };

      try {
        if (reportIdToSave) {
          await updateMultiSheetReport(reportIdToSave, reportData);
        } else {
          await createMultiSheetReport(reportData);
        }
        toast.success(reportIdToSave ? 'Report updated successfully!' : 'Report created successfully!');
        dispatch(resetWizard());
        navigate('/admin/reportbuilder');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to save report');
      }
    } else {
      // ── Single-Table Save (existing logic) ────────────────────────────
      const reportData = {
        report_name: wizard.reportName,
        description: wizard.description,
        module: wizard.module,
        status: wizard.status,
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
        permissions: wizard.permissions,
        section_ids: wizard.selectedSections || [],
      };

      const result = await dispatch(
        saveReport({ reportId: reportIdToSave, reportData })
      );

      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(reportIdToSave ? 'Report updated successfully!' : 'Report created successfully!');
        dispatch(resetWizard());
        navigate('/admin/reportbuilder');
      } else {
        toast.error(result.payload || 'Failed to save report');
      }
    }
  };

  const renderStep = () => {
    if (wizard.isMultiSheet) {
      // Multi-sheet mode: 3 steps
      switch (currentStep) {
        case 0: return <StepReportInfo />;
        case 1: return <StepMultiSheetConfig />;
        case 2: return <StepPreviewSave />;
        default: return <StepReportInfo />;
      }
    } else {
      // Single-table mode: 10 steps (existing)
      switch (currentStep) {
        case 0: return <StepReportInfo />;
        case 1: return <StepSelectTable />;
        case 2: return <StepSelectColumns />;
        case 3: return <StepDisplayNames />;
        case 4: return <StepColumnOrder />;
        case 5: return <StepJoinBuilder />;
        case 6: return <StepExpressions />;
        case 7: return <StepFilters />;
        case 8: return <StepSortGroup />;
        case 9: return <StepPreviewSave />;
        default: return <StepReportInfo />;
      }
    }
  };

  const canGoNext = () => {
    if (wizard.isMultiSheet) {
      switch (currentStep) {
        case 0: return wizard.reportName && wizard.module && (wizard.selectedSections || []).length > 0;
        case 1: return wizard.sheets.length > 0 && wizard.sheets.every(s => s.tables.length > 0);
        default: return true;
      }
    } else {
      switch (currentStep) {
        case 0: return wizard.reportName && wizard.module && (wizard.selectedSections || []).length > 0;
        case 1: return wizard.mainTable;
        case 2: return wizard.selectedColumns.length > 0;
        default: return true;
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3.5 flex items-center justify-between shadow-lg shadow-blue-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <h1 className="text-sm font-extrabold text-white">
            {editingReportId ? 'Edit Report' : 'Create New Report'}
          </h1>
          {wizard.reportName && (
            <span className="text-[11px] text-blue-100 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 rounded-full">
              {wizard.reportName}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={step.key}
                onClick={() => dispatch(setCurrentStep(idx))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all
                  ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200' : ''}
                  ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : ''}
                  ${!isActive && !isCompleted ? 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent' : ''}
                `}
              >
                <Icon size={12} />
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
            text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-blue-600 w-5' : idx < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-2">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSave}
              disabled={loading.save}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold
                text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-200"
            >
              <Save size={14} />
              {loading.save ? 'Saving...' : 'Save Report'}
            </button>
          ) : (
            <button
              onClick={() => dispatch(nextStep())}
              disabled={!canGoNext()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold
                text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
            >
              Next
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilderWizard;
