/**
 * Report Builder Wizard - Main Container
 * Multi-step wizard for creating/editing dynamic reports
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Save, Eye, X,
  FileText, Database, Columns3, Type, GripVertical,
  Link2, Calculator, Filter, ArrowUpDown, Shield,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  setCurrentStep, nextStep, prevStep, resetWizard,
  saveReport, getReportById, loadReportIntoWizard, getTableColumns,
} from '../../controller/reportBuilder.slice';

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

const STEPS = [
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
    if (navReport && navReport.main_table) {
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

  const handleSave = async () => {
    // Use editId from URL as fallback if editingReportId is not set
    const reportIdToSave = editingReportId || editId || null;

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
  };

  const renderStep = () => {
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
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return wizard.reportName && wizard.module;
      case 1: return wizard.mainTable;
      case 2: return wizard.selectedColumns.length > 0;
      default: return true;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-blue-400" />
          <h1 className="text-sm font-bold text-white">
            {editingReportId ? 'Edit Report' : 'Create New Report'}
          </h1>
          {wizard.reportName && (
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {wizard.reportName}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex-shrink-0 bg-slate-900/50 border-b border-slate-800 px-6 py-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={step.key}
                onClick={() => dispatch(setCurrentStep(idx))}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all
                  ${isActive ? 'bg-blue-600 text-white' : ''}
                  ${isCompleted ? 'bg-slate-700 text-emerald-400' : ''}
                  ${!isActive && !isCompleted ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : ''}
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
      <div className="flex-shrink-0 bg-slate-900 border-t border-slate-700 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSave}
              disabled={loading.save}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold
                text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {loading.save ? 'Saving...' : 'Save Report'}
            </button>
          ) : (
            <button
              onClick={() => dispatch(nextStep())}
              disabled={!canGoNext()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
