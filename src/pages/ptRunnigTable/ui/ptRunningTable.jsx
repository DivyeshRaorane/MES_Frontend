import React, { useState, useEffect } from 'react';
import { Search, RotateCw, FileText, ClipboardCheck, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getPTAllocatedSpool, deallocatePT } from '../services/pt_running.api';
import { showSuccess, showError } from '../../../utils/toastService';
import { ptWip } from '../../ptAllocation/services/pt_allocation.api';

const PTRunningTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { ptAllocatedSpoolData, ptASLoading, ptASError } = useSelector((state) => state.ptAllocatedSpool)

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPTAllocatedSpool(false))
  }, [])

  const confirmDeallocate = async () => {
    if (!selectedRow) return;
    try {
      const res = await deallocatePT({
        spool_id: selectedRow.spool_id,
        pt_machine_no: selectedRow.pt_machine_no,
      });
      if (res?.success) {
        showSuccess("Spool deallocated successfully");
        dispatch(getPTAllocatedSpool(false));
      } else {
        showError(res?.message || "Deallocation failed");
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Deallocation failed");
    }
    setShowPopup(false);
    setSelectedRow(null);
  };

  

  const filteredData = Array.isArray(ptAllocatedSpoolData)
  ? ptAllocatedSpoolData.filter(r =>
      r.preform_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* ── Search bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
          <Search size={13} className="text-indigo-600" />
          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Search Preform Records</span>
        </div>
        <div className="p-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="e.g. PF-2026"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded px-8 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── PT Records Table — scrolls internally ── */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
          <ClipboardCheck size={13} className="text-indigo-600" />
          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">PT Records Overview</span>
        </div>
        {/* scrollable body */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200">
                {['Operator', 'Shift Incharge', 'PT No', 'Drawn Spool ID', 'Drawn Length', 'Total PT', 'Balance', 'Remark', 'Action'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ptASLoading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-400 text-xs">
                    Loading...
                  </td>
                </tr>
              ) : ptASError ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-rose-500 text-xs">
                    Error: {typeof ptASError === 'string' ? ptASError : 'Failed to load PT allocated spools (500)'}
                  </td>
                </tr>
              ) : filteredData.length > 0 ? filteredData.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[9px] text-indigo-600 font-bold flex-shrink-0">
                        {row.
                          allocated_by}
                      </div>
                      
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.shift_incharge
                  }</td>
                  <td className="px-3 py-2 text-xs font-mono text-indigo-600">{row.pt_machine_no}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.spool_id
                  }</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{Number(row.drawn_length).toFixed(3)}</td>
                  <td className="px-3 py-2 text-xs font-bold text-slate-700">{Number(row.qty - row.balance_qty).toFixed(3)}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`font-bold ${row.balance === '0m' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {row.balance_qty}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500 italic">
                    <div className="flex items-center gap-1">
                      <FileText size={11} /> {row.allocation_remark}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => { setSelectedRow(row); setShowPopup(true); }}
                      className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-bold rounded hover:bg-rose-100 transition-all"
                      title="Deallocate this spool"
                    >
                      <XCircle size={11} /> Deallocate
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-400 text-xs">
                    No records found for &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Deallocation Confirmation Popup ── */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden">
            <div className="border-b px-5 py-4">
              <h2 className="text-sm font-bold text-slate-800">Confirm Deallocation</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-slate-600 mb-2">
                Are you sure you want to deallocate this spool?
              </p>
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Spool ID</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{selectedRow?.spool_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PT Machine</span>
                  <span className="text-xs font-bold text-slate-700">{selectedRow?.pt_machine_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Preform ID</span>
                  <span className="text-xs font-bold text-slate-700">{selectedRow?.preform_id}</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-600 mt-3">
                This will free the PT machine and mark the spool as unallocated.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => { setShowPopup(false); setSelectedRow(null); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeallocate}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all"
              >
                Deallocate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PTRunningTable;
