import { useState, useRef, useEffect } from 'react';
import {
  Loader2, PackagePlus, ArrowRight, CircleCheck, CircleAlert, TriangleAlert, X, Plus,
} from 'lucide-react';
import { showSuccess } from '../../../../../utils/toastService';
import { addPreformStock, getEntryServiceErrorMessage } from '../services/entry_services.api';

/* ── helpers ─────────────────────────────────────────────── */

// Weight must be a plain positive decimal (no exponent, no sign, no spaces).
const WEIGHT_PATTERN = /^\d+(\.\d+)?$/;

const parseWeight = (raw) => {
  const text = String(raw ?? '').trim();
  if (!WEIGHT_PATTERN.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Up to 3 decimals, no trailing zeros, thousands separators.
const fmt = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 3 });
};

const fmtDelta = (prev, next) => {
  const p = Number(prev);
  const n = Number(next);
  if (prev == null || next == null || !Number.isFinite(p) || !Number.isFinite(n)) return null;
  const d = Math.round((n - p) * 1000) / 1000;
  return `${d > 0 ? '+' : ''}${fmt(d)}`;
};

const labelCls = 'font-bold text-slate-800 uppercase ml-0.5 text-[9px]';
const inputCls =
  'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60';

/* ══════════════════════════════════════════════════════════
   INCREASE STOCK TAB
   ══════════════════════════════════════════════════════════ */
const IncreaseStockTab = () => {
  const [preformId, setPreformId] = useState('');
  const [weight, setWeight] = useState('');
  const [touched, setTouched] = useState({ preformId: false, weight: false });
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Synchronous guard: state updates are async, so a fast double click could
  // otherwise fire two requests and add the stock twice.
  const inFlight = useRef(false);

  const trimmedId = preformId.trim();
  const weightNum = parseWeight(weight);
  const idError = touched.preformId && !trimmedId ? 'Preform ID is required' : '';
  const weightError =
    touched.weight && weightNum === null
      ? weight.trim() === ''
        ? 'Adding weight is required'
        : 'Enter a number greater than 0'
      : '';
  const isValid = !!trimmedId && weightNum !== null;

  // Close the confirm dialog on Escape (unless a request is running).
  useEffect(() => {
    if (!showConfirm) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !inFlight.current) setShowConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setTouched({ preformId: true, weight: true });
    if (!isValid || submitting) return;
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (inFlight.current || !isValid) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    try {
      const res = await addPreformStock({
        preform_id: trimmedId,
        adding_weight: weightNum,
      });
      if (res?.success) {
        setResult(res);
        setShowConfirm(false);
        showSuccess(res.message || 'Preform stock added successfully.');
      } else {
        // 200 without success flag: treat as failure, keep the form for retry.
        setShowConfirm(false);
        setError(res?.error || res?.message || 'Failed to add preform stock');
      }
    } catch (e) {
      // 401 is handled globally (axios interceptor → logout + redirect to login).
      setShowConfirm(false);
      setError(getEntryServiceErrorMessage(e, 'Failed to add preform stock'));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleAddMore = () => {
    setResult(null);
    setError('');
    setPreformId('');
    setWeight('');
    setTouched({ preformId: false, weight: false });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {!result && (
        <form onSubmit={handleOpenConfirm} noValidate
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-100">
              <PackagePlus size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Increase Preform Stock</p>
              <p className="text-[9px] text-slate-400">Add weight (KG) to an existing preform</p>
            </div>
          </div>

          {error && (
            <div role="alert"
              className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              <CircleAlert size={14} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold flex-1 break-words">{error}</p>
              <button type="button" onClick={() => setError('')} aria-label="Dismiss error"
                className="p-0.5 text-rose-400 hover:text-rose-700 rounded">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5">
              <label htmlFor="stock-add-preform-id" className={labelCls}>Preform ID *</label>
              <input id="stock-add-preform-id" value={preformId} autoFocus autoComplete="off"
                onChange={(e) => setPreformId(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, preformId: true }))}
                placeholder="e.g. P123" disabled={submitting}
                aria-invalid={!!idError} aria-describedby={idError ? 'stock-add-id-err' : undefined}
                className={inputCls} />
              {idError && <p id="stock-add-id-err" className="text-red-500 text-[8px]">{idError}</p>}
            </div>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="stock-add-weight" className={labelCls}>Adding Weight (KG) *</label>
              <input id="stock-add-weight" value={weight} inputMode="decimal" autoComplete="off"
                onChange={(e) => setWeight(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, weight: true }))}
                placeholder="e.g. 10" disabled={submitting}
                aria-invalid={!!weightError} aria-describedby={weightError ? 'stock-add-weight-err' : undefined}
                className={inputCls} />
              {weightError && <p id="stock-add-weight-err" className="text-red-500 text-[8px]">{weightError}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" disabled={!isValid || submitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all ${
                !isValid || submitting
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}>
              {submitting && <Loader2 size={12} className="animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {result && <ResultSection result={result} onAddMore={handleAddMore} />}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="stock-add-confirm-title"
            className="bg-white rounded-xl shadow-2xl w-80 text-center p-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PackagePlus size={18} className="text-indigo-600" />
            </div>
            <h3 id="stock-add-confirm-title" className="text-sm font-bold text-slate-800 mb-1">
              Add {fmt(weightNum)} KG to preform {trimmedId}?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This increases the stock. Submitting again will add it again.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowConfirm(false)} disabled={submitting}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting} autoFocus
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-bold ${
                  submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}>
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {submitting ? 'Adding...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   RESULT CARD + "WHAT WAS UPDATED"
   ══════════════════════════════════════════════════════════ */
const ChangeRow = ({ label, prev, next }) => {
  const delta = fmtDelta(prev, next);
  return (
    <div className="flex flex-col gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
      <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-mono font-semibold text-slate-500">{fmt(prev)}</span>
        <ArrowRight size={14} className="text-slate-400" />
        <span className="text-sm font-mono font-bold text-slate-800">{fmt(next)}</span>
        <span className="text-[10px] font-bold text-slate-400">KG</span>
        {delta && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};

const ResultSection = ({ result, onAddMore }) => {
  const drawEntries = Number(result.draw_entries_updated) || 0;
  const updates = [];
  if (result.preform_data_updated) updates.push('Preform data weight updated');
  if (result.preform_accept_updated) updates.push('Preform acceptance weight updated');
  if (drawEntries > 0) {
    updates.push(`Balance weight updated on ${drawEntries} draw ${drawEntries === 1 ? 'entry' : 'entries'}`);
  }

  return (
    <>
      <div className="bg-white border border-emerald-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CircleCheck size={18} className="text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 break-words">
              {result.message || 'Preform stock added successfully.'}
            </p>
            <p className="text-[9px] text-slate-400">
              Preform <span className="font-mono font-bold text-slate-600">{result.preform_id}</span>
              {' · '}Added {fmt(result.adding_weight)} KG
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChangeRow label="Qty" prev={result.previous_qty} next={result.new_qty} />
          <ChangeRow label="Balance Qty" prev={result.previous_balance_qty} next={result.new_balance_qty} />
        </div>

        {result.is_last_reset && (
          <div role="status"
            className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <TriangleAlert size={14} className="flex-shrink-0" />
            <span className="text-xs font-bold">Preform was fully drawn and has been reopened</span>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="button" onClick={onAddMore} autoFocus
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
            <Plus size={12} /> Add more
          </button>
        </div>
      </div>

      {updates.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">What was updated</p>
          <ul className="flex flex-col gap-1.5">
            {updates.map((u) => (
              <li key={u} className="flex items-center gap-2 text-xs text-slate-600">
                <CircleCheck size={12} className="text-emerald-500 flex-shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default IncreaseStockTab;
