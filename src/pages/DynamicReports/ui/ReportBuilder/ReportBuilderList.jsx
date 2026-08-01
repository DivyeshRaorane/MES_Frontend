/**
 * Report Builder List - Admin view (light theme)
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart2, Plus, Search, RefreshCw, Edit3, Trash2,
  Copy, Clock, Tag, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllReports, removeReport, resetWizard, loadReportIntoWizard } from '../../controller/reportBuilder.slice';
import { duplicateReport, fetchUserReports } from '../../services/reportBuilder.api';

const ReportBuilderList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reports: rawReports, loading } = useSelector((state) => state.reportBuilder);
  const reports = Array.isArray(rawReports) ? rawReports : [];
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [localReports, setLocalReports] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const loadReports = async () => {
    setLocalLoading(true);
    try {
      const result = await dispatch(getAllReports());
      if (result.meta.requestStatus === 'fulfilled') {
        const payload = result.payload;
        const data = Array.isArray(payload) ? payload : (payload?.data || payload?.rows || payload?.reports || []);
        if (data.length > 0) { setLocalReports(data); setLocalLoading(false); return; }
      }
    } catch (e) {}
    try {
      const res = await fetchUserReports();
      const data = Array.isArray(res) ? res : (res?.data || res?.rows || res?.reports || []);
      setLocalReports(data);
    } catch (e) { setLocalReports([]); }
    setLocalLoading(false);
  };

  useEffect(() => { loadReports(); }, [dispatch]);

  const displayReports = reports.length > 0 ? reports : localReports;
  const isLoading = loading.reports || localLoading;

  const filtered = displayReports.filter((r) =>
    !search || r.report_name?.toLowerCase().includes(search.toLowerCase()) || r.module?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => { dispatch(resetWizard()); navigate('/admin/reportbuilder/wizard'); };

  const handleEdit = (report) => {
    // Pass full report object via navigation state as backup
    dispatch(loadReportIntoWizard(report));
    navigate(`/admin/reportbuilder/wizard?edit=${report.id}`, { state: { report } });
  };

  const handleDuplicate = async (report) => {
    try { await duplicateReport(report.id); toast.success('Report duplicated!'); loadReports(); }
    catch (err) { toast.error('Failed to duplicate report'); }
  };

  const handleDelete = async (reportId) => {
    const result = await dispatch(removeReport(reportId));
    if (result.meta.requestStatus === 'fulfilled') { toast.success('Report deleted'); setDeleteConfirm(null); loadReports(); }
    else { toast.error('Failed to delete report'); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <FileBarChart2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900">Report Builder</h1>
              <p className="text-[10px] text-slate-600 font-medium">{displayReports.length} report(s) configured</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold
              text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={14} /> New Report
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-700
                placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            />
          </div>
          <button onClick={() => loadReports()} disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[11px] font-semibold
              text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin text-blue-500" />
            <span className="ml-3 text-sm text-slate-500">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileBarChart2 size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 mb-1">{search ? 'No reports match your search' : 'No reports created yet'}</p>
            {!search && (
              <button onClick={handleCreate} className="mt-3 px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700">
                <Plus size={14} className="inline mr-1" /> Create Report
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((report) => (
              <div key={report.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-slate-300
                  hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 flex items-center justify-center flex-shrink-0">
                  <FileBarChart2 size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">{report.report_name}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold
                      ${report.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300' : 'bg-slate-100 text-slate-600 border-2 border-slate-300'}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                    {report.module && <span className="flex items-center gap-1"><Tag size={10} className="text-indigo-400" />{report.module}</span>}
                    {report.main_table && <span className="flex items-center gap-1"><Eye size={10} className="text-blue-400" />{report.main_table}</span>}
                    {report.created_at && <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400" />{new Date(report.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(report)} title="Edit"
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => handleDuplicate(report)} title="Duplicate"
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Copy size={14} /></button>
                  <button onClick={() => setDeleteConfirm(report.id)} title="Delete"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Delete Report</h3>
            <p className="text-xs text-slate-500 mb-4">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilderList;
