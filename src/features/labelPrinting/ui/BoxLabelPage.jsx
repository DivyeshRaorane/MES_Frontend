import { Loader2, Search } from 'lucide-react';
import { getTemplate } from '../core/templateRegistry';
import { BOX_LABEL_MAX_ROWS } from '../templates/boxLabelTemplate';
import '../templates'; // ensure templates are registered

/**
 * Box sticker body (left controls + right previews).
 * Rendered inside BobbinBarcodePrinting when the sticker type is "Box".
 * Printing is triggered by that page's header Print button.
 *
 * @param {object} props
 * @param {object} props.box            Result of useBoxLabels().
 * @param {React.ReactNode} props.stickerSelect  The shared sticker-type dropdown.
 */
const BoxLabelPage = ({ box, stickerSelect }) => {
  const { boxText, setBoxText, parsed, labels, loading, error, warning, generate } = box;
  const template = getTemplate('box');

  const tooLong = labels.filter((l) => l.bobbin_details.length > BOX_LABEL_MAX_ROWS);
  const canGenerate = boxText.trim() !== '' && !loading;

  return (
    <>
      {/* Left: input + actions */}
      <div className="w-[460px] border-r border-slate-200 p-4 overflow-auto flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">{stickerSelect}</div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="box-numbers" className="text-[10px] font-bold text-slate-500 uppercase">
              Box Numbers
            </label>
            <span className="text-[10px] text-slate-400" aria-live="polite">
              {parsed.valid.length} detected
            </span>
          </div>
          <textarea
            id="box-numbers"
            value={boxText}
            onChange={(e) => setBoxText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate) generate();
            }}
            rows={3}
            aria-describedby="box-numbers-hint"
            placeholder="Scan or paste box numbers, comma separated&#10;e.g. 22113124, 22113125"
            className="px-2 py-1.5 text-xs rounded border border-slate-300 font-mono resize-y"
          />
          <span id="box-numbers-hint" className="text-[9px] text-slate-400">
            Separate with comma, space, or new line. Duplicates are ignored. Ctrl+Enter to generate.
          </span>
          {parsed.invalid.length > 0 && (
            <span className="text-[10px] text-amber-600">
              Not a valid box number: {parsed.invalid.join(', ')}
            </span>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            aria-busy={loading}
            className="mt-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {labels.length > 0 && (
          <span className="text-[11px] text-slate-500" role="status">
            {labels.length} box label{labels.length > 1 ? 's' : ''} ready. Use Print (top right).
          </span>
        )}
      </div>

      {/* Right: alerts + one label per box */}
      <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-100 flex flex-col items-center gap-4">
        {loading && (
          <div role="status" className="text-xs text-slate-500">Loading box label data…</div>
        )}

        {error && (
          <div role="alert" className="w-full max-w-[420px] px-3 py-2 text-xs rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {warning && (
          <div role="status" className="w-full max-w-[420px] px-3 py-2 text-xs rounded border border-amber-300 bg-amber-50 text-amber-800">
            {warning}
          </div>
        )}

        {tooLong.length > 0 && (
          <div role="status" className="w-full max-w-[420px] px-3 py-2 text-xs rounded border border-amber-300 bg-amber-50 text-amber-800">
            Box {tooLong.map((l) => l.box_no).join(', ')} has more than {BOX_LABEL_MAX_ROWS} bobbins. Extra rows
            are cut off on the label (totals still count all bobbins).
          </div>
        )}

        {!loading && !error && labels.length === 0 && (
          <div className="text-xs text-slate-400 mt-10">Enter box numbers and click Generate to preview labels.</div>
        )}

        {labels.map((item, i) => (
          <div
            key={`${item.packing_order}-${item.stack_no}-${item.box_no}-${i}`}
            role="group"
            aria-label={`Label for box ${item.box_no}`}
            style={{
              width: '100mm',
              height: '150mm',
              flexShrink: 0,
              background: '#fff',
              overflow: 'hidden',
              boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
            }}
          >
            {template.render({ ...template.defaults, ...item })}
          </div>
        ))}
      </div>
    </>
  );
};

export default BoxLabelPage;
