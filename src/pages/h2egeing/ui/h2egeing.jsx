import { useState, useRef, useEffect } from 'react';
import {
  FlaskConical, Scan, Trash2, ClipboardList, Loader2,
  CheckCircle2, Clock, Calendar, ChevronRight,
} from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import {
  getH2ChambersInUse,
  getBatchesForH2Issue,
  validateBobbinForH2,
  submitH2Issue,
  getQCUsers,
  getPendingBeforeBatches,
  getPendingAfterBatches,
  getPending14DayBatches,
  getBobbinsForBatch,
  saveBeforeEntry,
  saveAfterEntry,
  save14DayEntry,
} from '../services/h2_ageing.api';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const TABS = [
  { key: 'issue', label: 'H2 Issue' },
  { key: 'before', label: 'Before Entry' },
  { key: 'after', label: 'After Entry' },
  { key: '14day', label: '14 Days Entry' },
];

/* ══════════════════════════════════════════════════════════ */
const H2Ageing = () => {
  const [activeTab, setActiveTab] = useState('issue');
  const [qcUsers, setQcUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getQCUsers();
        setQcUsers(res?.data || []);
      } catch (_) {}
    })();
  }, []);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab bar ── */}
        <div className="flex items-center border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 flex-shrink-0">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <FlaskConical size={14} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-800">H2 Ageing</span>
          </div>
          {TABS.map(t => (
            <button key={t.key} type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === t.key
                  ? 'border-indigo-600 text-indigo-700 bg-white/60'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'issue' && <H2IssueTab qcUsers={qcUsers} />}
          {activeTab === 'before' && <ReadingTab stage="before" qcUsers={qcUsers} />}
          {activeTab === 'after' && <ReadingTab stage="after" qcUsers={qcUsers} />}
          {activeTab === '14day' && <ReadingTab stage="14day" qcUsers={qcUsers} />}
        </div>

      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TAB 1: H2 ISSUE
   ══════════════════════════════════════════════════════════ */
const H2IssueTab = ({ qcUsers }) => {
  const [chambers, setChambers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [chamber, setChamber] = useState('');
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [operator, setOperator] = useState('');
  const [h2Date, setH2Date] = useState(today());
  const [h2Time, setH2Time] = useState(nowTime());
  const [rows, setRows] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [h2BatchInput, setH2BatchInput] = useState('');
  const scanRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, bRes] = await Promise.all([getH2ChambersInUse(), getBatchesForH2Issue()]);
        console.log("h2 chambers response:", cRes);
        console.log("h2 batches response:", bRes);
        if (cRes?.success) setChambers(cRes.data || []);
        else console.warn("H2 chambers not success:", cRes);
        if (bRes?.success) setBatches(bRes.data || []);
        else console.warn("H2 batches not success:", bRes);
      } catch (e) { console.error('H2 Load error:', e?.response?.status, e?.response?.data, e?.message); }
    })();
  }, []);

  const refocus = () => { setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); };

  const handleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    if (!chamber) { showError('Select H2 Chamber first'); return; }
    if (!operator) { showError('Select Operator first'); return; }
    if (rows.some(r => r.bobbin_no === bobbin_no)) { showError('This bobbin has already been scanned.'); refocus(); return; }

    try {
      // Pass selected batches as comma-separated or empty
      const batchParam = selectedBatches.length > 0 ? selectedBatches.join(',') : '';
      const res = await validateBobbinForH2(bobbin_no, batchParam);
      if (!res?.success) { showError(res?.message || 'Validation failed'); refocus(); return; }
      setRows(prev => [...prev, res.data]);
      refocus();
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
      refocus();
    }
  };

  const handleSubmitClick = () => {
    if (!rows.length) { showError('No bobbins scanned'); return; }
    if (!chamber) { showError('Select H2 Chamber'); return; }
    if (!operator) { showError('Select Operator'); return; }
    setH2BatchInput('');
    setShowBatchModal(true);
  };

  const handleModalSubmit = async () => {
    const batchId = h2BatchInput.trim();
    if (!batchId) { showError('Enter H2 Batch ID'); return; }

    setSubmitting(true);
    try {
      const payload = {
        chamber: Number(chamber),
        h2_batch_id: batchId,
        h2_date: h2Date,
        h2_time: h2Time,
        h2_operator: operator,
        bobbins: rows.map(r => ({ bobbin_no: r.bobbin_no, d2_batch_id: r.d2_batch_id })),
      };
      const res = await submitH2Issue(payload);
      if (res?.success) {
        showSuccess(`${rows.length} bobbin(s) issued for H2 Ageing!`);
        setRows([]); setSelectedBatches([]); setScanInput('');
        setShowBatchModal(false);
        // Refresh batches list
        try {
          const bRes = await getBatchesForH2Issue();
          if (bRes?.success) setBatches(bRes.data || []);
        } catch (_) {}
      } else {
        showError(res?.message || 'Submit failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  const handleReset = () => {
    setChamber(''); setSelectedBatches([]); setOperator('');
    setRows([]); setScanInput(''); setH2Date(today()); setH2Time(nowTime());
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header fields — single row */}
      <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="w-24"><Field label="Chamber" value={chamber} onChange={setChamber} type="select"
            options={chambers.map(c => ({ label: String(c.h2_chamber_no), value: String(c.h2_chamber_no) }))} /></div>
          <div className="w-40">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">D2 Batches</label>
              <div className="relative">
                <select
                  value=""
                  onChange={e => {
                    const val = e.target.value;
                    if (val && !selectedBatches.includes(val)) setSelectedBatches(prev => [...prev, val]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                  <option value="">Add batch...</option>
                  {batches.filter(b => !selectedBatches.includes(b.d2_batch_id)).map(b => (
                    <option key={b.d2_batch_id} value={b.d2_batch_id}>{b.d2_batch_id}</option>
                  ))}
                </select>
              </div>
              {selectedBatches.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBatches.map(bid => (
                    <span key={bid} className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      {bid.length > 12 ? `...${bid.slice(-10)}` : bid}
                      <button type="button" onClick={() => setSelectedBatches(prev => prev.filter(x => x !== bid))}
                        className="text-blue-400 hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-32"><Field label="Operator" value={operator} onChange={setOperator} type="select"
            options={qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }))} /></div>
          <div className="w-28"><Field label="H2 Date" value={h2Date} onChange={setH2Date} type="date" /></div>
          <div className="w-24"><Field label="H2 Time" value={h2Time} onChange={setH2Time} type="time" /></div>
          <div className="flex-1 flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Scan</label>
            <div className="flex gap-1">
              <input ref={scanRef} value={scanInput} autoFocus
                onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                placeholder="Scan bobbin..."
                className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300" />
              <button type="button" onClick={handleScan}
                className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 flex-shrink-0">
                <Scan size={12} />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 pb-0.5">
            <ResetButton compact type="button" onClick={handleReset}>Reset</ResetButton>
            <SubmitButton compact type="button" disabled={submitting || !rows.length} onClick={handleSubmitClick}>
              {`Issue (${rows.length})`}
            </SubmitButton>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              {['#', 'Bobbin No', 'D2 Batch ID', 'Fiber Type', 'Fiber Color', 'Spool ID', 'Preform ID', ''].map(h => (
                <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-400">Scan bobbins to add them here</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.bobbin_no} className="border-b border-slate-100 hover:bg-blue-50/30 group">
                <td className="px-3 py-2 text-xs text-slate-400 font-bold">{i + 1}</td>
                <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700">{r.bobbin_no}</td>
                <td className="px-3 py-2 text-xs font-mono text-slate-600">{r.d2_batch_id || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.fiber_type || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.fiber_color || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.spool_id || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.preform_id || '—'}</td>
                <td className="px-3 py-2">
                  <button type="button" onClick={() => setRows(prev => prev.filter(x => x.bobbin_no !== r.bobbin_no))}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* H2 Batch ID Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-96">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Enter H2 Batch ID</h3>
            <input type="text" value={h2BatchInput}
              onChange={e => setH2BatchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleModalSubmit(); } }}
              placeholder="e.g. H2-BATCH-001"
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 mb-4" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowBatchModal(false)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="button" onClick={handleModalSubmit} disabled={submitting}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TABS 2/3/4: READING ENTRIES (Before / After / 14 Day)
   ══════════════════════════════════════════════════════════ */
const ATTN_FIELDS = ['attn_1240', 'attn_1310', 'attn_1383', 'attn_1550', 'attn_1625'];

const ReadingTab = ({ stage, qcUsers }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [bobbins, setBobbins] = useState([]);
  const [readings, setReadings] = useState({});
  const [operator, setOperator] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stageLabel = stage === 'before' ? 'Before' : stage === 'after' ? 'After' : '14 Days';
  const suffix = stage === 'before' ? '_before' : stage === 'after' ? '_after' : '_14_days';

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const fetcher = stage === 'before' ? getPendingBeforeBatches
        : stage === 'after' ? getPendingAfterBatches : getPending14DayBatches;
      const res = await fetcher();
      if (res?.success) setBatches(res.data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchBatches(); }, [stage]);

  const openBatch = async (batch) => {
    setSelectedBatch(batch);
    setReadings(ATTN_FIELDS.reduce((a, f) => ({ ...a, [f]: '' }), {}));
    setOperator('');
    try {
      const res = await getBobbinsForBatch(batch.h2_batch_id);
      if (res?.success) setBobbins(res.data || []);
    } catch (_) { setBobbins([]); }
  };

  const handleSave = async () => {
    if (!operator) { showError('Select operator'); return; }
    for (const f of ATTN_FIELDS) {
      if (!readings[f] && readings[f] !== 0) { showError(`Enter ${f.replace('attn_', 'ATTN ')}`); return; }
    }
    setSubmitting(true);
    try {
      const payload = {
        h2_batch_id: selectedBatch.h2_batch_id,
        operator,
        date: today(),
        time: nowTime(),
        readings: ATTN_FIELDS.reduce((a, f) => ({ ...a, [`${f}${suffix}`]: Number(readings[f]) }), {}),
      };
      const saver = stage === 'before' ? saveBeforeEntry : stage === 'after' ? saveAfterEntry : save14DayEntry;
      const res = await saver(payload);
      if (res?.success) {
        showSuccess(`${stageLabel} readings saved for batch ${selectedBatch.h2_batch_id}`);
        setSelectedBatch(null);
        setBobbins([]);
        fetchBatches();
      } else { showError(res?.message || 'Save failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  /* ── Batch List View ── */
  if (!selectedBatch) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Pending {stageLabel} Entries
          </span>
          <button type="button" onClick={fetchBatches} className="text-[9px] text-blue-600 font-bold hover:underline">Refresh</button>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 size={16} className="text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400">Loading...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <CheckCircle2 size={28} className="text-emerald-300" />
              <p className="text-xs text-slate-400">No pending {stageLabel.toLowerCase()} entries</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {batches.map(b => (
                <button key={b.h2_batch_id} type="button" onClick={() => openBatch(b)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/40 transition-colors text-left group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold font-mono text-indigo-700">{b.h2_batch_id}</span>
                    <div className="flex gap-3 text-[9px] text-slate-400">
                      <span className="flex items-center gap-1"><ClipboardList size={9} /> D2: {b.d2_batch_id || '—'}</span>
                      <span className="flex items-center gap-1"><Calendar size={9} /> {b.h2_date || '—'}</span>
                      <span className="flex items-center gap-1"><Clock size={9} /> Bobbins: {b.total_bobbins}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Batch Detail / Reading Entry View ── */
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setSelectedBatch(null); setBobbins([]); }}
            className="text-[9px] text-blue-600 font-bold hover:underline">← Back</button>
          <span className="text-[10px] font-bold text-slate-700 uppercase">
            {stageLabel} Entry — {selectedBatch.h2_batch_id}
          </span>
          <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
            {bobbins.length} bobbins
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Field label="Operator" value={operator} onChange={setOperator} type="select"
            options={qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }))} inline />
          <SubmitButton compact type="button" disabled={submitting} onClick={handleSave}>
            {submitting ? 'Saving...' : `Save ${stageLabel}`}
          </SubmitButton>
        </div>
      </div>

      {/* Readings input */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="grid grid-cols-5 gap-3">
          {ATTN_FIELDS.map(f => (
            <div key={f} className="flex flex-col gap-0.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase">{f.replace('attn_', 'ATTN ')}</label>
              <input type="number" step="0.001" value={readings[f] || ''}
                onChange={e => setReadings(prev => ({ ...prev, [f]: e.target.value }))}
                placeholder="0.000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Bobbins table */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              {['#', 'Bobbin No', 'D2 Batch', 'H2 Date', 'H2 Operator',
                ...(stage !== 'before' ? ['1240 B', '1310 B', '1383 B', '1550 B', '1625 B'] : []),
                ...(stage === '14day' ? ['1240 A', '1310 A', '1383 A', '1550 A', '1625 A'] : []),
              ].map(h => (
                <th key={h} className="px-2 py-2 text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bobbins.map((b, i) => (
              <tr key={b.bobbin_no} className="border-b border-slate-100 hover:bg-blue-50/20">
                <td className="px-2 py-1.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700">{b.bobbin_no}</td>
                <td className="px-2 py-1.5 text-xs font-mono text-slate-500">{b.d2_batch_id}</td>
                <td className="px-2 py-1.5 text-xs text-slate-500">{b.h2_date || '—'}</td>
                <td className="px-2 py-1.5 text-xs text-slate-500">{b.h2_operator || '—'}</td>
                {stage !== 'before' && <>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1240_before ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1310_before ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1383_before ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1550_before ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1625_before ?? '—'}</td>
                </>}
                {stage === '14day' && <>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1240_after ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1310_after ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1383_after ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1550_after ?? '—'}</td>
                  <td className="px-2 py-1.5 text-xs text-slate-600">{b.attn_1625_after ?? '—'}</td>
                </>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SHARED FIELD COMPONENT
   ══════════════════════════════════════════════════════════ */
const Field = ({ label, value, onChange, type = 'text', options = [], inline = false }) => (
  <div className={`flex flex-col gap-0.5 ${inline ? 'min-w-[140px]' : ''}`}>
    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
        <option value="">Select</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
    )}
  </div>
);

export default H2Ageing;
