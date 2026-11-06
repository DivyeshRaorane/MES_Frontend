import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Grid3X3, Loader2, Download, Upload, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { showSuccess, showError } from '../../../utils/toastService';
import { getTrays, getTrayPositions, assignBobbin, removeBobbin, searchBobbin } from '../services/modula.api';

const BOBBIN_LEN = 10;

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
  const submittingRef = useRef(false);
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [importSummary, setImportSummary] = useState(null); // { rows, trayNo }

  /* ── Load trays ── */
  const fetchTrays = async () => {
    setLoading(true);
    try { const res = await getTrays(); setTrays(res?.data || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { fetchTrays(); }, []);

  /* ── Load positions for selected tray ── */
  const fetchPositions = async (tray_id, silent = false) => {
    if (!silent) setPosLoading(true);
    let list = [];
    try { const res = await getTrayPositions(tray_id); list = res?.data || []; }
    catch (_) { list = []; }
    setPositions(list);
    if (!silent) setPosLoading(false);
    return list;
  };

  /* Focus scan input whenever a slot becomes active */
  useEffect(() => {
    if (activeSlot !== null) scanRef.current?.focus();
  }, [activeSlot]);

  /* Next EMPTY slot after the given position (by position number) */
  /* Uses grid (array) order, so it works even if position_no is not numeric */
  const findNextEmpty = (list, currentPos) => {
    const idx = list.findIndex(p => String(p.position_no) === String(currentPos));
    if (idx === -1) return null;
    return list.slice(idx + 1).find(p => p.status !== 'OCCUPIED') || null;
  };

  const handleTraySelect = (tray) => {
    setSelectedTrayId(tray.tray_id);
    setActiveSlot(null);
    setScanInput('');
    fetchPositions(tray.tray_id);
  };

  /* ── Assign bobbin to slot ── */
  const handleAssign = async (value) => {
    const bobbin_no = (value ?? scanInput).trim();
    if (!bobbin_no || activeSlot === null || !selectedTrayId) return;
    if (bobbin_no.length !== BOBBIN_LEN) {
      showError(`Bobbin ID must be ${BOBBIN_LEN} characters`);
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    const currentSlot = activeSlot;
    try {
      const res = await assignBobbin(selectedTrayId, currentSlot, bobbin_no);
      if (res?.success) {
        showSuccess(`Bobbin ${bobbin_no} placed at position ${currentSlot}`);
        setScanInput('');
        // Pick the next slot from the grid already on screen, so advancing
        // doesn't depend on the refetch response.
        const next = findNextEmpty(positions, currentSlot);
        if (next) setActiveSlot(next.position_no);
        fetchPositions(selectedTrayId, true); // sync grid with server
        fetchTrays(); // refresh counts
        if (!next) { setActiveSlot(null); showSuccess('No more empty positions in this tray'); }
      } else {
        showError(res?.message || 'Assign failed');
        setScanInput('');
        scanRef.current?.focus();
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Assign failed');
      setScanInput('');
      scanRef.current?.focus();
    } finally {
      submittingRef.current = false;
    }
  };

  /* Auto-assign as soon as the full bobbin ID is entered */
  const handleScanChange = (e) => {
    const value = e.target.value.slice(0, BOBBIN_LEN);
    setScanInput(value);
    if (value.trim().length === BOBBIN_LEN) handleAssign(value);
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

  /* ── Excel: download template of EMPTY positions for the selected tray ── */
  const handleDownloadTemplate = () => {
    if (!selectedTray) return;
    const empty = positions.filter(p => p.status !== 'OCCUPIED');
    if (empty.length === 0) { showError('No empty positions in this tray'); return; }

    const aoa = [['Position', 'Bobbin No'], ...empty.map(p => [p.position_no, ''])];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Force Bobbin No column to text so leading zeros are kept
    empty.forEach((_, i) => { ws[`B${i + 2}`] = { t: 's', v: '', z: '@' }; });
    ws['!cols'] = [{ wch: 12 }, { wch: 24 }];

    const info = XLSX.utils.aoa_to_sheet([
      ['Tray No', selectedTray.tray_no],
      ['Note', 'Fill Bobbin No next to each Position in the first sheet. Do not change the Position column.'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.utils.book_append_sheet(wb, info, 'Info');
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([out], { type: 'application/octet-stream' }), `Modula_Tray_${selectedTray.tray_no}_Template.xlsx`);
  };

  /* ── Excel: import and assign one by one ── */
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedTray || importing) return;

    let sheetRows;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      // Make sure the file belongs to the selected tray
      const infoSheet = wb.Sheets['Info'];
      if (infoSheet) {
        const trayNoInFile = String(infoSheet['B1']?.v ?? '').trim();
        if (trayNoInFile && trayNoInFile !== String(selectedTray.tray_no)) {
          showError(`This file is for Tray ${trayNoInFile}, but Tray ${selectedTray.tray_no} is selected`);
          return;
        }
      }
      const ws = wb.Sheets['Template'] || wb.Sheets[wb.SheetNames[0]];
      sheetRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
    } catch {
      showError('Could not read the Excel file');
      return;
    }

    const dataRows = sheetRows.slice(1)
      .map((r, i) => ({ line: i + 2, position_no: String(r[0] ?? '').trim(), bobbin_no: String(r[1] ?? '').trim() }))
      .filter(r => r.position_no || r.bobbin_no);
    if (dataRows.length === 0) { showError('No data rows found in the file'); return; }

    const posMap = new Map(positions.map(p => [String(p.position_no), p]));
    const seen = new Map(); // bobbin_no -> first line
    const results = [];

    setImporting(true);
    setImportProgress({ done: 0, total: dataRows.length });

    for (let i = 0; i < dataRows.length; i++) {
      const { line, position_no, bobbin_no } = dataRows[i];
      const row = { line, position_no, bobbin_no, status: 'FAILED', reason: '' };

      if (!bobbin_no) { row.status = 'SKIPPED'; row.reason = 'Bobbin No is empty'; }
      else if (!position_no) { row.reason = 'Position is missing'; }
      else if (!posMap.has(position_no)) { row.reason = `Position ${position_no} not found in Tray ${selectedTray.tray_no}`; }
      else if (posMap.get(position_no).status === 'OCCUPIED') { row.reason = `Position ${position_no} is already occupied`; }
      else if (bobbin_no.length !== BOBBIN_LEN) { row.reason = `Bobbin No must be ${BOBBIN_LEN} characters (got ${bobbin_no.length})`; }
      else if (seen.has(bobbin_no)) { row.reason = `Duplicate bobbin in file (also on row ${seen.get(bobbin_no)})`; }
      else {
        seen.set(bobbin_no, line);
        try {
          const res = await assignBobbin(selectedTray.tray_id, posMap.get(position_no).position_no, bobbin_no);
          if (res?.success) { row.status = 'SUCCESS'; row.reason = 'Assigned'; }
          else row.reason = res?.message || 'Assign failed';
        } catch (err) {
          row.reason = err?.response?.data?.message || 'Assign failed';
        }
      }
      results.push(row);
      setImportProgress({ done: i + 1, total: dataRows.length });
    }

    setImporting(false);
    setImportSummary({ rows: results, trayNo: selectedTray.tray_no });
    setActiveSlot(null);
    fetchPositions(selectedTray.tray_id, true);
    fetchTrays();
  };

  const handleDownloadSummary = () => {
    if (!importSummary) return;
    const aoa = [['Row', 'Position', 'Bobbin No', 'Status', 'Reason'],
      ...importSummary.rows.map(r => [r.line, r.position_no, r.bobbin_no, r.status, r.reason])];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Import Result');
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([out], { type: 'application/octet-stream' }), `Modula_Tray_${importSummary.trayNo}_Import_Result.xlsx`);
  };
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

          {/* Excel automation */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button type="button" onClick={handleDownloadTemplate} disabled={!selectedTray || posLoading || importing}
              title={selectedTray ? 'Download Excel template of empty positions' : 'Select a tray first'}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Download size={11} /> Excel Template
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={!selectedTray || posLoading || importing}
              title={selectedTray ? 'Import filled Excel and assign bobbins' : 'Select a tray first'}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {importing ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
              {importing ? `Importing ${importProgress.done}/${importProgress.total}` : 'Import Excel'}
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
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
                {activeSlot !== null && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3 flex-shrink-0">
                    <span className="text-[9px] font-bold text-blue-700 uppercase">Placing in Position {activeSlot}</span>
                    <input ref={scanRef} value={scanInput}
                      onChange={handleScanChange}
                      maxLength={BOBBIN_LEN}
                      placeholder={`Scan bobbin ID (${BOBBIN_LEN} characters)...`}
                      className="flex-1 max-w-xs bg-white border border-blue-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/30" />
                    <span className="text-[9px] text-blue-500 font-mono">{scanInput.length}/{BOBBIN_LEN}</span>
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
                          onClick={() => { setActiveSlot(pos.position_no); setScanInput(''); scanRef.current?.focus(); }}
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

      {/* ── Import summary modal ── */}
      {importSummary && (() => {
        const ok = importSummary.rows.filter(r => r.status === 'SUCCESS').length;
        const failed = importSummary.rows.filter(r => r.status === 'FAILED').length;
        const skipped = importSummary.rows.filter(r => r.status === 'SKIPPED').length;
        return (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Import summary">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <span className="text-sm font-bold text-white">Import Summary · Tray {importSummary.trayNo}</span>
                <button type="button" onClick={() => setImportSummary(null)} aria-label="Close" className="text-slate-300 hover:text-white"><X size={16} /></button>
              </div>
              <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-200 flex-shrink-0">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Success: {ok}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">Failed: {failed}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Skipped: {skipped}</span>
                <span className="text-xs text-slate-500 ml-auto">Total: {importSummary.rows.length}</span>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-left text-slate-500">
                      <th className="px-3 py-2 font-bold">Row</th>
                      <th className="px-3 py-2 font-bold">Position</th>
                      <th className="px-3 py-2 font-bold">Bobbin No</th>
                      <th className="px-3 py-2 font-bold">Status</th>
                      <th className="px-3 py-2 font-bold">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importSummary.rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-1.5 text-slate-400">{r.line}</td>
                        <td className="px-3 py-1.5 font-semibold">{r.position_no}</td>
                        <td className="px-3 py-1.5 font-mono">{r.bobbin_no}</td>
                        <td className="px-3 py-1.5">
                          {r.status === 'SUCCESS' && <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 size={12} /> Success</span>}
                          {r.status === 'FAILED' && <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><XCircle size={12} /> Failed</span>}
                          {r.status === 'SKIPPED' && <span className="inline-flex items-center gap-1 text-slate-500 font-bold"><MinusCircle size={12} /> Skipped</span>}
                        </td>
                        <td className={`px-3 py-1.5 ${r.status === 'FAILED' ? 'text-rose-600' : 'text-slate-500'}`}>{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
                <button type="button" onClick={handleDownloadSummary}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-300">Download Result</button>
                <button type="button" onClick={() => setImportSummary(null)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ModulaInOut;
