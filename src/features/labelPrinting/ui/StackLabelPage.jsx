import { Loader2, Search } from 'lucide-react';
import LabelRenderer from '../components/LabelRenderer';

/**
 * Stack sticker body (150×150 mm consignee address label, no barcodes).
 * Rendered inside BobbinBarcodePrinting when the sticker type is "Stack".
 * Printing is triggered by that page's header Print button.
 *
 * @param {object} props
 * @param {object} props.stack          Result of useStackLabels().
 * @param {React.ReactNode} props.stickerSelect  The shared sticker-type dropdown.
 */
const StackLabelPage = ({ stack, stickerSelect }) => {
  const { bobbinText, setBobbinText, parsed, labels, loading, error, warning, generate } = stack;
  const canGenerate = bobbinText.trim() !== '' && !loading;

  return (
    <>
    {/* Left: input + actions */}
    <div className="w-[460px] shrink-0 border-r border-slate-200 p-4 overflow-auto flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">{stickerSelect}</div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="stack-bobbin-numbers" className="text-[10px] font-bold text-slate-500 uppercase">
            Bobbin Numbers
          </label>
          <span className="text-[10px] text-slate-400" aria-live="polite">
            {parsed.length} detected
          </span>
        </div>
        <textarea
          id="stack-bobbin-numbers"
          value={bobbinText}
          onChange={(e) => setBobbinText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate) generate();
          }}
          rows={3}
          aria-describedby="stack-bobbin-hint"
          placeholder="Scan or paste bobbin numbers, comma separated&#10;e.g. SYE0706853, SYE0706854"
          className="px-2 py-1.5 text-xs rounded border border-slate-300 font-mono resize-y"
        />
        <span id="stack-bobbin-hint" className="text-[9px] text-slate-400">
          Separate with comma, space, or new line. Duplicates are ignored. Ctrl+Enter to fetch.
        </span>

        <button
          type="button"
          onClick={generate}
          disabled={!canGenerate}
          aria-busy={loading}
          className="mt-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {loading ? 'Fetching…' : 'Fetch'}
        </button>
      </div>

      {error && (
        <div role="alert" className="px-3 py-2 text-xs rounded border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {warning && (
        <div role="status" className="px-3 py-2 text-xs rounded border border-amber-300 bg-amber-50 text-amber-800">
          {warning}
        </div>
      )}

      {labels.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-500" role="status">
            {labels.length} stack label{labels.length > 1 ? 's' : ''} ready. Use Print (top right).
          </span>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-2 py-1 text-left font-bold">Bobbin</th>
                  <th className="px-2 py-1 text-left font-bold">Packing Order</th>
                  <th className="px-2 py-1 text-left font-bold">Customer</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((l) => (
                  <tr key={l.bobbin_no} className="border-t border-slate-100">
                    <td className="px-2 py-1 font-mono">{l.bobbin_no}</td>
                    <td className="px-2 py-1">{l.packing_order || '-'}</td>
                    <td className="px-2 py-1">{l.customer_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

    {/* Right: one 150 x 150 mm preview per fetched label */}
    <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-100 flex flex-col items-center gap-4">
      {labels.length === 0 ? (
        <div className="text-xs text-slate-400 mt-10">
          {loading ? 'Loading stack label data…' : 'Fetch bobbins to preview the stack sticker.'}
        </div>
      ) : (
        labels.map((l) => (
          <div key={l.bobbin_no} className="shrink-0 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Preview · 150 × 150 mm · {l.bobbin_no}
            </span>
            {/* zoom 3.78 px/mm = true on-screen size (1 mm = 3.78 CSS px at 96 dpi) */}
            <LabelRenderer templateKey="stack" data={l} zoom={3.78} />
          </div>
        ))
      )}
    </div>
    </>
  );
};

export default StackLabelPage;
