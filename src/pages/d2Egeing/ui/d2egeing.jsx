import { useState, useRef, useEffect } from 'react';
import { Scan, ClipboardList, FlaskConical, Trash2, ShieldAlert, ShieldOff, FileText } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getD2Chambers, getQCUsers, validateBobbinForD2, submitD2Issue, getDraftList, getDraftDetails, saveDraftBobbin, removeDraftBobbin, deleteDraft } from '../services/d2_issue.api';

const today = new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

/* ── Batch ID helper: YYYYMMDDHHmmss-chamberNo ── */
const makeBatchId = (chamberNo) => {
  if (!chamberNo) return '';
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  return `${ts}-${chamberNo}`;
};

/* ── Confirmation Dialog ── */
const ConfirmDialog = ({ isOpen, title, message, onYes, onNo }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-96">
        <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-600 mb-4 whitespace-pre-line">{message}</p>
        <div className="flex gap-2">
          <button onClick={onNo} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">No</button>
          <button onClick={onYes} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">Yes</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
const D2Issue = () => {
  const [chambers, setChambers] = useState([]);
  const [qcUsers, setQcUsers] = useState([]);
  const [chamber, setChamber] = useState('');
  const [startOperator, setStartOperator] = useState('');
  const [d2StartDate, setD2StartDate] = useState(today);
  const [d2StartTime, setD2StartTime] = useState(nowTime());
  const [restricted, setRestricted] = useState(true);
  const [batchId, setBatchId] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onYes: null, onNo: null });
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const draftRef = useRef(null);
  const scanRef = useRef(null);

  // Close draft dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (draftRef.current && !draftRef.current.contains(e.target)) setDraftOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Fetch master data ── */
  useEffect(() => {
    (async () => {
      try {
        const [cRes, uRes] = await Promise.all([getD2Chambers(), getQCUsers()]);
        if (cRes?.success) setChambers((cRes.data || []).filter(c => c.is_active));
        setQcUsers(uRes?.data || []);
      } catch (e) { console.error('Master data error:', e); }
    })();
    loadDrafts();
  }, []);

  /* ── Load draft list ── */
  const loadDrafts = async () => {
    try {
      const res = await getDraftList();
      if (res?.success) setDrafts(res.data || []);
    } catch (e) { console.error('Draft load error:', e); }
  };

  /* ── Load a specific draft ── */
  const handleLoadDraft = async (draftBatchId) => {
    if (!draftBatchId) { setSelectedDraft(''); return; }
    setDraftLoading(true);
    try {
      const res = await getDraftDetails(draftBatchId);
      if (res?.success && res.data) {
        const draft = res.data;
        // Restore header fields
        if (draft.chamber) setChamber(String(draft.chamber));
        if (draft.d2_type) setRestricted(draft.d2_type === 'restricted');
        setBatchId(draftBatchId);
        setSelectedDraft(draftBatchId);
        // Restore bobbins
        const bobbins = (draft.bobbins || []).map((b, i) => ({
          id: Date.now() + i,
          bobbin_no: b.bobbin_no,
          bobbin_fid: b.bobbin_fid || '',
          fiber_type: b.fiber_type || '',
          fiber_color: b.fiber_color || '',
          temp_grade: b.temp_grade || '',
          final_grade: b.final_grade || '',
          d2_type: b.d2_type || (restricted ? 'restricted' : 'not-restricted'),
        }));
        setRows(bobbins);
      }
    } catch (e) {
      showError('Failed to load draft');
    }
    setDraftLoading(false);
  };

  const refocus = () => { setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); };

  const askConfirm = (title, message) => new Promise((resolve) => {
    setConfirm({
      open: true, title, message,
      onYes: () => { setConfirm(c => ({ ...c, open: false })); resolve(true); },
      onNo: () => { setConfirm(c => ({ ...c, open: false })); resolve(false); },
    });
  });

  /* ── Scan ── */
  const handleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;

    // Validate header fields
    if (!chamber) { showError('Select D2 Chamber first'); return; }
    if (!startOperator) { showError('Select Start Operator first'); return; }

    // Local duplicate check
    if (rows.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin has already been scanned.');
      refocus(); return;
    }

    try {
      const res = await validateBobbinForD2(bobbin_no, restricted);

      if (!res?.success) {
        showError(res?.message || 'Bobbin not found.');
        refocus(); return;
      }

      const data = res.data;

      // Backend returns validation flags
      // d2_issue check
      if (data.d2_issue === true) {
        showError('This bobbin is already issued for D2.');
        refocus(); return;
      }

      // Restricted mode validations
      if (restricted) {
        // Step 1: Check temp_grade exists
        const tg = (data.temp_grade || '').toUpperCase();
        if (!tg) {
          showError('This bobbin does not have a temporary grade. Cannot issue for D2.');
          refocus(); return;
        }

        // Step 2: If temp_grade is REW or FAIL, block
        if (tg === 'REW' || tg === 'FAIL') {
          showError(`This bobbin cannot be issued because its temporary grade is ${tg}.`);
          refocus(); return;
        }

        // Step 3: temp_grade is valid (A+, A, B, C etc.) — now check PV
        if (data.pv_completed === false) {
          showError('This bobbin has not completed PV. Cannot issue for D2.');
          refocus();
          return;
        }

        // Add with d2_type = 'restricted'
        const newRow = {
          id: Date.now(),
          bobbin_no: data.bobbin_no,
          bobbin_fid: data.bobbin_fid || '',
          fiber_type: data.fiber_type || '',
          fiber_color: data.fiber_color || '',
          temp_grade: data.temp_grade || '',
          final_grade: data.final_grade || '',
          d2_type: 'restricted',
        };
        setRows(prev => [...prev, newRow]);

        // Auto-save to draft
        autoSaveDraft(newRow);
      } else {
        // Not-restricted mode: check temp_grade
        const tg = (data.temp_grade || '').toUpperCase();
        if (tg === 'REW' || tg === 'FAIL') {
          showError(`This bobbin cannot be issued because its temporary grade is ${tg}.`);
          refocus(); return;
        }
        // Add with d2_type = 'not-restricted'
        const newRow = {
          id: Date.now(),
          bobbin_no: data.bobbin_no,
          bobbin_fid: data.bobbin_fid || '',
          fiber_type: data.fiber_type || '',
          fiber_color: data.fiber_color || '',
          temp_grade: data.temp_grade || '',
          final_grade: data.final_grade || '',
          d2_type: 'not-restricted',
        };
        setRows(prev => [...prev, newRow]);

        // Auto-save to draft
        autoSaveDraft(newRow);
      }
      refocus();
    } catch (err) {
      showError(err?.response?.data?.message || 'Something went wrong');
      refocus();
    }
  };

  /* ── Auto-save bobbin to draft ── */
  const autoSaveDraft = async (row) => {
    if (!batchId) return;
    try {
      await saveDraftBobbin({
        d2_batch_id: batchId,
        bobbin_fid: row.bobbin_fid,
        bobbin_no: row.bobbin_no,
        chamber: Number(chamber),
        d2_type: row.d2_type,
      });
      // Refresh draft list so the new batch appears
      loadDrafts();
    } catch (e) {
      // If duplicate in another draft, show error and remove from grid
      if (e?.response?.data?.message) {
        showError(e.response.data.message);
        setRows(prev => prev.filter(r => r.bobbin_no !== row.bobbin_no));
      }
    }
  };

  /* ── Remove ── */
  const removeRow = async (id) => {
    const row = rows.find(r => r.id === id);
    setRows(prev => prev.filter(r => r.id !== id));
    // Also remove from draft
    if (row && batchId) {
      try { await removeDraftBobbin(batchId, row.bobbin_no); } catch (e) { /* silent */ }
    }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!rows.length) { showError('No entries to submit'); return; }
    if (!chamber) { showError('Select D2 Chamber'); return; }
    if (!startOperator) { showError('Select Start Operator'); return; }

    setSubmitting(true);
    try {
      const payload = {
        d2_batch_id: batchId,
        start_operator: startOperator,
        d2_start_date: d2StartDate,
        d2_start_time: d2StartTime,
        chamber: Number(chamber),
        bobbins: rows.map(r => ({
          bobbin_fid: r.bobbin_fid,
          bobbin_no: r.bobbin_no,
          d2_type: r.d2_type,
        })),
      };

      const res = await submitD2Issue(payload);
      if (res?.success) {
        // Delete draft after successful submission
        if (batchId) {
          try { await deleteDraft(batchId); } catch (e) { /* silent */ }
        }
        showSuccess(`${rows.length} bobbin(s) issued to D2 Chamber ${chamber} successfully!`);
        handleReset();
        loadDrafts(); // Refresh draft list
      } else {
        showError(res?.message || 'Submit failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  /* ── Delete entire draft ── */
  const handleDeleteDraft = async (batchId, e) => {
    e.stopPropagation();
    const yes = await askConfirm(
      'Delete Draft',
      `Are you sure you want to delete draft batch:\n"${batchId}"?\n\nThis will permanently remove all scanned bobbins in this draft.`
    );
    if (!yes) return;
    try {
      await deleteDraft(batchId);
      showSuccess('Draft deleted successfully');
      // If the deleted draft was currently loaded, reset the screen
      if (selectedDraft === batchId) handleReset();
      loadDrafts();
    } catch (e) {
      showError('Failed to delete draft');
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    setChamber(''); setStartOperator('');
    setD2StartDate(today); setD2StartTime(nowTime());
    setBatchId(''); setScanInput(''); setRows([]);
    setSelectedDraft('');
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Action bar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FlaskConical size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">D2 Issue Entry</h1>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Deuterium Aging Chamber Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Draft dropdown */}
            {/* Draft dropdown with delete option */}
            <div ref={draftRef} className="relative">
              <button
                type="button"
                onClick={() => setDraftOpen(o => !o)}
                disabled={draftLoading}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm hover:border-amber-300 transition-all"
              >
                <FileText size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-slate-700 max-w-[140px] truncate">
                  {selectedDraft ? `${selectedDraft} (${drafts.find(d => d.d2_batch_id === selectedDraft)?.bobbin_count || 0})` : 'Load Draft'}
                </span>
                <span className={`text-[8px] text-slate-400 transition-transform ${draftOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {draftOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[240px] overflow-hidden">
                  {/* Header */}
                  <div className="px-3 py-2 bg-amber-50 border-b border-amber-100">
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Active Drafts</span>
                  </div>

                  {drafts.length === 0 ? (
                    <div className="px-4 py-4 text-center">
                      <p className="text-[10px] text-slate-400">No active drafts</p>
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto">
                      {drafts.map(d => (
                        <div
                          key={d.d2_batch_id}
                          className={`flex items-center gap-2 px-3 py-2 hover:bg-amber-50 transition-colors border-b border-slate-50 last:border-0 group
                            ${selectedDraft === d.d2_batch_id ? 'bg-amber-50' : ''}`}
                        >
                          {/* Click area to load draft */}
                          <button
                            type="button"
                            onClick={() => { handleLoadDraft(d.d2_batch_id); setDraftOpen(false); }}
                            className="flex-1 text-left min-w-0"
                          >
                            <p className="text-[10px] font-bold text-slate-800 truncate">{d.d2_batch_id}</p>
                            <p className="text-[9px] text-slate-400">
                              Chamber {d.chamber} · {d.bobbin_count || 0} bobbins · {d.d2_type}
                            </p>
                          </button>

                          {/* X delete button */}
                          <button
                            type="button"
                            title="Delete this draft"
                            onClick={(e) => { setDraftOpen(false); handleDeleteDraft(d.d2_batch_id, e); }}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full
                              text-slate-300 hover:text-white hover:bg-rose-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <span className="text-[10px] font-bold leading-none">✕</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Restricted toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <button type="button"
                onClick={() => { if (rows.length === 0) setRestricted(true); }}
                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-all ${
                  restricted ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}>
                <ShieldAlert size={12} /> Restricted
              </button>
              <button type="button"
                onClick={() => { if (rows.length === 0) setRestricted(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-all ${
                  !restricted ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}>
                <ShieldOff size={12} /> Not Restricted
              </button>
            </div>
            {/* Count */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <span className={`text-[10px] font-bold font-mono ${
                rows.length > 0 ? 'text-emerald-600' : 'text-slate-400'
              }`}>{rows.length} scanned</span>
            </div>
            <ResetButton compact type="button" onClick={handleReset}>Reset</ResetButton>
            <SubmitButton compact type="button" disabled={submitting || !rows.length}
              onClick={handleSubmit}>
              {submitting ? 'Saving...' : `Submit (${rows.length})`}
            </SubmitButton>
          </div>
        </div>

        {/* ── Header fields ── */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="grid grid-cols-5 gap-3 items-end">

            {/* Chamber */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">D2 Chamber</label>
              <select value={chamber}
                onChange={e => { const val = e.target.value; setChamber(val); setBatchId(makeBatchId(val)); }}
                disabled={rows.length > 0}
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs font-bold text-blue-800 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition-all disabled:opacity-50">
                <option value="">Select</option>
                {chambers.map(c => <option key={c.d2_chamber_id} value={c.d2_chamber_no}>{c.d2_chamber_no}</option>)}
              </select>
            </div>

            {/* Batch ID (auto) */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Batch ID</label>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-600 truncate">
                {batchId || '—'}
              </div>
            </div>

            {/* Start Operator */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Start Operator</label>
              <select value={startOperator} onChange={e => setStartOperator(e.target.value)}
                
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-all disabled:opacity-50">
                <option value="">Select</option>
                {qcUsers.map(u => <option key={u.qc_user_name} value={u.qc_user_name}>{u.qc_user_name}</option>)}
              </select>
            </div>

            {/* D2 Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input type="date" value={d2StartDate} onChange={e => setD2StartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>

            {/* D2 Start Time */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
              <input type="time" value={d2StartTime} onChange={e => setD2StartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>

          </div>

          {/* Scan row */}
          <div className="grid grid-cols-5 gap-3 items-end mt-2">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Scan Barcode</label>
              <div className="flex gap-1.5">
                <input ref={scanRef} value={scanInput} autoFocus
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                  placeholder="Scan bobbin..."
                  className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300 transition-all" />
                <button type="button" onClick={handleScan}
                  className="flex items-center justify-center w-9 h-9 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                  <Scan size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="bg-slate-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">D2 Issue Log</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                restricted ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>{restricted ? 'Restricted' : 'Not Restricted'}</span>
            </div>
            {rows.length > 0 && (
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                {rows.length} entr{rows.length === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200">
                  {['#', 'Bobbin No', 'Bobbin FID', 'Fiber Type', 'Fiber Color', 'Temp Grade', 'Final Grade', 'D2 Type', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <Scan size={22} className="text-slate-300" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Scan a bobbin barcode to begin</p>
                        <p className="text-[10px] text-slate-300">Entries will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-400 w-10">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {row.bobbin_no}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-600">{row.bobbin_fid || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{row.fiber_type || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{row.fiber_color || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{row.temp_grade || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{row.final_grade || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.d2_type === 'restricted' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{row.d2_type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button type="button" onClick={() => removeRow(row.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ConfirmDialog {...confirm} isOpen={confirm.open} />
    </div>
  );
};

export default D2Issue;
