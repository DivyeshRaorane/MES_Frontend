import { useState, useRef, useEffect } from 'react';
import { Package, Scan, Box, Layers, Loader2, Plus, Trash2, ArrowLeft, Search, Eye } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getOrderByNo, validateBobbinForPacking, submitPackingList, getAllPackingLists, viewPackingList } from '../services/packing.api';

/* ── Stat card ── */
const StatCard = ({ label, value, max, color }) => (
  <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${color} flex-1`}>
    <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-lg font-black font-mono">
      {value}{max != null ? <span className="text-xs font-bold opacity-50">/{max}</span> : ''}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const PackingListGeneration = () => {
  const [view, setView] = useState('list'); // 'list' | 'create'

  if (view === 'create') {
    return <PackingCreateForm onBack={() => setView('list')} onSaved={() => setView('list')} />;
  }
  return <PackingListView onCreate={() => setView('create')} />;
};

/* ══════════════════════════════════════════════════════════
   PACKING LIST VIEW - Shows previous packing lists
   ══════════════════════════════════════════════════════════ */
const PackingListView = ({ onCreate }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewData, setViewData] = useState(null); // { header, bobbins }
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      try {
        const res = await getAllPackingLists();
        setLists(res?.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchLists();
  }, []);

  const filtered = lists.filter(l => {
    const q = search.toLowerCase();
    return !q || l.order_no?.toLowerCase().includes(q) || l.customer_name?.toLowerCase().includes(q);
  });

  const handleView = async (orderNo) => {
    setViewLoading(true);
    setViewData(null);
    try {
      const res = await viewPackingList(orderNo);
      if (res?.success) {
        setViewData(res.data);
      } else { showError(res?.message || 'Failed to load'); }
    } catch (e) { showError(e?.response?.data?.message || 'Failed to load details'); }
    setViewLoading(false);
  };

  const closeView = () => setViewData(null);

  // View dialog summary
  const viewTotalKm = viewData?.bobbins?.reduce((s, b) => s + (parseFloat(b.length_km || b.fiber_length) || 0), 0) || 0;
  const viewTotalBobbins = viewData?.bobbins?.length || 0;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Packing List</h1>
              <p className="text-[9px] text-slate-400 mt-0.5">Previous packing lists</p>
            </div>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-2">{lists.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-44" />
            </div>
            <button type="button" onClick={onCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm">
              <Plus size={11} /> New Packing List
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['#', 'Order No', 'Customer', 'Total Bobbins', 'Total KM', 'Boxes', 'Stacks', 'Created Date', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">No packing lists found</td></tr>
                ) : filtered.map((item, idx) => (
                  <tr key={item.packing_order_id || idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 text-[10px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs font-bold text-blue-700 font-mono border-r border-slate-100">{item.order_no || item.packing_order}</td>
                    <td className="px-3 py-2 text-xs text-slate-700 border-r border-slate-100">{item.customer_name || '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-600 text-center border-r border-slate-100">{item.total_bobbins || item.bobbin_count || '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono text-emerald-700 border-r border-slate-100">{item.total_km ? parseFloat(item.total_km).toFixed(3) : '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-600 text-center border-r border-slate-100">{item.total_boxes || '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-600 text-center border-r border-slate-100">{item.total_stacks || '—'}</td>
                    <td className="px-3 py-2 text-[10px] text-slate-500 border-r border-slate-100">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => handleView(item.order_no || item.packing_order)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold rounded hover:bg-blue-100 transition-all">
                        <Eye size={9} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── View Dialog/Modal ── */}
      {(viewData || viewLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl w-[85vw] max-h-[85vh] flex flex-col overflow-hidden">
            {/* Dialog Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase">Packing List Detail</span>
                {viewData?.header && (
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{viewData.header.order_no}</span>
                )}
              </div>
              <button type="button" onClick={closeView} className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2">×</button>
            </div>

            {viewLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-blue-500" /></div>
            ) : viewData && (
              <>
                {/* Order Header Info */}
                <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
                  <div className="grid grid-cols-6 gap-4">
                    {[
                      { label: 'Order No', val: viewData.header?.order_no },
                      { label: 'Customer', val: viewData.header?.customer_name },
                      { label: 'Required KM', val: viewData.header?.required_km },
                      { label: 'Box Capacity', val: viewData.header?.box_capacity },
                      { label: 'Stack Capacity', val: viewData.header?.stack_capacity },
                      { label: 'Created', val: viewData.header?.created_at?.split('T')[0] },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{label}</span>
                        <span className="text-[11px] font-bold text-slate-700">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-6 flex-shrink-0 bg-emerald-50/30">
                  <span className="text-[10px] font-bold text-slate-600">Total Bobbins: <span className="text-blue-700">{viewTotalBobbins}</span></span>
                  <span className="text-[10px] font-bold text-slate-600">Total KM: <span className="text-emerald-700">{viewTotalKm.toFixed(3)}</span></span>
                </div>

                {/* Bobbins Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr>
                        {['#', 'Bobbin No', 'FID', 'Length (KM)', 'Box No', 'Stack No', 'Spool ID', 'Product Type', 'Preform ID'].map(h => (
                          <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!viewData.bobbins || viewData.bobbins.length === 0) ? (
                        <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">No bobbins found</td></tr>
                      ) : viewData.bobbins.map((b, i) => (
                        <tr key={i} className="hover:bg-blue-50/20">
                          <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold border-r border-slate-100">{i + 1}</td>
                          <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{b.bobbin_no}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{b.fid || b.bobbin_fid || '—'}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-emerald-700 border-r border-slate-100">{b.length_km || b.fiber_length || '—'}</td>
                          <td className="px-3 py-1.5 text-xs text-slate-600 text-center border-r border-slate-100">{b.box_no || '—'}</td>
                          <td className="px-3 py-1.5 text-xs text-slate-600 text-center border-r border-slate-100">{b.stack_no || '—'}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{b.spool_id || '—'}</td>
                          <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{b.product_type || '—'}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-slate-500">{b.preform_id || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PACKING CREATE FORM - Original create flow
   ══════════════════════════════════════════════════════════ */
const PackingCreateForm = ({ onBack, onSaved }) => {
  /* ── State ── */
  const [orderNo, setOrderNo] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bobbinLengths, setBobbinLengths] = useState([{ length_km: '', quantity: '' }]);
  const [configDone, setConfigDone] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [bobbins, setBobbins] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const scanRef = useRef(null);

  /* ── Load Order ── */
  const handleLoadOrder = async () => {
    if (!orderNo.trim()) { showError('Enter order number'); return; }
    setLoading(true);
    try {
      const res = await getOrderByNo(orderNo.trim());
      if (res?.success && res.data) {
        // Check if already packed
        if (res.data.is_packed) {
          showError('This order is already packed. Cannot pack again.');
          setLoading(false);
          return;
        }
        setOrderData(res.data);
        setBobbinLengths([{ length_km: '', quantity: '' }]);
        setConfigDone(false);
        setBobbins([]);
      } else { showError(res?.message || 'Order not found'); }
    } catch (e) { showError(e?.response?.data?.message || 'Order not found'); }
    setLoading(false);
  };

  /* ── Bobbin length config ── */
  const addLengthRow = () => setBobbinLengths(prev => [...prev, { length_km: '', quantity: '' }]);
  const removeLengthRow = (idx) => setBobbinLengths(prev => prev.filter((_, i) => i !== idx));
  const updateLengthRow = (idx, field, val) => {
    setBobbinLengths(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const totalRequired = bobbinLengths.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);

  const confirmConfig = () => {
    if (bobbinLengths.some(r => !r.length_km || !r.quantity)) { showError('Fill all length/quantity rows'); return; }
    if (totalRequired === 0) { showError('Total bobbins must be > 0'); return; }
    setConfigDone(true);
    setTimeout(() => scanRef.current?.focus(), 100);
  };

  /* ── Scan bobbin ── */
  const handleScan = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    if (bobbins.some(b => b.bobbin_no === bobbin_no)) { showError('Already scanned'); setScanInput(''); return; }

    try {
      const res = await validateBobbinForPacking(bobbin_no, orderNo);
      if (!res?.success) { showError(res?.message || 'Validation failed'); setScanInput(''); return; }
      const data = res.data;
      setBobbins(prev => [...prev, { bobbin_no: data.bobbin_no, length_km: data.fiber_length }]);
      setScanInput('');
      setTimeout(() => scanRef.current?.focus(), 50);
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); setScanInput(''); }
  };

  /* ── Build boxes and stacks ── */
  const boxCapacity = orderData?.box_capacity || 1;
  const stackCapacity = orderData?.stack_capacity || 1;

  const boxes = [];
  for (let i = 0; i < Math.floor(bobbins.length / boxCapacity); i++) {
    boxes.push({
      box_no: i + 1,
      label: `${orderNo}-B-${i + 1}`,
      bobbins: bobbins.slice(i * boxCapacity, (i + 1) * boxCapacity),
    });
  }

  const stacks = [];
  for (let i = 0; i < Math.floor(boxes.length / stackCapacity); i++) {
    stacks.push({
      stack_no: i + 1,
      label: `${orderNo}-S-${i + 1}`,
      boxes: boxes.slice(i * stackCapacity, (i + 1) * stackCapacity),
    });
  }

  const isDone = bobbins.length >= totalRequired && totalRequired > 0;

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (bobbins.length === 0) { showError('No bobbins scanned'); return; }
    setSubmitting(true);
    try {
      const payload = {
        order_no: orderNo,
        bobbins: bobbins.map((b, idx) => {
          const boxIdx = Math.floor(idx / boxCapacity);
          const stackIdx = Math.floor(boxIdx / stackCapacity);
          return {
            bobbin_no: b.bobbin_no,
            length_km: b.length_km,
            box_no: boxIdx + 1,
            stack_no: stackIdx + 1,
          };
        }),
      };
      const res = await submitPackingList(payload);
      if (res?.success) { showSuccess(`Packing list saved! ${bobbins.length} bobbins packed.`); onSaved(); }
      else showError(res?.message || 'Submit failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  const fullReset = () => {
    setOrderNo(''); setOrderData(null); setBobbinLengths([{ length_km: '', quantity: '' }]);
    setConfigDone(false); setBobbins([]); setScanInput('');
  };

  const currentBoxBobbins = bobbins.length % boxCapacity;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Header ── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">New Packing List</h1>
              <p className="text-[9px] text-slate-400 mt-0.5">Scan bobbins → Auto-group into Boxes & Stacks</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ResetButton compact type="button" onClick={fullReset}>Reset</ResetButton>
            {configDone && (
              <SubmitButton compact type="button" disabled={submitting || bobbins.length === 0} onClick={handleSubmit}>
                {submitting ? 'Saving...' : `Save (${bobbins.length})`}
              </SubmitButton>
            )}
          </div>
        </div>

        {/* ── Config Section ── */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          {/* Row 1: Order load */}
          <div className="flex items-end gap-3 mb-3">
            <div className="w-48 flex flex-col gap-0.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Order No</label>
              <input value={orderNo} onChange={e => setOrderNo(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleLoadOrder(); }}
                placeholder="Enter order number..."
                className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <button type="button" onClick={handleLoadOrder} disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
              {loading ? 'Loading...' : 'Load Order'}
            </button>

            {/* Order info */}
            {orderData && (
              <div className="flex items-center gap-4 ml-3">
                {[['Customer', orderData.customer_name], ['Required KM', orderData.required_km], ['Box Cap', orderData.box_capacity], ['Stack Cap', orderData.stack_capacity]].map(([l, v]) => (
                  <div key={l} className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{l}</span>
                    <span className="text-xs font-bold text-slate-700">{v || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Bobbin length config */}
          {orderData && !configDone && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Bobbin Length Configuration</span>
                <button type="button" onClick={addLengthRow}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold rounded border border-blue-200 hover:bg-blue-100">
                  <Plus size={9} /> Add Row
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {bobbinLengths.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="number" step="0.01" value={row.length_km} onChange={e => updateLengthRow(idx, 'length_km', e.target.value)}
                      placeholder="Length (KM)" className="w-32 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-300" />
                    <input type="number" value={row.quantity} onChange={e => updateLengthRow(idx, 'quantity', e.target.value)}
                      placeholder="Qty" className="w-24 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-300" />
                    <span className="text-[9px] text-slate-400">bobbins</span>
                    {bobbinLengths.length > 1 && (
                      <button type="button" onClick={() => removeLengthRow(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={11} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                <span className="text-[9px] font-bold text-slate-600">Total Bobbins Required: <span className="text-blue-700">{totalRequired}</span></span>
                <button type="button" onClick={confirmConfig}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-700">Confirm & Start Scan</button>
              </div>
            </div>
          )}

          {/* Row 3: Scan + counters (after config confirmed) */}
          {configDone && (
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-indigo-600 uppercase">Scan Bobbin</label>
                <div className="flex gap-1.5">
                  <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
                    placeholder="Scan bobbin..." autoFocus disabled={isDone}
                    className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300 disabled:opacity-50" />
                  <button type="button" onClick={handleScan} disabled={isDone}
                    className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 disabled:opacity-50">
                    <Scan size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <StatCard label="Bobbins" value={bobbins.length} max={totalRequired} color="bg-blue-50 border-blue-200 text-blue-700" />
                <StatCard label="Boxes" value={boxes.length} max={Math.ceil(totalRequired / boxCapacity)} color="bg-indigo-50 border-indigo-200 text-indigo-700" />
                <StatCard label="Stacks" value={stacks.length} max={Math.ceil(Math.ceil(totalRequired / boxCapacity) / stackCapacity)} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
              </div>
              {currentBoxBobbins > 0 && (
                <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                  Box {boxes.length + 1} in progress ({currentBoxBobbins}/{boxCapacity})
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Tables: Boxes + Stacks ── */}
        {configDone && (
          <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 px-2 pb-2">
            {/* Box Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                <Box size={12} className="text-indigo-600" />
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Boxes</span>
                {boxes.length > 0 && <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{boxes.length}</span>}
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-10 border-r border-slate-100">Sr</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Box No</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase">Bobbins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boxes.length === 0 ? (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-[10px] text-slate-400">No boxes yet</td></tr>
                    ) : boxes.map((box) => (
                      <tr key={box.box_no} className="hover:bg-indigo-50/20">
                        <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">{box.box_no}</td>
                        <td className="px-2 py-1.5 text-xs font-mono font-bold text-indigo-700 border-r border-slate-100">{box.label}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-1">
                            {box.bobbins.map(b => (
                              <span key={b.bobbin_no} className="text-[7px] font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded">{b.bobbin_no}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stack Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                <Layers size={12} className="text-emerald-600" />
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Stacks</span>
                {stacks.length > 0 && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{stacks.length}</span>}
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-10 border-r border-slate-100">Sr</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Stack No</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase">Boxes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stacks.length === 0 ? (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-[10px] text-slate-400">No stacks yet</td></tr>
                    ) : stacks.map((stk) => (
                      <tr key={stk.stack_no} className="hover:bg-emerald-50/20">
                        <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">{stk.stack_no}</td>
                        <td className="px-2 py-1.5 text-xs font-mono font-bold text-emerald-700 border-r border-slate-100">{stk.label}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-1">
                            {stk.boxes.map(b => (
                              <span key={b.box_no} className="text-[7px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.5 rounded">{b.label}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Done popup */}
        {isDone && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">All Bobbins Scanned!</h3>
              <p className="text-xs text-slate-500 mb-4">
                {bobbins.length} bobbins · {boxes.length} boxes · {stacks.length} stacks
              </p>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all">
                {submitting ? 'Saving...' : 'Save Packing List'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PackingListGeneration;
