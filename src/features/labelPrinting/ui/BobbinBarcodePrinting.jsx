import { useMemo, useState } from 'react';
import { Barcode, Search, Printer } from 'lucide-react';
import LabelRenderer from '../components/LabelRenderer';
import { printLabel } from '../core/printEngine';
import { getTemplate } from '../core/templateRegistry';
import {
  getBobbinPatternOptions,
  getBobbinPattern,
  getManualKeysForPattern,
} from '../templates/bobbinPatterns';
import { fetchBobbinLabels, mapBobbinToLabel } from '../services/bobbin.api';
import { showError, showSuccess, showWarning } from '../../../utils/toastService';
import BoxLabelPage from './BoxLabelPage';
import { useBoxLabels } from './useBoxLabels';
import StackLabelPage from './StackLabelPage';
import { useStackLabels } from './useStackLabels';
import '../templates'; // ensure templates are registered

/* Sticker types — add more here later. */
const STICKER_TYPES = [
  { value: 'bobbin', label: 'Bobbin Sticker (40×40mm)' },
  { value: 'box', label: 'Box Sticker (100×150mm)' },
  { value: 'stack', label: 'Stack Sticker (150×150mm)' },
];

const PATTERN_OPTIONS = getBobbinPatternOptions();

/**
 * Quality Assurance → Barcode Printing.
 *
 * Flow:
 *  1. Pick sticker type (Bobbin).
 *  2. Pick parameter pattern (unique number sent to backend).
 *  3. Enter one or many bobbin numbers.
 *  4. If Pattern 3, a Part No field appears per bobbin (backend has no part_no).
 *  5. Fetch → backend returns data per bobbin for that pattern.
 *  6. Tick which fetched bobbins to print, set copies per bobbin.
 *  7. Print all selected (each repeated by its copy count).
 */
const BobbinBarcodePrinting = () => {
  const template = getTemplate('bobbin');

  const [stickerType, setStickerType] = useState('bobbin');
  const isBox = stickerType === 'box';
  const isStack = stickerType === 'stack';
  const box = useBoxLabels(); // Box sticker state (no pattern, one fixed layout)
  const stack = useStackLabels(); // Stack sticker state (consignee address, no barcodes)
  const [pattern, setPattern] = useState(1);

  // Single input: comma/newline/space separated bobbin numbers (scanner-friendly).
  const [bobbinText, setBobbinText] = useState('');

  // Fetched rows ready to print. Each: { ...labelData, _selected, _copies }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState([]);   // entered bobbins the backend didn't return
  const [fetchError, setFetchError] = useState(''); // inline error (like the Box page)

  const patternDef = getBobbinPattern(pattern);
  const needsPartNo = useMemo(
    () => getManualKeysForPattern(pattern).includes('part_no'),
    [pattern]
  );

  /** Split the single input into unique, trimmed bobbin numbers. */
  const parseBobbinNos = (text) =>
    [...new Set(
      text
        .split(/[\s,;\n\r\t]+/)   // comma, space, semicolon, newline, tab
        .map((s) => s.trim())
        .filter(Boolean)
    )];

  /* ── fetch ── */
  const handleFetch = async () => {
    const bobbinNos = parseBobbinNos(bobbinText);

    if (bobbinNos.length === 0) {
      showError('Enter at least one bobbin number');
      return;
    }

    setLoading(true);
    setFetchError('');
    setNotFound([]);
    setRows([]);
    try {
      const res = await fetchBobbinLabels(bobbinNos, pattern);
      const records = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);

      // Keep ONLY bobbins the backend returned; the rest are reported as not found.
      const found = [];
      const missing = [];
      bobbinNos.forEach((no) => {
        const rec = records.find((r) => String(r.bobbin_no ?? r.bobbinNo ?? '').trim() === no);
        if (!rec) {
          missing.push(no);
          return;
        }
        found.push({
          ...template.defaults,
          ...mapBobbinToLabel(rec),
          bobbin_no: no,
          pattern,
          part_no: '',          // user fills this in the table (Pattern 3 only)
          _selected: true,
          _copies: 1,
        });
      });

      setRows(found);
      setNotFound(missing);

      if (found.length === 0) {
        setFetchError(
          bobbinNos.length === 1
            ? `Bobbin not found: ${bobbinNos[0]}`
            : 'None of the entered bobbins were found'
        );
        return;
      }
      showSuccess(`Loaded ${found.length}/${bobbinNos.length} bobbin(s)`);
      if (needsPartNo) showWarning('Pattern 3: enter a Part No for each bobbin in the table');
    } catch (e) {
      // Show the real reason (server message / network) instead of a generic one.
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;
      setRows([]);
      if (status === 404) setFetchError('Bobbin not found');
      else if (status === 401) setFetchError('Session expired. Please log in again.');
      else setFetchError(serverMsg || e?.message || 'Fetch failed. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  /* ── row management ── */
  const setRow = (i, key, val) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const toggleAll = (checked) =>
    setRows((rs) => rs.map((r) => ({ ...r, _selected: checked })));

  const selectedRows = rows.filter((r) => r._selected);

  /* ── print ── */
  const handlePrint = async () => {
    if (isStack) {
      if (stack.labels.length === 0) {
        showError('Fetch at least one stack label to print');
        return;
      }
      try {
        // One 150x150 page per label; the print engine breaks pages per label.
        await printLabel('stack', stack.labels);
      } catch (err) {
        showError(err.message || 'Print failed');
      }
      return;
    }
    if (isBox) {
      if (box.labels.length === 0) {
        showError('Generate at least one box label to print');
        return;
      }
      try {
        // One 100x150 page per box; the print engine breaks pages per label.
        await printLabel('box', box.labels);
      } catch (err) {
        showError(err.message || 'Print failed');
      }
      return;
    }
    if (selectedRows.length === 0) {
      showError('Select at least one bobbin to print');
      return;
    }
    // Expand each selected row by its copy count into a flat list.
    const expanded = selectedRows.flatMap((r) =>
      Array.from({ length: Math.max(1, Number(r._copies) || 1) }, () => r)
    );
    try {
      await printLabel('bobbin', expanded);
    } catch (err) {
      showError(err.message || 'Print failed');
    }
  };

  const totalLabels = selectedRows.reduce(
    (sum, r) => sum + Math.max(1, Number(r._copies) || 1),
    0
  );

  /* preview the first selected row (or first row) */
  const previewRow = selectedRows[0] || rows[0];

  const printCount = isStack ? stack.labels.length : isBox ? box.labels.length : totalLabels;

  /* Shared by both sticker bodies */
  const stickerSelect = (
    <div className="flex flex-col gap-1">
      <label htmlFor="sticker-type" className="text-[10px] font-bold text-slate-500 uppercase">Sticker Type</label>
      <select
        id="sticker-type"
        value={stickerType}
        onChange={(e) => setStickerType(e.target.value)}
        className="px-2 py-1.5 text-xs rounded border border-slate-300"
      >
        {STICKER_TYPES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60">
          <span className="flex items-center gap-2 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
            <Barcode size={14} className="text-rose-600" /> Barcode Printing
          </span>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printCount === 0 || (!isBox && !isStack && selectedRows.length === 0)}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
          >
            <Printer size={13} /> Print {printCount > 0 ? `(${printCount})` : ''}
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {isStack ? (
            <StackLabelPage stack={stack} stickerSelect={stickerSelect} />
          ) : isBox ? (
            <BoxLabelPage box={box} stickerSelect={stickerSelect} />
          ) : (
          <>
          {/* Left: controls */}
          <div className="w-[460px] shrink-0 border-r border-slate-200 p-4 overflow-auto flex flex-col gap-3">

            {/* Sticker type + pattern */}
            <div className="grid grid-cols-2 gap-2">
              {stickerSelect}

              {stickerType === 'bobbin' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Pattern</label>
                  <select
                    value={pattern}
                    onChange={(e) => { setPattern(Number(e.target.value)); setRows([]); setNotFound([]); setFetchError(''); }}
                    className="px-2 py-1.5 text-xs rounded border border-slate-300"
                    title={patternDef.label}
                  >
                    {PATTERN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {stickerType === 'bobbin' && (
              <>
                {/* Bobbin numbers — single scanner-friendly input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Bobbin Numbers</label>
                    <span className="text-[10px] text-slate-400">
                      {parseBobbinNos(bobbinText).length} detected
                    </span>
                  </div>
                  <textarea
                    value={bobbinText}
                    onChange={(e) => setBobbinText(e.target.value)}
                    rows={3}
                    placeholder="Scan or paste bobbin numbers, comma separated&#10;e.g. SYE0706853, SYE0706854, SYE0706855"
                    className="px-2 py-1.5 text-xs rounded border border-slate-300 font-mono resize-y"
                  />
                  <span className="text-[9px] text-slate-400">
                    Separate with comma, space, or new line. Duplicates are ignored.
                  </span>

                  <button
                    type="button"
                    onClick={handleFetch}
                    disabled={loading}
                    className="mt-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-40"
                  >
                    <Search size={13} /> {loading ? 'Fetching…' : 'Fetch'}
                  </button>
                </div>

                {fetchError && (
                  <div role="alert" className="px-3 py-2 text-xs rounded border border-red-300 bg-red-50 text-red-700">
                    {fetchError}
                  </div>
                )}

                {notFound.length > 0 && rows.length > 0 && (
                  <div role="status" className="px-3 py-2 text-xs rounded border border-amber-300 bg-amber-50 text-amber-800">
                    Bobbin not found: {notFound.join(', ')}
                  </div>
                )}

                {/* Fetched rows: select + copies */}
                {rows.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rows.every((r) => r._selected)}
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        Select all
                      </label>
                      <span className="text-[10px] text-slate-400">{selectedRows.length}/{rows.length} selected</span>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="px-2 py-1 text-left font-bold">✓</th>
                            <th className="px-2 py-1 text-left font-bold">Bobbin</th>
                            {needsPartNo && <th className="px-2 py-1 text-left font-bold">Part No</th>}
                            <th className="px-2 py-1 text-center font-bold">Copies</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={r._selected}
                                  onChange={(e) => setRow(i, '_selected', e.target.checked)}
                                  className="accent-emerald-600"
                                />
                              </td>
                              <td className="px-2 py-1 font-mono">{r.bobbin_no}</td>
                              {needsPartNo && (
                                <td className="px-2 py-1">
                                  <input
                                    value={r.part_no}
                                    onChange={(e) => setRow(i, 'part_no', e.target.value)}
                                    placeholder="Part No"
                                    className="w-28 px-1 py-0.5 text-[11px] rounded border border-amber-300 bg-amber-50"
                                  />
                                </td>
                              )}
                              <td className="px-2 py-1 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={r._copies}
                                  onChange={(e) => setRow(i, '_copies', Math.max(1, Number(e.target.value) || 1))}
                                  className="w-14 px-1 py-0.5 text-center rounded border border-slate-300"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>


          {/* Right: live preview */}
          <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-100 flex flex-col items-center justify-start gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Preview · 40 × 40 mm {previewRow ? `· ${previewRow.bobbin_no}` : ''}
            </span>
            {previewRow
              ? <LabelRenderer templateKey="bobbin" data={previewRow} zoom={6} />
              : <div className="text-xs text-slate-400 mt-10">Fetch bobbins to preview the sticker.</div>}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BobbinBarcodePrinting;
