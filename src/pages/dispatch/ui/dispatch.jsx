import React, { useState } from 'react';
import {
  Truck, Search, Package, FileText, CheckCircle2,
  Hash, Calendar, User, ClipboardList, Loader2, AlertCircle
} from 'lucide-react';
import { getTCByNumber, markTCAsDispatched } from '../services/dispatch.api';
import { showSuccess, showError } from '../../../utils/toastService';

const Dispatch = () => {
  const [tcNumber, setTcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [tcHeader, setTcHeader] = useState(null);
  const [tcDetails, setTcDetails] = useState([]);
  const [searched, setSearched] = useState(false);

  /* ── Load TC data ── */
  const handleSearch = async () => {
    if (!tcNumber.trim()) {
      showError('Please enter a TC Number');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await getTCByNumber(tcNumber.trim());
      if (res.success) {
        setTcHeader(res.header);
        setTcDetails(res.details || []);
      } else {
        showError(res.message || 'TC not found');
        setTcHeader(null);
        setTcDetails([]);
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to fetch TC details');
      setTcHeader(null);
      setTcDetails([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Dispatch all bobbins ── */
  const handleDispatch = async () => {
    if (!tcHeader) return;
    const confirmed = window.confirm(
      `Are you sure you want to dispatch all ${tcDetails.length} bobbin(s) in TC ${tcHeader.tc_number}?`
    );
    if (!confirmed) return;

    setDispatching(true);
    try {
      const res = await markTCAsDispatched(tcHeader.tc_id);
      if (res.success) {
        showSuccess(res.message || 'All bobbins dispatched successfully!');
        setTcHeader(null);
        setTcDetails([]);
        setTcNumber('');
        setSearched(false);
      } else {
        showError(res.message || 'Dispatch failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  /* ── Key press handler ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ─── Header ─── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Dispatch</h1>
              <p className="text-[9px] text-slate-400 mt-0.5">TC Bobbin Dispatch Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tcNumber}
                onChange={(e) => setTcNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter TC Number..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500/20 w-52"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:bg-indigo-300"
            >
              {loading ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
              {loading ? 'Loading...' : 'Find TC'}
            </button>
          </div>
        </div>

        {/* ─── TC Header Info ─── */}
        {tcHeader && (
          <div className="px-4 py-2.5 border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={12} className="text-indigo-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">TC Information</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <InfoCard icon={Hash} label="TC Number" value={tcHeader.tc_number} highlight />
              <InfoCard icon={Calendar} label="TC Date" value={formatDate(tcHeader.tc_date)} />
              <InfoCard icon={User} label="Customer Ref" value={tcHeader.customer_ref || '—'} />
              <InfoCard icon={ClipboardList} label="Total KM" value={tcHeader.total_km || '—'} />
              <InfoCard icon={Package} label="Total Bobbins" value={tcHeader.total_bobbins || '—'} />
              <InfoCard icon={User} label="Inspected By" value={tcHeader.inspection_by || '—'} />
            </div>
            {tcHeader.remarks && (
              <div className="mt-2 bg-slate-100 border border-slate-200 rounded px-3 py-1.5 flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-500 uppercase">Remarks:</span>
                <span className="text-[10px] text-slate-700">{tcHeader.remarks}</span>
              </div>
            )}
          </div>
        )}

        {/* ─── Dispatch Action Bar ─── */}
        {tcDetails.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                {tcDetails.length} Bobbins
              </span>
              <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                {tcDetails.reduce((sum, r) => sum + (parseFloat(r.length_km) || 0), 0).toFixed(2)} KM Total
              </span>
            </div>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={dispatching}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm disabled:bg-emerald-300"
            >
              {dispatching ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              {dispatching ? 'Dispatching...' : 'Dispatch All'}
            </button>
          </div>
        )}

        {/* ─── Bobbin Details Table ─── */}
        {tcDetails.length > 0 && (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['#', 'Bobbin No', 'Bobbin FID', 'Length (KM)', 'Box No', 'Stack No'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tcDetails.map((row, idx) => (
                  <tr key={row.tc_detail_id || idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-3 py-2 text-[10px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs font-bold text-indigo-700 font-mono border-r border-slate-100">{row.bobbin_no}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono text-emerald-700 border-r border-slate-100">{row.length_km || '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 text-center border-r border-slate-100">{row.box_no || '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 text-center">{row.stack_no || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t border-slate-200">
                  <td colSpan={3} className="px-3 py-2 text-[9px] font-bold text-slate-600 uppercase">Total</td>
                  <td className="px-3 py-2 text-xs font-bold font-mono text-indigo-700">
                    {tcDetails.reduce((sum, r) => sum + (parseFloat(r.length_km) || 0), 0).toFixed(2)} KM
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ─── Empty State (TC not found) ─── */}
        {searched && !loading && !tcHeader && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">TC Not Found</h4>
              <p className="text-[10px] text-slate-400 mt-1">No records found for "{tcNumber}"</p>
            </div>
          </div>
        )}

        {/* ─── Initial State ─── */}
        {!searched && !tcHeader && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck size={20} className="text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-600">Ready for Dispatch</h4>
              <p className="text-[10px] text-slate-400 mt-1">Enter a TC Number above and click Find to load bobbin details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Helper: Info Card ─── */
const InfoCard = ({ icon: Icon, label, value, highlight }) => (
  <div className={`rounded-lg px-2.5 py-1.5 border ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
    <div className="flex items-center gap-1 mb-0.5">
      <Icon size={9} className={highlight ? 'text-indigo-500' : 'text-slate-400'} />
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-[11px] font-bold truncate ${highlight ? 'text-indigo-700' : 'text-slate-800'}`}>{value}</p>
  </div>
);

/* ─── Helper: Format date ─── */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export default Dispatch;
