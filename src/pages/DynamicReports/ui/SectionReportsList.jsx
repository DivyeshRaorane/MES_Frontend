/**
 * SectionReportsList - Reusable component for displaying dynamic reports by section
 * 
 * Usage:
 *   <SectionReportsList sectionKey="DRAW_MANAGEMENT" title="Draw Reports" />
 *   <SectionReportsList sectionKey="PROOF_TESTING" title="PT Reports" />
 * 
 * This component fetches reports mapped to the given section and displays them
 * as clickable cards. Clicking a report navigates to the ReportViewer.
 * 
 * Also fetches Function Reports registered to the matching section.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FileBarChart2, Database, Search, RefreshCw, Play, Clock, Tag } from 'lucide-react';
import { fetchUserReportsBySection } from '../services/reportBuilder.api';
import { fetchUserFunctionReports } from '../../FunctionReports/services/functionReports.api';
import { setActiveReport } from '../controller/dynamicReports.slice';
import { setActiveReport as setActiveFnReport } from '../../FunctionReports/controller/functionReports.slice';

const SectionReportsList = ({ sectionKey, title = 'Dynamic Reports', color = 'blue' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reports, setReports] = useState([]);
  const [functionReports, setFunctionReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Map section keys used in Dynamic Reports to Function Report section names
  const SECTION_KEY_MAP = {
    'DRAW_MANAGEMENT': 'Draw',
    'PROOF_TESTING': 'Proof Testing',
    'QUALITY': 'Quality',
    'QC': 'Quality',
    'QA': 'Quality Assurance',
    'QUALITY_ASSURANCE': 'Quality Assurance',
    'FG': 'Finish Goods',
    'FINISH_GOODS': 'Finish Goods',
    'DYNAMIC_REPORTS': 'General', // General function reports show in Dynamic Reports page
    'GENERAL': 'General',
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load Dynamic Reports
      const data = await fetchUserReportsBySection(sectionKey);
      const list = Array.isArray(data) ? data : (data?.data || data?.rows || data?.reports || []);
      setReports(list);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load reports');
      setReports([]);
    }

    // Load Function Reports for the matching section
    try {
      const fnSection = SECTION_KEY_MAP[sectionKey] || sectionKey;
      const fnData = await fetchUserFunctionReports(fnSection);
      const fnList = Array.isArray(fnData) ? fnData : (fnData?.data || []);
      setFunctionReports(fnList);
    } catch (e) {
      // Silently fail — function reports backend might not be ready yet
      setFunctionReports([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (sectionKey) loadReports();
  }, [sectionKey]);

  const filtered = reports.filter((r) => {
    if (!search) return true;
    return (
      r.report_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filteredFnReports = functionReports.filter((r) => {
    if (!search) return true;
    return (
      r.report_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalCount = filtered.length + filteredFnReports.length;

  const handleOpenReport = (report) => {
    dispatch(setActiveReport(report));
    navigate(`/dynamicreports/view/${report.id}`);
  };

  const handleOpenFunctionReport = (report) => {
    dispatch(setActiveFnReport(report));
    navigate(`/dynamicreports/function/${report.id}`);
  };

  const colorMap = {
    blue: { bg: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200', border: 'border-blue-400', hoverBorder: 'hover:border-blue-400', hoverShadow: 'hover:shadow-blue-100/60', badge: 'bg-blue-50 text-blue-700 border-blue-300', btnBg: 'bg-blue-500' },
    purple: { bg: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-200', border: 'border-purple-400', hoverBorder: 'hover:border-purple-400', hoverShadow: 'hover:shadow-purple-100/60', badge: 'bg-purple-50 text-purple-700 border-purple-300', btnBg: 'bg-purple-500' },
    emerald: { bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200', border: 'border-emerald-400', hoverBorder: 'hover:border-emerald-400', hoverShadow: 'hover:shadow-emerald-100/60', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300', btnBg: 'bg-emerald-500' },
    cyan: { bg: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-200', border: 'border-cyan-400', hoverBorder: 'hover:border-cyan-400', hoverShadow: 'hover:shadow-cyan-100/60', badge: 'bg-cyan-50 text-cyan-700 border-cyan-300', btnBg: 'bg-cyan-500' },
    orange: { bg: 'from-orange-500 to-red-600', shadow: 'shadow-orange-200', border: 'border-orange-400', hoverBorder: 'hover:border-orange-400', hoverShadow: 'hover:shadow-orange-100/60', badge: 'bg-orange-50 text-orange-700 border-orange-300', btnBg: 'bg-orange-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-md ${c.shadow}`}>
              <FileBarChart2 size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-900">{title}</h2>
              <p className="text-[9px] text-slate-500 font-medium">{totalCount} report(s) available</p>
            </div>
          </div>
          <button
            onClick={loadReports}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold
              text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-7 pr-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-700
              placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={16} className="animate-spin text-blue-500" />
            <span className="ml-2 text-[11px] text-slate-500">Loading reports...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-[11px] text-red-500 mb-2">{error}</p>
            <button onClick={loadReports} className="text-[10px] text-blue-600 hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 && filteredFnReports.length === 0 ? (
          <div className="text-center py-12">
            <FileBarChart2 size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[11px] text-slate-500 mb-1">No reports found</p>
            <p className="text-[9px] text-slate-400">
              {search ? 'Try adjusting your search' : 'Reports assigned to this section will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Function Reports */}
            {filteredFnReports.map((report) => (
              <button
                key={`fn-${report.id}`}
                onClick={() => handleOpenFunctionReport(report)}
                className={`text-left p-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-violet-400
                  hover:shadow-lg hover:shadow-violet-100/60 hover:-translate-y-0.5 transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-violet-50 text-violet-700 border border-violet-300">
                    Function Report
                  </span>
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-500 transition-all">
                    <Database size={8} className="text-violet-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <h3 className="text-[11px] font-extrabold text-slate-900 mb-0.5 line-clamp-2 group-hover:text-violet-600 transition-colors">
                  {report.report_name}
                </h3>
                {report.description && (
                  <p className="text-[9px] text-slate-500 line-clamp-2 mb-2">{report.description}</p>
                )}
                <div className="flex items-center gap-2 text-[8px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-0.5 font-mono">
                    <Database size={8} /> {report.schema_name}.{report.function_name}
                  </span>
                </div>
              </button>
            ))}

            {/* Dynamic Reports */}
            {filtered.map((report) => (
              <button
                key={report.id}
                onClick={() => handleOpenReport(report)}
                className={`text-left p-3.5 rounded-xl bg-white border-2 border-slate-200 ${c.hoverBorder}
                  hover:shadow-lg ${c.hoverShadow} hover:-translate-y-0.5 transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${c.badge} border`}>
                    {report.module || 'Common'}
                  </span>
                  <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:${c.btnBg} transition-all`}>
                    <Play size={8} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <h3 className="text-[11px] font-extrabold text-slate-900 mb-0.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {report.report_name}
                </h3>
                {report.description && (
                  <p className="text-[9px] text-slate-500 line-clamp-2 mb-2">{report.description}</p>
                )}
                <div className="flex items-center gap-2 text-[8px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  {report.created_at && (
                    <span className="flex items-center gap-0.5">
                      <Clock size={8} /> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  )}
                  {report.main_table && (
                    <span className="flex items-center gap-0.5">
                      <Tag size={8} /> {report.main_table}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionReportsList;
