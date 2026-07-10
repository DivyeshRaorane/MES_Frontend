import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Grid3X3, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getTrays, getTrayPositions, assignBobbin, removeBobbin, searchBobbin } from '../services/modula.api';

/* ── Fill color by occupancy % ── */
const fillColor = (pct) => {
  if (pct === 0) return 'bg-slate-100 text-slate-400 border-slate-200';
  if (pct < 0.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (pct < 0.85) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

/* ══════════════════════════════════════════════════════════ */
const ModulaInOut = () => {
  const [trays, setTrays] = useState([]);
  const [selectedTrayId, setSelectedTrayId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posLoading, setPosLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // position_no
  const [scanInput, setScanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const scanRef = useRef(null);

  /* ── Load trays ── */
  const fetchTrays = async () => {
    setLoading(true);
    try { const res = await getTrays(); setTrays(res?.data || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { fetchTrays(); }, []);

  /* ── Load positions for selected tray ── */
  const fetchPositions = async (tray_id) => {
    setPosLoading(true);
    try { const res = await getTrayPositions(tray_id); setPositions(res?.data || []); }
    catch (_) { setPositions([]); }
    setPosLoading(false);
  };

  const handleTraySelect = (tray) => {
    setSelectedTrayId(tray.tray_id);
    setActiveSlot(null);
    setScanInput('');
    fetchPositions(tray.tray_id);
  };

  /* ── Assign bobbin to slot ── */
  const handleAssign = async () => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no || !activeSlot || !selectedTrayId) return;
    try {
      const res = await assignBobbin(selectedTrayId, activeSlot, bobbin_no);
      if (res?.success) {
        showSuccess(`Bobbin ${bobbin_no} placed at position ${activeSlot}`);
        setActiveSlot(null);
        setScanInput('');
        fetchPositions(selectedTrayId);
        fetchTrays(); // refresh counts
      } else { showError(res?.message || 'Assign failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Assign failed'); }
  };

  /* ── Remove bobbin from slot ── */
  const handleRemove = async (position_no) => {
    if (!selectedTrayId) return;
    try {
      const res = await removeBobbin(selectedTrayId, position_no);
      if (res?.success) {
        showSuccess('Bobbin removed');
        fetchPositions(selectedTrayId);
        fetchTrays();
      } else { showError(res?.message || 'Remove failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Remove failed'); }
  };

  /* ── Search ── */
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    try {
      const res = await searchBobbin(q);
      if (res?.success && res.data) {
        setSearchResult({ found: true, ...res.data });
        // Auto-select the tray
        if (res.data.tray_id) {
          setSelectedTrayId(res.data.tray_id);
          fetchPositions(res.data.tray_id);
        }
      } else {
        setSearchResult({ found: false, query: q });
      }
    } catch (e) { setSearchResult({ found: false, query: q }); }
  };

  const selectedTray = trays.find(t => t.tray_id === selectedTrayId);
  const occupied = positions.filter(p => p.status === 'OCCUPIED').length;
  const total = positions.length;

  return (
    <div className="h-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden m-2 gap-2">

        {/* ── Top bar ── */}
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
              className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">Search</button>
          </div>

          {searchResult && (
            <div className={`text-[9px] font-bold px-2 py-1 rounded-full ${
              searchResult.found ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {searchResult.found
                ? `Found in Tray ${searchResult.tray_no} · Position ${searchResult.position_no}`
                : `"${searchResult.query}" not found`}
            </div>
          )}
        </div>

        {/* ── Main: tray list + positions ── */}
        <div className="flex gap-2 flex-1 min-h-0">

          {/* ── Left: Tray list ── */}
          <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-800 px-3 py-2 flex-shrink-0">
              <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wider">Trays ({trays.length})</span>
            </div>
            <div className="overflow-y-auto flex-1 p-1.5 flex flex-col gap-1">
              {loading ? <div className="flex items-center justify-center py-8"><Loader2 size={14} className="text-blue-500 animate-spin" /></div> :
              trays.map(t => {
                const pct = t.total_positions > 0 ? (t.occupied_count || 0) / t.total_positions : 0;
                const isSelected = t.tray_id === selectedTrayId;
                return (
                  <button key={t.tray_id} type="button" onClick={() => handleTraySelect(t)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : `${fillColor(pct)} hover:border-blue-400 hover:shadow-sm`
                    }`}>
                    <div>
                      <span className={`text-[10px] font-bold block ${isSelected ? 'text-white' : ''}`}>Tray {t.tray_no}</span>
                      {t.tray_name && <span className={`text-[8px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{t.tray_name}</span>}
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/60 text-slate-600'
                    }`}>{t.occupied_count || 0}/{t.total_positions}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Position grid ── */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

            {selectedTray ? (
              <>
                {/* Tray header */}
                <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Package size={15} className="text-blue-400" />
                    <span className="text-sm font-bold text-white">Tray {selectedTray.tray_no}</span>
                    {selectedTray.tray_name && <span className="text-[9px] text-slate-400">({selectedTray.tray_name})</span>}
                    <span className="text-[9px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                      {occupied} occupied · {total - occupied} free
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${total > 0 ? (occupied / total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{total > 0 ? Math.round((occupied / total) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Scan bar for active slot */}
                {activeSlot && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3 flex-shrink-0">
                    <span className="text-[9px] font-bold text-blue-700 uppercase">Placing in Position {activeSlot}</span>
                    <input ref={scanRef} value={scanInput}
                      onChange={e => setScanInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAssign(); }}
                      placeholder="Scan bobbin ID..."
                      className="flex-1 max-w-xs bg-white border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/30" />
                    <button type="button" onClick={handleAssign}
                      className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700">Assign</button>
                    <button type="button" onClick={() => { setActiveSlot(null); setScanInput(''); }}
                      className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-300">Cancel</button>
                  </div>
                )}

                {/* Position grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {posLoading ? <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div> : (
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}>
                    {positions.map(pos => {
                      const isSearchHit = searchResult?.found && searchResult.tray_id === selectedTrayId && searchResult.position_no === pos.position_no;
                      const isActive = activeSlot === pos.position_no;

                      if (pos.status === 'OCCUPIED') {
                        return (
                          <div key={pos.tray_position_id}
                            className={`relative group flex flex-col items-center justify-center rounded-lg border p-1.5 min-h-[56px] transition-all ${
                              isSearchHit ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-400' : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
                            }`}>
                            <button type="button" onClick={() => handleRemove(pos.position_no)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-10">
                              <X size={9} />
                            </button>
                            <span className="text-[7px] text-slate-400 font-bold">{pos.position_no}</span>
                            <Package size={11} className="text-indigo-400 my-0.5" />
                            <span className="text-[6px] font-mono font-bold text-indigo-700 text-center leading-tight break-all">{pos.bobbin_no}</span>
                          </div>
                        );
                      }
                      return (
                        <button key={pos.tray_position_id} type="button"
                          onClick={() => { setActiveSlot(pos.position_no); setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); }}
                          className={`flex flex-col items-center justify-center rounded-lg border min-h-[56px] transition-all ${
                            isActive
                              ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 shadow-md'
                              : 'bg-slate-50 border-slate-200 border-dashed hover:bg-blue-50 hover:border-blue-300'
                          }`}>
                          <span className={`text-[8px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-300'}`}>{pos.position_no}</span>
                          <span className="text-[7px] text-slate-300">EMPTY</span>
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>

                {/* Legend */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center gap-4 flex-shrink-0">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Legend:</span>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200" /><span className="text-[8px] text-slate-500">Occupied</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-slate-50 border border-dashed border-slate-200" /><span className="text-[8px] text-slate-500">Empty</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" /><span className="text-[8px] text-slate-500">Active</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400" /><span className="text-[8px] text-slate-500">Search hit</span></div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-slate-400">Select a tray from the left to view positions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulaInOut;
