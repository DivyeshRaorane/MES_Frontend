import React, { useState, useRef } from 'react';
import { Package, Scan, Plus, Box, Layers } from 'lucide-react';
import { ModuleCard, FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Dummy PO data ── */
const PO_DATA = {
  'PO-1001': { qty: 16, length: '450.000', colour: 'Blue',    customer: 'Precision Optics Ltd' },
  'PO-1002': { qty: 8,  length: '380.500', colour: 'Natural', customer: 'Fiber Tech Inc'       },
  'PO-1003': { qty: 24, length: '520.200', colour: 'Red',     customer: 'Global Cables Co'     },
};

let bobCounter = 1;
const dummyBobbin = () => `BOB-${String(bobCounter++).padStart(5,'0')}`;

/* ── Stat card ── */
const StatCard = ({ label, value, max, color }) => (
  <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${color} flex-1`}>
    <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-xl font-black font-mono">
      {value}{max != null ? <span className="text-sm font-bold opacity-50"> / {max}</span> : ''}
    </span>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const PackingListGeneration = () => {
  /* ── PO / config state ── */
  const [poNo,       setPoNo]       = useState('');
  const [poData,     setPoData]     = useState(null);
  const [boxContain, setBoxContain] = useState('');
  const [stackContain,setStackContain] = useState('');
  const [scanInput,  setScanInput]  = useState('');

  /* ── Scanning state ── */
  const [bobbins,    setBobbins]    = useState([]);   // all scanned bobbin IDs
  const [boxes,      setBoxes]      = useState([]);   // [{ boxNo, bobbins:[] }]
  const [stacks,     setStacks]     = useState([]);   // [{ stackNo, boxes:[] }]
  const [done,       setDone]       = useState(false);

  const scanRef = useRef(null);

  /* ── Load PO ── */
  const loadPO = () => {
    const d = PO_DATA[poNo.trim()];
    if (!d) { alert(`PO "${poNo}" not found. Try: PO-1001, PO-1002, PO-1003`); return; }
    setPoData(d);
    resetScan();
  };

  /* ── Reset scan data only ── */
  const resetScan = () => {
    setBobbins([]); setBoxes([]); setStacks([]); setDone(false); setScanInput('');
  };

  /* ── Full reset ── */
  const fullReset = () => {
    setPoNo(''); setPoData(null); setBoxContain(''); setStackContain('');
    resetScan();
  };

  /* ── Scan a bobbin ── */
  const scanBobbin = (id) => {
    const bid = id.trim();
    if (!bid) return;
    if (!poData) { alert('Load a PO first.'); return; }
    const bc = parseInt(boxContain);
    const sc = parseInt(stackContain);
    if (!bc || !sc) { alert('Set Box Contains and Stack Contains first.'); return; }
    if (done) { alert('Requirement already fulfilled. Reset to start again.'); return; }
    if (bobbins.includes(bid)) { alert(`Bobbin ${bid} already scanned.`); return; }

    const newBobbins = [...bobbins, bid];
    setBobbins(newBobbins);
    setScanInput('');

    /* ── Build boxes ── */
    const newBoxes = [];
    for (let i = 0; i < Math.floor(newBobbins.length / bc); i++) {
      newBoxes.push({
        boxNo:    `${poNo}-BOX-${i + 1}`,
        bobbins:  newBobbins.slice(i * bc, (i + 1) * bc),
      });
    }
    setBoxes(newBoxes);

    /* ── Build stacks ── */
    const newStacks = [];
    for (let i = 0; i < Math.floor(newBoxes.length / sc); i++) {
      newStacks.push({
        stackNo: `${poNo}-STK-${i + 1}`,
        boxes:   newBoxes.slice(i * sc, (i + 1) * sc).map(b => b.boxNo),
      });
    }
    setStacks(newStacks);

    /* ── Check completion ── */
    if (newBobbins.length >= poData.qty) setDone(true);

    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── Test scan ── */
  const testScan = () => scanBobbin(dummyBobbin());

  /* ── Submit ── */
  const handleSubmit = () => {
    if (bobbins.length === 0) { alert('No bobbins scanned.'); return; }
    console.log('Packing List Submit:', { poNo, poData, boxes, stacks });
    alert(`Packing list submitted!\n${boxes.length} boxes, ${stacks.length} stacks.`);
    fullReset();
  };

  /* ── Derived counts ── */
  const bc = parseInt(boxContain) || 0;
  const sc = parseInt(stackContain) || 0;
  const currentBoxBobbins = bc > 0 ? bobbins.length % bc : 0;
  const currentBoxNo      = boxes.length + (currentBoxBobbins > 0 ? 1 : 0);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

          {/* ── Config card ── */}
          <ModuleCard compact title="Packing List Generation" icon={<Package size={13} className="text-blue-600" />}>
            <div className="flex flex-col gap-2">

              {/* Row 1: PO + load */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-0.5 w-44">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Purchase Order No.</label>
                  <input value={poNo} onChange={e => setPoNo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadPO()}
                    placeholder="e.g. PO-1001"
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <button type="button" onClick={loadPO}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all h-[28px]">
                  Load PO
                </button>

                {/* PO details — auto-fetched */}
                {poData && (
                  <div className="flex items-center gap-3 ml-2 flex-wrap">
                    {[
                      { label: 'Customer',  val: poData.customer },
                      { label: 'Qty (Bobbins)', val: poData.qty },
                      { label: 'Length (km)',   val: poData.length },
                      { label: 'Colour',        val: poData.colour },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{label}</span>
                        <span className="text-xs font-bold text-slate-700">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Box / Stack config + Scan */}
              {poData && (
                <div className="flex items-end gap-3 pt-1 border-t border-slate-100">
                  <div className="flex flex-col gap-0.5 w-32">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Box Contains (bobbins)</label>
                    <input type="number" min="1" value={boxContain} onChange={e => setBoxContain(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                  </div>
                  <div className="flex flex-col gap-0.5 w-32">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Stack Contains (boxes)</label>
                    <input type="number" min="1" value={stackContain} onChange={e => setStackContain(e.target.value)}
                      placeholder="e.g. 16"
                      className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                  </div>

                  {/* Scan input */}
                  <div className="flex flex-col gap-0.5 flex-1 max-w-xs">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Scan Bobbin Barcode</label>
                    <div className="flex gap-1">
                      <input ref={scanRef} value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); scanBobbin(scanInput); } }}
                        placeholder="Scan bobbin..."
                        className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                      <button type="button" onClick={() => scanBobbin(scanInput)}
                        className="flex items-center gap-0.5 px-2 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded hover:bg-indigo-700 transition-all">
                        <Scan size={9} />
                      </button>
                      <button type="button" onClick={testScan}
                        className="flex items-center gap-0.5 px-2 py-1.5 bg-amber-500 text-white text-[8px] font-bold rounded hover:bg-amber-600 transition-all">
                        <Plus size={9} /> Test
                      </button>
                    </div>
                  </div>

                  {/* Live counters */}
                  <div className="flex gap-2 ml-auto">
                    <StatCard label="Bobbins" value={bobbins.length} max={poData?.qty}
                      color="bg-blue-50 border-blue-200 text-blue-700" />
                    <StatCard label="Boxes"   value={boxes.length}   max={bc && poData ? Math.ceil(poData.qty / bc) : null}
                      color="bg-indigo-50 border-indigo-200 text-indigo-700" />
                    <StatCard label="Stacks"  value={stacks.length}  max={bc && sc && poData ? Math.ceil(Math.ceil(poData.qty / bc) / sc) : null}
                      color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                  </div>
                </div>
              )}
            </div>
          </ModuleCard>

          {/* ── Two tables side by side ── */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">

            {/* Box Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                <Box size={12} className="text-indigo-600" />
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Box Details</span>
                {boxes.length > 0 && (
                  <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{boxes.length} boxes</span>
                )}
                {/* In-progress box indicator */}
                {bc > 0 && currentBoxBobbins > 0 && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
                    Box {currentBoxNo} in progress ({currentBoxBobbins}/{bc})
                  </span>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-10 border-r border-slate-100">Sr</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Box No</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase">Bobbin IDs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boxes.length === 0 ? (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-[10px] text-slate-400">No boxes formed yet</td></tr>
                    ) : boxes.map((box, i) => (
                      <tr key={box.boxNo} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">{i + 1}</td>
                        <td className="px-2 py-1.5 text-xs font-mono font-bold text-indigo-700 border-r border-slate-100 whitespace-nowrap">{box.boxNo}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-1">
                            {box.bobbins.map(b => (
                              <span key={b} className="text-[8px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{b}</span>
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
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Stack Details</span>
                {stacks.length > 0 && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{stacks.length} stacks</span>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase w-10 border-r border-slate-100">Sr</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Stack No</th>
                      <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase">Box Numbers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stacks.length === 0 ? (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-[10px] text-slate-400">No stacks formed yet</td></tr>
                    ) : stacks.map((stk, i) => (
                      <tr key={stk.stackNo} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">{i + 1}</td>
                        <td className="px-2 py-1.5 text-xs font-mono font-bold text-emerald-700 border-r border-slate-100 whitespace-nowrap">{stk.stackNo}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-1">
                            {stk.boxes.map(b => (
                              <span key={b} className="text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">{b}</span>
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

          {/* ── Actions ── */}
          <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
            <ResetButton compact type="button" onClick={fullReset}>Reset</ResetButton>
            <button type="button" onClick={handleSubmit}
              disabled={bobbins.length === 0}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                bobbins.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
              }`}>
              <Package size={12} />
              Submit Packing List
            </button>
          </div>

        </div>
      </div>

      {/* ── Requirement Done Popup ── */}
      {done && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Requirement Fulfilled!</h3>
            <p className="text-xs text-slate-500 mb-1">
              All <strong>{poData?.qty}</strong> bobbins scanned for <strong>{poNo}</strong>.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              <strong>{boxes.length}</strong> boxes · <strong>{stacks.length}</strong> stacks formed.
            </p>
            <button onClick={() => setDone(false)}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
              OK — Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingListGeneration;
