/**
 * Dynamic Reports List - User Facing
 * Shows all reports accessible by the current user (light theme)
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart2, Search, RefreshCw, Play, Clock, Tag,
  LayoutGrid, List, Filter,
} from 'lucide-react';
import { getUserReports, setActiveReport } from '../controller/dynamicReports.slice';

const DynamicReportsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reports: rawReports, loading } = useSelector((state) => state.dynamicReports);
  const reports = Array.isArray(rawReports) ? rawReports : [];
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    dispatch(getUserReports());
  }, [dispatch]);

  const modules = [...new Set(reports.map((r) => r.module).filter(Boolean))];

  const filtered = reports.filter((r) => {
    const matchSearch = !search ||
      r.report_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchModule = !moduleFilter || r.module === moduleFilter;
    return matchSearch && matchModule;
  });

  const handleOpenReport = (report) => {
    dispatch(setActiveReport(report));
    navigate(`/dynamicreports/view/${report.id}`);
  };

  const handleRefresh = () => {
    dispatch(getUserReports());
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <FileBarChart2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900">Dynamic Reports</h1>
              <p className="text-[10px] text-slate-600 font-medium">{filtered.length} report(s) available</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading.list}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold
              text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={12} className={loading.list ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-700
                placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-700
              focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Modules</option>
            {modules.map((mod) => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>

          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading.list ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            <span className="ml-3 text-sm text-slate-500">Loading reports...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileBarChart2 size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 mb-1">No reports found</p>
            <p className="text-xs text-slate-400">
              {search ? 'Try adjusting your search criteria' : 'Reports will appear here once created by an administrator'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((report) => (
              <ReportCard key={report.id} report={report} onOpen={handleOpenReport} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((report) => (
              <ReportListItem key={report.id} report={report} onOpen={handleOpenReport} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ report, onOpen }) => {
  return (
    <button
      onClick={() => onOpen(report)}
      className="text-left p-4 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-400
        hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border-2 border-indigo-300">
          {report.module || 'Common'}
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-500 transition-all">
          <Play size={10} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </div>
      <h3 className="text-[12px] font-extrabold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {report.report_name}
      </h3>
      {report.description && (
        <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5">{report.description}</p>
      )}
      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium pt-2.5 border-t-2 border-slate-200">
        {report.created_at && (
          <div className="flex items-center gap-1"><Clock size={10} className="text-slate-400" /><span>{new Date(report.created_at).toLocaleDateString()}</span></div>
        )}
        {report.main_table && (
          <div className="flex items-center gap-1"><Tag size={10} className="text-slate-400" /><span>{report.main_table}</span></div>
        )}
      </div>
    </button>
  );
};

const ReportListItem = ({ report, onOpen }) => {
  return (
    <button
      onClick={() => onOpen(report)}
      className="w-full text-left flex items-center gap-4 p-3.5 rounded-xl bg-white border-2 border-slate-300
        hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 flex items-center justify-center flex-shrink-0">
        <FileBarChart2 size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[12px] font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
          {report.report_name}
        </h3>
        <p className="text-[11px] text-slate-600 truncate">{report.description || report.main_table}</p>
      </div>
      <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border-2 border-indigo-300 flex-shrink-0">
        {report.module || 'Common'}
      </span>
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-all">
        <Play size={10} className="text-slate-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  );
};

export default DynamicReportsList;
