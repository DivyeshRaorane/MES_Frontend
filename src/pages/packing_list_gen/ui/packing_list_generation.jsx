import { useState, useRef, useEffect } from 'react';
import { Package, Scan, Box, Layers, Loader2, Plus, Trash2, ArrowLeft, Search, Eye, Edit3, X, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getOrderByNo, validateBobbinForPacking, submitPackingList, getAllPackingLists, viewPackingList, removeBobbinFromPacking, removeBoxFromPacking, addBobbinToPacking } from '../services/packing.api';

/* ── Stat card ── */
const StatCard = ({ label, value, max, color }) => (
  <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border ${color} flex-1`}>
    <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-lg font-black font-mono">
      {value}{max != null ? <span className="text-xs font-bold opacity-50">/{max}</span> : ''}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════
   PACKING EDIT MODAL - Stack → Box → Bobbin hierarchy with remove
   ══════════════════════════════════════════════════════════ */
const PackingEditModal = ({ orderNo, onClose, onUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // bobbin id being removed
  const [removingBox, setRemovingBox] = useState(null); // 'stackNo-boxNo'
  const [confirmRemove, setConfirmRemove] = useState(null); // { type: 'bobbin'|'box', id, label }
  const [expandedStacks, setExpandedStacks] = useState({});
  const [expandedBoxes, setExpandedBoxes] = useState({});
  const [addInput, setAddInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [targetStack, setTargetStack] = useState('');
  const [targetBox, setTargetBox] = useState('');
  const addRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await viewPackingList(orderNo);
      if (res?.success) {
        setData(res.data);
        // Auto-expand all stacks
        const stacks = {};
        const boxes = {};
        const bobbins = res.data?.bobbins || [];
        bobbins.forEach(b => {
          stacks[b.stack_no] = true;
          boxes[`${b.stack_no}-${b.box_no}`] = true;
        });
        setExpandedStacks(stacks);
        setExpandedBoxes(boxes);
      } else { showError(res?.message || 'Failed to load'); }
    } catch (e) { showError(e?.response?.data?.message || 'Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [orderNo]);

  // Group bobbins into stacks → boxes hierarchy
  const buildHierarchy = () => {
    if (!data?.bobbins) return [];
    const stackMap = {};
    data.bobbins.forEach(b => {
      const sKey = b.stack_no || '1';
      if (!stackMap[sKey]) stackMap[sKey] = {};
      const bKey = b.box_no || '1';
      if (!stackMap[sKey][bKey]) stackMap[sKey][bKey] = [];
      stackMap[sKey][bKey].push(b);
    });
    return Object.entries(stackMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([stackNo, boxes]) => ({
        stackNo,
        boxes: Object.entries(boxes)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([boxNo, bobbins]) => ({ boxNo, bobbins }))
      }));
  };

  const hierarchy = buildHierarchy();
  const totalBobbins = data?.bobbins?.length || 0;
  const totalBoxes = hierarchy.reduce((s, st) => s + st.boxes.length, 0);
  const totalStacks = hierarchy.length;

  const toggleStack = (sNo) => setExpandedStacks(prev => ({ ...prev, [sNo]: !prev[sNo] }));
  const toggleBox = (key) => setExpandedBoxes(prev => ({ ...prev, [key]: !prev[key] }));

  // Remove bobbin
  const handleRemoveBobbin = async (bobbin) => {
    const id = bobbin.packing_order_bobbin_id || bobbin.id || bobbin.bobbin_id;
    if (!id) {
      showError('Cannot remove: bobbin ID not found in response. Check backend viewPackingList query includes packing_order_bobbin_id.');
      setConfirmRemove(null);
      return;
    }
    setRemoving(id);
    try {
      const res = await removeBobbinFromPacking(id);
      if (res?.success) {
        showSuccess(`Bobbin ${bobbin.bobbin_no} removed`);
        await fetchData();
        onUpdated?.();
      } else { showError(res?.message || 'Remove failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Remove failed'); }
    setRemoving(null);
    setConfirmRemove(null);
  };

  // Remove box (all bobbins in box)
  const handleRemoveBox = async (stackNo, boxNo) => {
    const key = `${stackNo}-${boxNo}`;
    setRemovingBox(key);
    try {
      const res = await removeBoxFromPacking(orderNo, stackNo, boxNo);
      if (res?.success) {
        showSuccess(`Box ${boxNo} from Stack ${stackNo} removed`);
        await fetchData();
        onUpdated?.();
      } else { showError(res?.message || 'Remove failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Remove failed'); }
    setRemovingBox(null);
    setConfirmRemove(null);
  };

  // Add bobbin to packing
  const handleAddBobbin = async () => {
    const bobbin_no = addInput.trim();
    if (!bobbin_no) { showError('Enter or scan a bobbin number'); return; }
    if (!targetStack || !targetBox) { showError('Select target stack and box number'); return; }
    // Check if already in packing
    if (data?.bobbins?.some(b => b.bobbin_no === bobbin_no)) {
      showError('This bobbin is already in the packing list');
      setAddInput('');
      return;
    }
    setAdding(true);
    try {
      const res = await addBobbinToPacking({
        order_no: orderNo,
        bobbin_no,
        stack_no: targetStack,
        box_no: targetBox,
      });
      if (res?.success) {
        showSuccess(`Bobbin ${bobbin_no} added to Stack ${targetStack}, Box ${targetBox}`);
        setAddInput('');
        await fetchData();
        onUpdated?.();
        setTimeout(() => addRef.current?.focus(), 50);
      } else { showError(res?.message || 'Add failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Add failed'); }
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[80vw] max-w-[900px] max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Edit3 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Edit Packing List</h2>
              <p className="text-[9px] text-slate-400 mt-0.5">Add or remove bobbins from boxes</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg ml-2">{orderNo}</span>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Summary bar */}
        {data && !loading && (
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-4 flex-shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-1.5">
              <Layers size={11} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-600">Stacks: <span className="text-emerald-700">{totalStacks}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Box size={11} className="text-indigo-600" />
              <span className="text-[10px] font-bold text-slate-600">Boxes: <span className="text-indigo-700">{totalBoxes}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package size={11} className="text-blue-600" />
              <span className="text-[10px] font-bold text-slate-600">Bobbins: <span className="text-blue-700">{totalBobbins}</span></span>
            </div>
            {data.header?.customer_name && (
              <div className="ml-auto text-[10px] text-slate-500">
                Customer: <span className="font-bold text-slate-700">{data.header.customer_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Add Bobbin Section */}
        {data && !loading && (
          <div className="px-5 py-2.5 border-b border-slate-100 flex-shrink-0 bg-gradient-to-r from-green-50/40 to-emerald-50/30">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Scan size={12} className="text-emerald-600" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Add Bobbin</span>
              </div>
              <input
                ref={addRef}
                value={addInput}
                onChange={e => setAddInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBobbin(); } }}
                placeholder="Scan or type bobbin no..."
                className="w-44 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-[10px] font-mono outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-emerald-300"
              />
              <div className="flex items-center gap-1">
                <label className="text-[8px] font-bold text-slate-500">Stack:</label>
                <input
                  value={targetStack}
                  onChange={e => setTargetStack(e.target.value)}
                  placeholder="#"
                  className="w-12 bg-white border border-slate-200 rounded px-2 py-1.5 text-[10px] font-mono text-center outline-none focus:ring-1 focus:ring-emerald-200"
                />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-[8px] font-bold text-slate-500">Box:</label>
                <input
                  value={targetBox}
                  onChange={e => setTargetBox(e.target.value)}
                  placeholder="#"
                  className="w-12 bg-white border border-slate-200 rounded px-2 py-1.5 text-[10px] font-mono text-center outline-none focus:ring-1 focus:ring-emerald-200"
                />
              </div>
              <button type="button" onClick={handleAddBobbin} disabled={adding}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm">
                {adding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                Add
              </button>
            </div>
          </div>
        )}

        {/* Body - Hierarchy */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="ml-2 text-xs text-slate-500">Loading packing data...</span>
            </div>
          ) : hierarchy.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package size={32} className="mb-2 opacity-40" />
              <span className="text-xs">No bobbins remaining in this packing list</span>
            </div>
          ) : (
            <div className="space-y-3">
              {hierarchy.map(stack => (
                <div key={stack.stackNo} className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {/* Stack Header */}
                  <button type="button" onClick={() => toggleStack(stack.stackNo)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 flex items-center gap-3 hover:from-emerald-100 hover:to-emerald-100/70 transition-all">
                    {expandedStacks[stack.stackNo] ? <ChevronDown size={13} className="text-emerald-600" /> : <ChevronRight size={13} className="text-emerald-600" />}
                    <Layers size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-800">Stack {stack.stackNo}</span>
                    <span className="text-[9px] bg-emerald-200/60 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {stack.boxes.length} {stack.boxes.length === 1 ? 'box' : 'boxes'}
                    </span>
                    <span className="text-[9px] text-emerald-600 ml-auto font-mono">
                      {stack.boxes.reduce((s, b) => s + b.bobbins.length, 0)} bobbins
                    </span>
                  </button>

                  {/* Stack Expanded Content */}
                  {expandedStacks[stack.stackNo] && (
                    <div className="px-3 py-2 space-y-2">
                      {stack.boxes.map(box => {
                        const boxKey = `${stack.stackNo}-${box.boxNo}`;
                        const isBoxRemoving = removingBox === boxKey;
                        return (
                          <div key={boxKey} className="border border-indigo-100 rounded-lg overflow-hidden bg-indigo-50/20">
                            {/* Box Header */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50/80 to-indigo-50/30">
                              <button type="button" onClick={() => toggleBox(boxKey)} className="flex items-center gap-2 flex-1">
                                {expandedBoxes[boxKey] ? <ChevronDown size={11} className="text-indigo-500" /> : <ChevronRight size={11} className="text-indigo-500" />}
                                <Box size={12} className="text-indigo-500" />
                                <span className="text-[10px] font-bold text-indigo-700">Box {box.boxNo}</span>
                                <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                                  {box.bobbins.length} {box.bobbins.length === 1 ? 'bobbin' : 'bobbins'}
                                </span>
                              </button>
                              <button type="button"
                                onClick={() => setConfirmRemove({ type: 'box', stackNo: stack.stackNo, boxNo: box.boxNo, label: `Box ${box.boxNo} (Stack ${stack.stackNo})` })}
                                disabled={isBoxRemoving}
                                className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-bold rounded-md hover:bg-rose-100 hover:border-rose-300 transition-all disabled:opacity-50">
                                {isBoxRemoving ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />}
                                Remove Box
                              </button>
                            </div>

                            {/* Box Bobbins */}
                            {expandedBoxes[boxKey] && (
                              <div className="px-3 py-2">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-indigo-100">
                                      <th className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase w-8">#</th>
                                      <th className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase">Bobbin No</th>
                                      <th className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase">Length (KM)</th>
                                      <th className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase">FID</th>
                                      <th className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase w-20 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {box.bobbins.map((bobbin, bIdx) => {
                                      const isRemoving = removing === bobbin.packing_order_bobbin_id;
                                      return (
                                        <tr key={bobbin.packing_order_bobbin_id || bIdx} className="hover:bg-white/80 group transition-colors">
                                          <td className="px-2 py-1.5 text-[9px] text-slate-400 font-bold">{bIdx + 1}</td>
                                          <td className="px-2 py-1.5 text-[10px] font-mono font-bold text-blue-700">{bobbin.bobbin_no}</td>
                                          <td className="px-2 py-1.5 text-[10px] font-mono text-emerald-700">{bobbin.length_km || bobbin.fiber_length || '—'}</td>
                                          <td className="px-2 py-1.5 text-[10px] font-mono text-slate-500">{bobbin.fid || bobbin.bobbin_fid || '—'}</td>
                                          <td className="px-2 py-1.5 text-right">
                                            <button type="button"
                                              onClick={() => setConfirmRemove({ type: 'bobbin', bobbin, label: bobbin.bobbin_no })}
                                              disabled={isRemoving}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-500 border border-rose-200 text-[8px] font-bold rounded hover:bg-rose-100 hover:text-rose-700 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50">
                                              {isRemoving ? <Loader2 size={8} className="animate-spin" /> : <Trash2 size={8} />}
                                              Remove
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300 transition-all">
            Close
          </button>
        </div>
      </div>

      {/* Confirm Remove Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80 text-center border border-slate-200">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-rose-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Confirm Remove</h4>
            <p className="text-xs text-slate-500 mb-4">
              {confirmRemove.type === 'bobbin'
                ? <>Are you sure you want to remove bobbin <span className="font-bold text-blue-700">{confirmRemove.label}</span> from this box?</>
                : <>Are you sure you want to remove <span className="font-bold text-indigo-700">{confirmRemove.label}</span> and all its bobbins?</>
              }
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmRemove(null)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="button"
                onClick={() => {
                  if (confirmRemove.type === 'bobbin') handleRemoveBobbin(confirmRemove.bobbin);
                  else handleRemoveBox(confirmRemove.stackNo, confirmRemove.boxNo);
                }}
                className="flex-1 px-3 py-2 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-all">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [editOrderNo, setEditOrderNo] = useState(null); // order_no being edited

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await getAllPackingLists();
      setLists(res?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

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
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleView(item.order_no || item.packing_order)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold rounded hover:bg-blue-100 transition-all">
                          <Eye size={9} /> View
                        </button>
                        <button type="button" onClick={() => setEditOrderNo(item.order_no || item.packing_order)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit3 size={9} /> Edit
                        </button>
                      </div>
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

      {/* ── Edit Modal ── */}
      {editOrderNo && (
        <PackingEditModal
          orderNo={editOrderNo}
          onClose={() => setEditOrderNo(null)}
          onUpdated={fetchLists}
        />
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
