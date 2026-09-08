import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck, Search, RefreshCw, PlayCircle,
  CheckCircle, XCircle, Trash2,
} from 'lucide-react';
import { showSuccess, showError, showWarning } from '../../../utils/toastService';
import { getPendingUserDecisions, postUserDecisionUD } from '../services/userDecisionService';

const UD_CODE = 'A1';   // "Make Good Material" user decision code
const UD_TYPE = 'FTUD'; // triggers order_conf.ud = true on success

const UserDecisionList = () => {
  const [rows, setRows] = useState([]);        // { id, bobbin_no, inspection_lot, optical_length, final_grade, product_type, checked, ...result }
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [processed, setProcessed] = useState(false); // true once UD has been posted

  /* ── Fetch pending bobbins (order_conf.status = false with an inspection_lot) ── */
  const fetchPending = async () => {
    setLoading(true);
    setProcessed(false);
    try {
      const res = await getPendingUserDecisions();
      if (res?.success) {
        const data = (res.data || []).map((b, i) => ({
          id: `${b.bobbin_no || 'row'}-${i}`,
          bobbin_no: b.bobbin_no || '',
          inspection_lot: b.inspection_lot || '',
          optical_length: b.optical_length ?? '',
          final_grade: b.final_grade ?? '',
          product_type: b.product_type ?? '',
          checked: true,
          posted: null,       // null = not processed, true/false after UD post
          status: '',         // SAP status S/E
          remark: '',
        }));
        setRows(data);
        if (!data.length) showWarning('No bobbins pending user decision');
      } else {
        showError(res?.message || 'Failed to load pending bobbins');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load pending bobbins');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  /* ── Derived ── */
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.bobbin_no.toLowerCase().includes(q) ||
      String(r.inspection_lot).toLowerCase().includes(q)
    );
  }, [rows, search]);

  const selectedRows = useMemo(() => rows.filter(r => r.checked), [rows]);
  const allChecked = filteredRows.length > 0 && filteredRows.every(r => r.checked);

  /* ── Selection ── */
  const toggleRow = (id) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, checked: !r.checked } : r)));

  const toggleAll = () => {
    const visibleIds = new Set(filteredRows.map(r => r.id));
    setRows(prev => prev.map(r => (visibleIds.has(r.id) ? { ...r, checked: !allChecked } : r)));
  };

  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  /* ── Make Good Material → post UD A1 for all selected bobbins ── */
  const handleMakeGoodMaterial = async () => {
    const targets = rows.filter(r => r.checked);
    if (!targets.length) { showError('Select at least one bobbin'); return; }

    const missingLot = targets.filter(r => !r.inspection_lot);
    if (missingLot.length) {
      showError(`${missingLot.length} selected bobbin(s) have no inspection lot`);
      return;
    }

    setProcessing(true);
    try {
      const payload = targets.map(r => ({
        InspectionLot: String(r.inspection_lot),
        UD_CODE,
        type: UD_TYPE,
      }));

      const res = await postUserDecisionUD(payload);

      // The backend returns either a bulk shape { summary: { results, errors } }
      // or a single shape { result } / flat single failure. Normalise both.
      const resultByLot = {};

      if (res?.summary) {
        (res.summary.results || []).forEach(r => {
          if (r.inspection_lot != null) {
            resultByLot[String(r.inspection_lot)] = {
              posted: r.posted !== false,
              status: r.status || 'S',
              remark: r.message || 'Posted',
            };
          }
        });
        (res.summary.errors || []).forEach(e => {
          if (e.inspection_lot != null) {
            resultByLot[String(e.inspection_lot)] = {
              posted: false,
              status: e.status || 'E',
              remark: e.message || 'Failed',
            };
          }
        });
      } else if (res?.result) {
        const r = res.result;
        resultByLot[String(r.inspection_lot)] = {
          posted: r.posted !== false,
          status: r.status || 'S',
          remark: r.message || 'Posted',
        };
      } else if (res && res.success === false && res.inspection_lot) {
        resultByLot[String(res.inspection_lot)] = {
          posted: false,
          status: res.sap_response?.Status || 'E',
          remark: res.message || 'Failed',
        };
      }

      const updated = rows.map(r => {
        if (!r.checked) return r;
        const outcome = resultByLot[String(r.inspection_lot)];
        if (!outcome) {
          return { ...r, posted: false, status: 'E', remark: 'No response from server' };
        }
        return { ...r, posted: outcome.posted, status: outcome.status, remark: outcome.remark };
      });

      setRows(updated);
      setProcessed(true);

      const passCount = updated.filter(r => r.checked && r.posted).length;
      const failCount = updated.filter(r => r.checked && r.posted === false).length;
      if (failCount === 0) showSuccess(`User decision posted for ${passCount} bobbin(s)`);
      else showWarning(`${passCount} posted, ${failCount} failed`);
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong posting the user decision');
    }
    setProcessing(false);
  };

  /* ── Result badge ── */
  const resultBadge = (row) => {
    if (row.posted === null) return <span className="text-[9px] text-slate-400">—</span>;
    if (row.posted) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">SUCCESS</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">FAILED</span>;
  };

  const passCount = rows.filter(r => r.posted === true).length;
  const failCount = rows.filter(r => r.posted === false).length;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={14} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">User Decision</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{rows.length}</span>
            {selectedRows.length > 0 && (
              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{selectedRows.length} selected</span>
            )}
            {processed && (
              <>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{passCount} success</span>
                {failCount > 0 && <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">{failCount} failed</span>}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={fetchPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg hover:bg-slate-200 transition-all">
              <RefreshCw size={11} /> Refresh
            </button>

            {/* Make Good Material → UD A1 */}
            <button onClick={handleMakeGoodMaterial}
              disabled={processing || !selectedRows.length}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50">
              <PlayCircle size={12} /> {processing ? 'Posting...' : `Make Good Material (${selectedRows.length})`}
            </button>
          </div>
        </div>

        {/* ── Filter row ── */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Bobbin / Inspection Lot..."
              className="border border-slate-200 rounded pl-6 pr-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-emerald-300 w-56" />
          </div>
          <span className="text-[9px] text-slate-400">
            Showing bobbins pending user decision (inspection lot present, not yet confirmed).
          </span>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">Loading...</span></div>
          ) : filteredRows.length === 0 ? (
            <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">No bobbins pending user decision</span></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 text-white z-10">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-600" />
                  </th>
                  {['#', 'Bobbin No', 'Inspection Lot', 'Optical Length', 'Final Grade', 'Product Type', 'Result', 'Remark', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((r, i) => (
                  <tr key={r.id}
                    className={`hover:bg-emerald-50/30 transition-colors group
                      ${processed && r.posted === false ? 'bg-rose-50/30' : ''}
                      ${processed && r.posted === true ? 'bg-emerald-50/20' : ''}`}>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={r.checked} onChange={() => toggleRow(r.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-600" />
                    </td>
                    <td className="px-3 py-2 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-emerald-700">{r.bobbin_no || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{r.inspection_lot || '—'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono">{r.optical_length !== '' ? r.optical_length : '—'}</td>
                    <td className="px-3 py-2">
                      {r.final_grade
                        ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{r.final_grade}</span>
                        : <span className="text-[9px] text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-[10px] text-slate-600">{r.product_type || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {r.posted === true && <CheckCircle size={13} className="text-emerald-600" />}
                        {r.posted === false && <XCircle size={13} className="text-rose-500" />}
                        {resultBadge(r)}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[9px] text-slate-500 max-w-xs truncate" title={r.remark}>{r.remark || '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => removeRow(r.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDecisionList;
