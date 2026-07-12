import { useState, useRef, useEffect } from 'react';
import { Scan, Trash2, ClipboardCheck, Plus, Palette, RotateCcw } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import {
  validateBobbinForColor, submitColorRequest,
  validateBobbinForRewind, submitRewindRequest, getQCUsers,
} from '../services/fg_rejection.api';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const COLORS = ['Natural', 'Blue', 'Red', 'Green', 'Yellow', 'White', 'Orange', 'Violet'];

/* ══════════════════════════════════════════════════════════ */
const FGFiberRejection = () => {
  const [mode, setMode] = useState(''); // '' | 'color' | 'rewind'
  const [qcUsers, setQcUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try { const res = await getQCUsers(); setQcUsers(res?.data || []); } catch (_) {}
    })();
  }, []);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">FG Fiber Rejection</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMode('color')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all border ${
                mode === 'color' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}><Palette size={11} /> Color</button>
            <button type="button" onClick={() => setMode('rewind')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all border ${
                mode === 'rewind' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}><RotateCcw size={11} /> Rewinding / Rework</button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden">
          {mode === 'color' && <ColorPanel qcUsers={qcUsers} />}
          {mode === 'rewind' && <RewindPanel qcUsers={qcUsers} />}
          {!mode && (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-slate-400">Select <strong>Color</strong> or <strong>Rewinding / Rework</strong> to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COLOR PANEL
   ══════════════════════════════════════════════════════════ */
const ColorPanel = ({ qcUsers }) => {
  const [requireColor, setRequireColor] = useState('');
  const [requestBy, setRequestBy] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const scanRef = useRef(null);

  const refocus = () => { setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); };

  const handleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    if (!requireColor) { showError('Select Required Color first'); return; }
    if (!requestBy) { showError('Select Request By first'); return; }
    if (rows.some(r => r.bobbin_no === bobbin_no)) { showError('This bobbin has already been scanned.'); refocus(); return; }

    try {
      const res = await validateBobbinForColor(bobbin_no, requireColor);
      if (!res?.success) { showError(res?.message || 'Validation failed'); refocus(); return; }
      setRows(prev => [...prev, { id: Date.now(), ...res.data }]);
      refocus();
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); refocus(); }
  };

  const handleSubmit = async () => {
    if (!rows.length) { showError('No bobbins scanned'); return; }
    setSubmitting(true);
    try {
      const payload = {
        require_color: requireColor,
        request_by: requestBy,
        date: today(),
        time: nowTime(),
        bobbins: rows.map(r => ({
          bobbin_no: r.bobbin_no,
          bobbin_fid: r.bobbin_fid,
          current_color: r.current_color || r.fiber_color,
          total_length: r.fiber_length,
        })),
      };
      const res = await submitColorRequest(payload);
      if (res?.success) { showSuccess(`${rows.length} bobbin(s) submitted for color change!`); setRows([]); }
      else showError(res?.message || 'Submit failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="w-36 flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Required Color</label>
            <select value={requireColor} onChange={e => setRequireColor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
              <option value="">Select</option>
              {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-36 flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Request By</label>
            <select value={requestBy} onChange={e => setRequestBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
              <option value="">Select</option>
              {qcUsers.map(u => <option key={u.qc_user_name} value={u.qc_user_name}>{u.qc_user_name}</option>)}
            </select>
          </div>
          <div className="flex-1 max-w-xs flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-indigo-600 uppercase">Scan Bobbin</label>
            <div className="flex gap-1.5">
              <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                placeholder="Scan bobbin..." autoFocus
                className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300" />
              <button type="button" onClick={handleScan}
                className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95">
                <Scan size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5">
            <ResetButton compact type="button" onClick={() => { setRows([]); setRequireColor(''); setRequestBy(''); }}>Reset</ResetButton>
            <SubmitButton compact type="button" disabled={submitting || !rows.length} onClick={handleSubmit}>
              {submitting ? 'Saving...' : `Submit (${rows.length})`}
            </SubmitButton>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              {['#', 'Bobbin No', 'Bobbin FID', 'Current Color', 'Require Color', 'Fiber Length', ''].map(h => (
                <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">Scan bobbins to add</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-blue-50/30 group">
                <td className="px-3 py-2 text-xs text-slate-400 font-bold">{i + 1}</td>
                <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700">{r.bobbin_no}</td>
                <td className="px-3 py-2 text-xs font-mono text-slate-600">{r.bobbin_fid || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.current_color || r.fiber_color || '—'}</td>
                <td className="px-3 py-2 text-xs font-bold text-indigo-700">{requireColor}</td>
                <td className="px-3 py-2 text-xs font-mono text-emerald-700">{r.fiber_length || '—'}</td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   REWIND PANEL
   ══════════════════════════════════════════════════════════ */
const RewindPanel = ({ qcUsers }) => {
  const [requestBy, setRequestBy] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [rows, setRows] = useState([]);
  const [popup, setPopup] = useState(null); // { bobbin data for popup }
  const [rewindType, setRewindType] = useState(''); // 'REWINDING' | 'CUT'
  const [cuts, setCuts] = useState([{ p1: '', p2: '', c_remark: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const scanRef = useRef(null);

  const refocus = () => { setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); };

  const handleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    if (!requestBy) { showError('Select Request By first'); return; }
    if (rows.some(r => r.bobbin_no === bobbin_no)) { showError('This bobbin has already been scanned.'); refocus(); return; }

    try {
      const res = await validateBobbinForRewind(bobbin_no);
      if (!res?.success) { showError(res?.message || 'Validation failed'); refocus(); return; }
      // Show popup for rewinding type selection
      setPopup(res.data);
      setRewindType('');
      setCuts([{ p1: '', p2: '', c_remark: '' }]);
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); refocus(); }
  };

  const handlePopupConfirm = () => {
    if (!rewindType) { showError('Select Rewinding Type'); return; }
    if (rewindType === 'CUT') {
      const hasEmpty = cuts.some(c => !c.p1 || !c.p2);
      if (hasEmpty) { showError('Fill all P1 and P2 values'); return; }
    }

    setRows(prev => [...prev, {
      id: Date.now(),
      ...popup,
      rewinding_type: rewindType,
      cuts: rewindType === 'CUT' ? [...cuts] : [],
    }]);
    setPopup(null);
    setRewindType('');
    setCuts([{ p1: '', p2: '', c_remark: '' }]);
    refocus();
  };

  const handleSubmit = async () => {
    if (!rows.length) { showError('No bobbins scanned'); return; }
    setSubmitting(true);
    try {
      const payload = {
        request_by: requestBy,
        date: today(),
        time: nowTime(),
        bobbins: rows.map(r => ({
          bobbin_no: r.bobbin_no,
          bobbin_fid: r.bobbin_fid,
          total_length: r.fiber_length,
          rewinding_type: r.rewinding_type,
          cuts: r.cuts || [],
        })),
      };
      const res = await submitRewindRequest(payload);
      if (res?.success) { showSuccess(`${rows.length} bobbin(s) submitted for rewinding!`); setRows([]); }
      else showError(res?.message || 'Submit failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="w-36 flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Request By</label>
            <select value={requestBy} onChange={e => setRequestBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
              <option value="">Select</option>
              {qcUsers.map(u => <option key={u.qc_user_name} value={u.qc_user_name}>{u.qc_user_name}</option>)}
            </select>
          </div>
          <div className="flex-1 max-w-xs flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-amber-600 uppercase">Scan Bobbin</label>
            <div className="flex gap-1.5">
              <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                placeholder="Scan bobbin..." autoFocus
                className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-amber-300" />
              <button type="button" onClick={handleScan}
                className="w-9 h-9 flex items-center justify-center bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:scale-95">
                <Scan size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5">
            <ResetButton compact type="button" onClick={() => { setRows([]); setRequestBy(''); }}>Reset</ResetButton>
            <SubmitButton compact type="button" disabled={submitting || !rows.length} onClick={handleSubmit}>
              {submitting ? 'Saving...' : `Submit (${rows.length})`}
            </SubmitButton>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              {['#', 'Bobbin No', 'Bobbin FID', 'Fiber Length', 'Type', 'Cuts', ''].map(h => (
                <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">Scan bobbins to add</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-amber-50/30 group">
                <td className="px-3 py-2 text-xs text-slate-400 font-bold">{i + 1}</td>
                <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700">{r.bobbin_no}</td>
                <td className="px-3 py-2 text-xs font-mono text-slate-600">{r.bobbin_fid || '—'}</td>
                <td className="px-3 py-2 text-xs font-mono text-emerald-700">{r.fiber_length || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    r.rewinding_type === 'CUT' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{r.rewinding_type}</span>
                </td>
                <td className="px-3 py-2 text-[9px] text-slate-500">
                  {r.cuts?.length > 0 ? r.cuts.map((c, ci) => `(${c.p1}-${c.p2})`).join(', ') : '—'}
                </td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Rewinding Type Popup ── */}
      {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-[420px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Rewinding Type</h3>
            <p className="text-[10px] text-slate-500 mb-3">Bobbin: <span className="font-mono font-bold text-blue-700">{popup.bobbin_no}</span> | Length: <span className="font-bold">{popup.fiber_length}</span></p>

            {/* Type selection */}
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => { setRewindType('REWINDING'); setCuts([]); }}
                className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                  rewindType === 'REWINDING' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>Whole Length</button>
              <button type="button" onClick={() => { setRewindType('CUT'); setCuts([{ p1: '', p2: '', c_remark: '' }]); }}
                className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                  rewindType === 'CUT' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>Cut</button>
            </div>

            {/* Cut instructions (FieldArray) */}
            {rewindType === 'CUT' && (
              <div className="border border-slate-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Cutting Instructions</span>
                  <button type="button" onClick={() => setCuts(prev => [...prev, { p1: '', p2: '', c_remark: '' }])}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold rounded border border-blue-200 hover:bg-blue-100">
                    <Plus size={9} /> Add Row
                  </button>
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-500 font-bold">
                      <th className="text-left py-1">P1</th>
                      <th className="text-left py-1">P2</th>
                      <th className="text-left py-1">Remark</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuts.map((cut, ci) => (
                      <tr key={ci}>
                        <td className="py-1 pr-1">
                          <input type="number" value={cut.p1} onChange={e => { const v = [...cuts]; v[ci].p1 = e.target.value; setCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="P1" />
                        </td>
                        <td className="py-1 pr-1">
                          <input type="number" value={cut.p2} onChange={e => { const v = [...cuts]; v[ci].p2 = e.target.value; setCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="P2" />
                        </td>
                        <td className="py-1 pr-1">
                          <input type="text" value={cut.c_remark} onChange={e => { const v = [...cuts]; v[ci].c_remark = e.target.value; setCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="e.g. h1310" />
                        </td>
                        <td className="py-1 text-center">
                          {cuts.length > 1 && (
                            <button type="button" onClick={() => setCuts(prev => prev.filter((_, i) => i !== ci))}
                              className="text-slate-300 hover:text-rose-500"><Trash2 size={11} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => { setPopup(null); refocus(); }}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button type="button" onClick={handlePopupConfirm}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FGFiberRejection;
