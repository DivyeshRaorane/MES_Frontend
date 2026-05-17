import React, { useState, useRef } from 'react';
import { Search, X, Save, Package, Grid3X3 } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Constants ── */
const TOTAL_TRAYS   = 36;
const ROWS_PER_TRAY = 3;
const COLS_PER_ROW  = 22;
const SLOTS_PER_TRAY = ROWS_PER_TRAY * COLS_PER_ROW; // 66

/* ── Build initial tray state ── */
const buildInitialTrays = () =>
  Array.from({ length: TOTAL_TRAYS }, (_, ti) => ({
    id:    ti + 1,
    label: `Tray ${String(ti + 1).padStart(2, '0')}`,
    rows:  Array.from({ length: ROWS_PER_TRAY }, (_, ri) => ({
      id:    ri + 1,
      label: `Row ${ri + 1}`,
      slots: Array.from({ length: COLS_PER_ROW }, (_, si) => ({
        id:      si + 1,
        bobbin:  null,   // null = empty, string = bobbin ID
      })),
    })),
  }));

/* ── Seed some dummy bobbins for visual testing ── */
const seedDummy = (trays) => {
  const t = JSON.parse(JSON.stringify(trays));
  const dummies = ['BOB-00001','BOB-00002','BOB-00003','BOB-00004','BOB-00005',
                   'BOB-00006','BOB-00007','BOB-00008'];
  dummies.forEach((b, i) => {
    const row = Math.floor(i / COLS_PER_ROW);
    const col = i % COLS_PER_ROW;
    if (t[0].rows[row]?.slots[col]) t[0].rows[row].slots[col].bobbin = b;
  });
  return t;
};

/* ── Count occupied slots in a tray ── */
const countOccupied = (tray) =>
  tray.rows.reduce((sum, r) => sum + r.slots.filter(s => s.bobbin).length, 0);

/* ── Fill % colour ── */
const fillColor = (pct) => {
  if (pct === 0)   return 'bg-slate-100 text-slate-400 border-slate-200';
  if (pct < 0.5)   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (pct < 0.85)  return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

/* ══════════════════════════════════════════════════════════ */
const ModulaInOut = () => {
  const [trays,        setTrays]        = useState(() => seedDummy(buildInitialTrays()));
  const [selectedTray, setSelectedTray] = useState(0);   // index
  const [activeSlot,   setActiveSlot]   = useState(null); // { rowIdx, slotIdx }
  const [scanInput,    setScanInput]    = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [saved,        setSaved]        = useState(false);
  const scanRef = useRef(null);

  const tray = trays[selectedTray];

  /* ── Search bobbin across all trays ── */
  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    for (let ti = 0; ti < trays.length; ti++) {
      for (let ri = 0; ri < trays[ti].rows.length; ri++) {
        for (let si = 0; si < trays[ti].rows[ri].slots.length; si++) {
          if (trays[ti].rows[ri].slots[si].bobbin === q) {
            setSearchResult({ trayIdx: ti, rowIdx: ri, slotIdx: si, trayLabel: trays[ti].label });
            setSelectedTray(ti);
            return;
          }
        }
      }
    }
    setSearchResult({ notFound: true, query: q });
  };

  /* ── Click empty slot → focus scan input ── */
  const handleSlotClick = (rowIdx, slotIdx) => {
    const slot = tray.rows[rowIdx].slots[slotIdx];
    if (slot.bobbin) return; // occupied — use remove button
    setActiveSlot({ rowIdx, slotIdx });
    setScanInput('');
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── Assign bobbin to active slot ── */
  const assignBobbin = () => {
    const bid = scanInput.trim();
    if (!bid || !activeSlot) return;
    // Check duplicate across all trays
    for (const t of trays) {
      for (const r of t.rows) {
        if (r.slots.some(s => s.bobbin === bid)) {
          alert(`Bobbin ${bid} is already placed in ${t.label}.`);
          return;
        }
      }
    }
    const next = JSON.parse(JSON.stringify(trays));
    next[selectedTray].rows[activeSlot.rowIdx].slots[activeSlot.slotIdx].bobbin = bid;
    setTrays(next);
    setScanInput('');
    setActiveSlot(null);
    setSaved(false);
  };

  /* ── Remove bobbin from slot ── */
  const removeBobbin = (rowIdx, slotIdx) => {
    const next = JSON.parse(JSON.stringify(trays));
    next[selectedTray].rows[rowIdx].slots[slotIdx].bobbin = null;
    setTrays(next);
    setSaved(false);
    if (activeSlot?.rowIdx === rowIdx && activeSlot?.slotIdx === slotIdx) setActiveSlot(null);
  };

  /* ── Save ── */
  const handleSave = () => {
    console.log('Modula Save:', trays);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const occupied = countOccupied(tray);
  const free     = SLOTS_PER_TRAY - occupied;

  return (
    <div className="h-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden m-2 gap-2">

        {/* ── Top bar: search + save ── */}
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2 flex-shrink-0">
          <Grid3X3 size={16} className="text-blue-600 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex-shrink-0">Modula In / Out</span>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search bobbin ID..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <button type="button" onClick={handleSearch}
              className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
              Search
            </button>
          </div>

          {/* Search result */}
          {searchResult && (
            <div className={`text-[9px] font-bold px-2 py-1 rounded-full ${
              searchResult.notFound
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {searchResult.notFound
                ? `"${searchResult.query}" not found`
                : `Found in ${searchResult.trayLabel} · Row ${searchResult.rowIdx + 1} · Slot ${searchResult.slotIdx + 1}`}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {saved && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">✓ Saved</span>}
            <button type="button" onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-700 transition-all">
              <Save size={11} /> Save
            </button>
          </div>
        </div>

        {/* ── Main area: tray list + tray diagram ── */}
        <div className="flex gap-2 flex-1 min-h-0">

          {/* ── Left: Tray list ── */}
          <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-800 px-3 py-2 flex-shrink-0">
              <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wider">
                Trays ({TOTAL_TRAYS})
              </span>
            </div>
            <div className="overflow-y-auto flex-1 p-1.5 flex flex-col gap-1">
              {trays.map((t, idx) => {
                const occ  = countOccupied(t);
                const pct  = occ / SLOTS_PER_TRAY;
                const isSelected = idx === selectedTray;
                return (
                  <button key={t.id} type="button" onClick={() => { setSelectedTray(idx); setActiveSlot(null); setScanInput(''); }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : `${fillColor(pct)} hover:border-blue-400 hover:shadow-sm`
                    }`}>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : ''}`}>{t.label}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/60 text-slate-600'
                    }`}>
                      {occ}/{SLOTS_PER_TRAY}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Tray diagram ── */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

            {/* Tray header */}
            <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Package size={15} className="text-blue-400" />
                <span className="text-sm font-bold text-white">{tray.label}</span>
                <span className="text-[9px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                  {occupied} occupied · {free} free
                </span>
              </div>
              {/* Fill bar */}
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all"
                    style={{ width: `${(occupied / SLOTS_PER_TRAY) * 100}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {Math.round((occupied / SLOTS_PER_TRAY) * 100)}%
                </span>
              </div>
            </div>

            {/* Scan input for active slot */}
            {activeSlot && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3 flex-shrink-0">
                <span className="text-[9px] font-bold text-blue-700 uppercase">
                  Placing in Row {activeSlot.rowIdx + 1} · Slot {activeSlot.slotIdx + 1}
                </span>
                <input ref={scanRef} value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') assignBobbin(); }}
                  placeholder="Scan or type bobbin ID..."
                  className="flex-1 max-w-xs bg-white border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/30" />
                <button type="button" onClick={assignBobbin}
                  className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                  Assign
                </button>
                <button type="button" onClick={() => { setActiveSlot(null); setScanInput(''); }}
                  className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-300 transition-all">
                  Cancel
                </button>
              </div>
            )}

            {/* Tray rows */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {tray.rows.map((row, rowIdx) => {
                const rowOcc  = row.slots.filter(s => s.bobbin).length;
                const rowFree = COLS_PER_ROW - rowOcc;
                return (
                  <div key={row.id}>
                    {/* Row label */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{row.label}</span>
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-[8px] text-slate-400 font-medium">{rowOcc} used · {rowFree} free</span>
                    </div>

                    {/* Slot grid */}
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS_PER_ROW}, minmax(0, 1fr))` }}>
                      {row.slots.map((slot, slotIdx) => {
                        const isActive = activeSlot?.rowIdx === rowIdx && activeSlot?.slotIdx === slotIdx;
                        const isSearchHit = searchResult && !searchResult.notFound &&
                          searchResult.trayIdx === selectedTray &&
                          searchResult.rowIdx === rowIdx &&
                          searchResult.slotIdx === slotIdx;

                        if (slot.bobbin) {
                          /* ── Occupied slot ── */
                          return (
                            <div key={slot.id}
                              className={`relative group flex flex-col items-center justify-center rounded-lg border p-1 min-h-[52px] transition-all ${
                                isSearchHit
                                  ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-400'
                                  : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
                              }`}>
                              {/* Remove button */}
                              <button type="button" onClick={() => removeBobbin(rowIdx, slotIdx)}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-10">
                                <X size={9} />
                              </button>
                              <Package size={12} className="text-indigo-400 mb-0.5" />
                              <span className="text-[7px] font-bold text-indigo-700 text-center leading-tight break-all">
                                {slot.bobbin}
                              </span>
                            </div>
                          );
                        } else {
                          /* ── Empty slot ── */
                          return (
                            <button key={slot.id} type="button"
                              onClick={() => handleSlotClick(rowIdx, slotIdx)}
                              className={`flex flex-col items-center justify-center rounded-lg border min-h-[52px] transition-all ${
                                isActive
                                  ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 shadow-md'
                                  : 'bg-slate-50 border-slate-200 border-dashed hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                              }`}>
                              <span className={`text-[8px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-300'}`}>
                                {slotIdx + 1}
                              </span>
                            </button>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center gap-4 flex-shrink-0">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200" />
                <span className="text-[8px] text-slate-500">Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-50 border border-dashed border-slate-200" />
                <span className="text-[8px] text-slate-500">Empty (click to place)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" />
                <span className="text-[8px] text-slate-500">Active slot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400" />
                <span className="text-[8px] text-slate-500">Search result</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModulaInOut;
