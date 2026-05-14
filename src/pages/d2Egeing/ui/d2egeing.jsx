import React, { useState, useRef, useEffect } from 'react';
import { Scan, ClipboardList, FlaskConical, Plus, Trash2, FolderOpen, Save } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import SelectionModal from '../../../components/selectionModal';

/* ── helpers ── */
const today = new Date().toISOString().split('T')[0];
let testCounter = 1;

/* Auto-generate batch ID: date-chamberNo-sequence */
const makeBatchId = (date, chamberNo, seq) => {
  if (!date || !chamberNo || chamberNo === 'Select') return '';
  const d = date.replace(/-/g, '');
  const c = chamberNo.replace(/\D/g, '');
  return `${d}-${c}-${seq}`;
};

/* Simulate barcode fetch */
const fetchBarcode = (barcode) => ({
  pt_len:     (Math.random() * 500 + 100).toFixed(1),
  d2_chamber: `CH-${Math.floor(Math.random() * 5 + 1)}`,
  date_time:  new Date().toLocaleString('en-IN'),
  grade:      ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
});

/* Draft storage helpers */
const DRAFT_KEY = 'd2_issue_drafts';
const loadAllDrafts = () => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); }
  catch { return {}; }
};
const saveDraft = (batchId, rows, header) => {
  const all = loadAllDrafts();
  all[batchId] = { batchId, rows, header, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
};
const deleteDraft = (batchId) => {
  const all = loadAllDrafts();
  delete all[batchId];
  localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
};

/* ── Max rows constant ── */
const MAX_ROWS = 165;
const WARN_AT  = 165;

/* ══════════════════════════════════════════════════════════ */
const D2Issue = () => {
  /* header state */
  const [chamberNo,  setChamberNo]  = useState('');
  const [date,       setDate]       = useState(today);
  const [batchSeq,   setBatchSeq]   = useState(1);
  const [scanInput,  setScanInput]  = useState('');

  /* derived batch id */
  const batchId = makeBatchId(date, chamberNo, batchSeq);

  /* table rows */
  const [rows, setRows] = useState([]);

  /* modals */
  const [showLimitPopup,  setShowLimitPopup]  = useState(false);
  const [showDraftModal,  setShowDraftModal]  = useState(false);
  const [draftList,       setDraftList]       = useState([]);

  const scanRef = useRef(null);

  /* ── Add a scanned row ── */
  const addRow = (barcode) => {
    if (!barcode.trim()) return;
    if (rows.length >= MAX_ROWS) { setShowLimitPopup(true); return; }

    const fetched = fetchBarcode(barcode);
    const newRow  = { id: Date.now(), barcode, ...fetched, batch_id: batchId, date };

    const next = [...rows, newRow];
    setRows(next);
    setScanInput('');

    if (next.length === WARN_AT) setShowLimitPopup(true);
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── Remove row ── */
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  /* ── Save Draft ── */
  const handleSaveDraft = () => {
    if (!batchId) { alert('Please select D2 Chamber No and Date first.'); return; }
    if (rows.length === 0) { alert('No rows to save.'); return; }
    saveDraft(batchId, rows, { chamberNo, date, batchSeq });
    alert(`Draft saved for batch: ${batchId}`);
  };

  /* ── Load Draft modal ── */
  const openDraftModal = () => {
    const all = loadAllDrafts();
    setDraftList(Object.values(all).map(d => ({
      batchId:  d.batchId,
      rows:     d.rows.length,
      savedAt:  new Date(d.savedAt).toLocaleString('en-IN'),
      header:   d.header,
    })));
    setShowDraftModal(true);
  };

  /* ── On draft select ── */
  const onDraftSelect = (selected) => {
    const all = loadAllDrafts();
    const draft = all[selected.batchId];
    if (!draft) return;
    setChamberNo(draft.header.chamberNo);
    setDate(draft.header.date);
    setBatchSeq(draft.header.batchSeq);
    setRows(draft.rows);
  };

  /* ── Keyboard scan ── */
  const handleScanKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addRow(scanInput); }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

          {/* ── Header fields ── */}
          <ModuleCard compact title="D2 Issue Entry" icon={<FlaskConical size={13} className="text-blue-600" />}>
            <div className="grid grid-cols-5 gap-2 items-end">

              {/* D2 Chamber No — first */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">D2 Chamber No</label>
                <select
                  value={chamberNo}
                  onChange={e => { setChamberNo(e.target.value); setBatchSeq(1); }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/20 outline-none cursor-pointer"
                >
                  {['Select','Chamber 1','Chamber 2','Chamber 3','Chamber 4','Chamber 5'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Batch ID — auto-generated, read-only */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Batch ID</label>
                <div className="flex gap-1">
                  <input readOnly value={batchId} placeholder="Auto-generated..."
                    className="flex-1 bg-slate-200 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 font-mono outline-none cursor-default" />
                  {/* Sequence stepper */}
                  <div className="flex flex-col">
                    <button type="button" onClick={() => setBatchSeq(s => s + 1)}
                      className="px-1.5 bg-slate-100 border border-slate-200 rounded-t text-[8px] hover:bg-slate-200 leading-none py-0.5">▲</button>
                    <button type="button" onClick={() => setBatchSeq(s => Math.max(1, s - 1))}
                      className="px-1.5 bg-slate-100 border border-slate-200 rounded-b text-[8px] hover:bg-slate-200 leading-none py-0.5">▼</button>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
              </div>

              {/* Scan barcode */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Scan Barcode</label>
                <div className="flex gap-1">
                  <input
                    ref={scanRef}
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={handleScanKey}
                    placeholder="Scan or type..."
                    className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20"
                  />
                  <button type="button" onClick={() => addRow(scanInput)}
                    className="flex items-center gap-0.5 px-2 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded hover:bg-indigo-700 transition-all">
                    <Scan size={9} />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 items-end">
                {/* Test scan */}
                <button type="button"
                  onClick={() => addRow(`TEST-${String(testCounter++).padStart(4,'0')}`)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-amber-500 text-white text-[8px] font-bold rounded hover:bg-amber-600 transition-all whitespace-nowrap">
                  <Plus size={9} /> Test
                </button>
                {/* Load Draft */}
                <button type="button" onClick={openDraftModal}
                  className="flex items-center gap-1 px-2 py-1.5 bg-slate-600 text-white text-[8px] font-bold rounded hover:bg-slate-700 transition-all whitespace-nowrap">
                  <FolderOpen size={9} /> Drafts
                </button>
                {/* Save Draft */}
                <button type="button" onClick={handleSaveDraft}
                  disabled={rows.length === 0}
                  className={`flex items-center gap-1 px-2 py-1.5 text-[8px] font-bold rounded transition-all whitespace-nowrap ${
                    rows.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}>
                  <Save size={9} /> Save Draft {rows.length > 0 ? `(${rows.length})` : ''}
                </button>
              </div>
            </div>

            {/* Row count indicator */}
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100">
              <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                rows.length >= MAX_ROWS ? 'bg-rose-100 text-rose-700' :
                rows.length >= 130      ? 'bg-amber-100 text-amber-700' :
                                          'bg-emerald-100 text-emerald-700'
              }`}>
                {rows.length} / {MAX_ROWS} rows
              </div>
              {batchId && (
                <span className="text-[9px] text-slate-500 font-mono">Batch: <strong>{batchId}</strong></span>
              )}
            </div>
          </ModuleCard>

          {/* ── Main table ── */}
          <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
              <ClipboardList size={12} className="text-blue-600" />
              <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">D2 Issue Log</span>
              {rows.length > 0 && (
                <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{rows.length}</span>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-200">
                    {['Sr No','Barcode','PT Len','D2 Chamber','Date & Time','Grade','Batch ID',''].map(h => (
                      <th key={h} className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[10px] text-slate-400">
                        No entries yet — scan a barcode or click Test
                      </td>
                    </tr>
                  ) : rows.map((row, i) => (
                    <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100 w-8">{i + 1}</td>
                      <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.barcode}</td>
                      <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.pt_len}</td>
                      <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.d2_chamber}</td>
                      <td className="px-2 py-1.5 text-xs text-slate-500 border-r border-slate-100">{row.date_time}</td>
                      <td className="px-2 py-1.5 border-r border-slate-100">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          row.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          row.grade === 'B' ? 'bg-amber-100 text-amber-700' :
                                              'bg-rose-100 text-rose-700'
                        }`}>{row.grade}</span>
                      </td>
                      <td className="px-2 py-1.5 text-xs font-mono text-slate-500 border-r border-slate-100">{row.batch_id}</td>
                      <td className="px-2 py-1.5 text-center">
                        <button type="button" onClick={() => removeRow(row.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ── 165 Limit Popup ── */}
      {showLimitPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={22} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {rows.length >= MAX_ROWS ? '165 Entries Reached' : '165 Entry Limit'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {rows.length >= MAX_ROWS
                ? 'You have reached the maximum of 165 entries. Please save the draft before adding more.'
                : '165 entries have been recorded. Please save the draft now.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowLimitPopup(false)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200">
                Continue
              </button>
              <button
                onClick={() => { handleSaveDraft(); setShowLimitPopup(false); }}
                className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">
                Save Draft Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Draft Selection Modal ── */}
      <SelectionModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        title="Select Draft Batch"
        data={draftList}
        columns={[
          { key: 'batchId',  label: 'Batch ID'   },
          { key: 'rows',     label: 'Rows'        },
          { key: 'savedAt',  label: 'Saved At'    },
        ]}
        onSelect={(selected) => {
          onDraftSelect(selected);
          setShowDraftModal(false);
        }}
      />
    </div>
  );
};

export default D2Issue;
