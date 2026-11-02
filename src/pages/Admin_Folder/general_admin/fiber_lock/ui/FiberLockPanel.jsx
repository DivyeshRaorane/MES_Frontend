import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Lock, Unlock, Loader2, AlertCircle, AlertTriangle, Copy, Check, CheckCircle2,
} from 'lucide-react';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import { lockFiber, unlockFiber, getFiberLockErrorMessage } from '../services/fiber_lock.api';

/* Level on which the lock / unlock is applied */
const LEVEL_OPTIONS = [
  { value: 'preform', label: 'Preform', idLabel: 'Preform ID', placeholder: 'e.g. P123' },
  { value: 'spool', label: 'Spool', idLabel: 'Spool ID', placeholder: 'e.g. S1' },
  { value: 'bobbin', label: 'Bobbin', idLabel: 'Bobbin No', placeholder: 'e.g. B1' },
];

const LEVEL_BY_VALUE = Object.fromEntries(LEVEL_OPTIONS.map((o) => [o.value, o]));

const LEVEL_HELP = {
  lock: {
    preform: 'Locks the preform, all its spools and all bobbins of those spools.',
    spool: 'Locks the spool and all its bobbins.',
    bobbin: 'Locks only this bobbin.',
  },
  unlock: {
    preform: 'Unlocks the preform, all its spools and all bobbins of those spools.',
    spool: 'Unlocks the spool and all its bobbins.',
    bobbin: 'Unlocks only this bobbin.',
  },
};

/* Confirmation text, e.g. "Lock Preform P123? This will also lock all its unlocked spools and bobbins." */
const confirmText = (mode, level, id) => {
  const verb = mode === 'lock' ? 'Lock' : 'Unlock';
  const lower = mode === 'lock' ? 'lock' : 'unlock';
  const state = mode === 'lock' ? 'unlocked' : 'locked';
  const label = LEVEL_BY_VALUE[level].label;
  if (level === 'preform') return `${verb} ${label} ${id}? This will also ${lower} all its ${state} spools and bobbins.`;
  if (level === 'spool') return `${verb} ${label} ${id}? This will also ${lower} all its ${state} bobbins.`;
  return `${verb} ${label} ${id}?`;
};

const inputCls =
  'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

const FiberLockPanel = ({ onBack }) => {
  const [mode, setMode] = useState('lock'); // 'lock' | 'unlock'
  const [level, setLevel] = useState('preform');
  const [id, setId] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null); // { message, isConflict }
  const [result, setResult] = useState(null); // { mode, level, id, message, data }

  // Synchronous guard against double submit (state updates are async).
  const inFlight = useRef(false);

  const trimmedId = id.trim();
  const isLock = mode === 'lock';
  const levelInfo = LEVEL_BY_VALUE[level];
  const canSubmit = !!trimmedId && !submitting;

  // Close the confirm dialog on Escape (unless a request is running).
  useEffect(() => {
    if (!showConfirm) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !inFlight.current) setShowConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm]);

  const clearOutput = () => {
    setResult(null);
    setError(null);
  };

  const handleModeChange = (next) => {
    if (next === mode || submitting) return;
    setMode(next);
    clearOutput();
  };

  const handleLevelChange = (next) => {
    if (next === level || submitting) return;
    setLevel(next);
    clearOutput();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (inFlight.current || !trimmedId) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);

    const reasonText = reason.trim();
    try {
      const res = isLock
        ? await lockFiber({ lock_type: level, id: trimmedId, lock_reason: reasonText })
        : await unlockFiber({ lock_type: level, id: trimmedId, unlock_reason: reasonText });

      const msg = res?.message || (isLock ? 'Locked successfully' : 'Unlocked successfully');
      showSuccess(msg);
      setResult({ mode, level, id: trimmedId, message: msg, data: res?.data || null });
      // Ready for the next one: keep tab + level, clear inputs.
      setId('');
      setReason('');
      setShowConfirm(false);
    } catch (err) {
      const status = err?.response?.status;
      const msg = getFiberLockErrorMessage(err, isLock ? 'Failed to lock' : 'Failed to unlock');
      const isConflict = status === 409;
      setResult(null);
      setShowConfirm(false);
      // 401 is handled by the global interceptor (redirects to login).
      if (status !== 401) {
        setError({ message: msg, isConflict });
        if (isConflict) showWarning(msg);
        else showError(msg);
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button type="button" onClick={onBack}
                className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
                <ArrowLeft size={11} /> Back
              </button>
            )}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-red-600 bg-red-100">
              <Lock size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Fiber Lock / Unlock</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-0.5" role="tablist">
            {[
              { value: 'lock', label: 'Lock', icon: Lock, active: 'bg-white text-red-600 shadow-sm' },
              { value: 'unlock', label: 'Unlock', icon: Unlock, active: 'bg-white text-emerald-600 shadow-sm' },
            ].map((t) => {
              const Icon = t.icon;
              const selected = mode === t.value;
              return (
                <button key={t.value} type="button" role="tab" aria-selected={selected}
                  onClick={() => handleModeChange(t.value)} disabled={submitting}
                  className={`flex items-center gap-1 px-4 py-1 rounded-md text-[10px] font-bold transition-all disabled:cursor-not-allowed ${
                    selected ? t.active : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <Icon size={11} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              {/* Level */}
              <div className="flex flex-col gap-0.5 md:col-span-3">
                <span className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">
                  Level <span className="text-rose-500">*</span>
                </span>
                <div className="flex bg-slate-100 border border-slate-200 rounded p-0.5" role="radiogroup" aria-label="Level">
                  {LEVEL_OPTIONS.map((o) => {
                    const selected = level === o.value;
                    return (
                      <button key={o.value} type="button" role="radio" aria-checked={selected}
                        onClick={() => handleLevelChange(o.value)} disabled={submitting}
                        className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-all disabled:cursor-not-allowed ${
                          selected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                        }`}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-400 ml-0.5 mt-0.5">{LEVEL_HELP[mode][level]}</p>
              </div>

              {/* ID */}
              <div className="flex flex-col gap-0.5 md:col-span-3">
                <label htmlFor="fiber-lock-id" className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">
                  {levelInfo.idLabel} <span className="text-rose-500">*</span>
                </label>
                <input id="fiber-lock-id" value={id} onChange={(e) => setId(e.target.value)}
                  placeholder={levelInfo.placeholder} disabled={submitting} autoComplete="off"
                  className={inputCls} />
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-0.5 md:col-span-4">
                <label htmlFor="fiber-lock-reason" className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">
                  {isLock ? 'Lock Reason' : 'Unlock Reason'}
                </label>
                <textarea id="fiber-lock-reason" value={reason} onChange={(e) => setReason(e.target.value)}
                  rows={2} placeholder="Optional" disabled={submitting}
                  className={`${inputCls} resize-y`} />
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-0.5 md:col-span-2">
                <span className="text-[9px] invisible">Action</span>
                <button type="submit" disabled={!canSubmit}
                  className={`flex items-center justify-center gap-1.5 px-4 py-1.5 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLock ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}>
                  {submitting
                    ? <Loader2 size={12} className="animate-spin" />
                    : isLock ? <Lock size={12} /> : <Unlock size={12} />}
                  {submitting ? (isLock ? 'Locking...' : 'Unlocking...') : (isLock ? 'Lock' : 'Unlock')}
                </button>
              </div>
            </div>
          </form>

          {/* Error / warning */}
          {error && (
            <div role="alert"
              className={`mx-4 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border ${
                error.isConflict
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
              {error.isConflict
                ? <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
              <span className="text-[11px] font-semibold">{error.message}</span>
            </div>
          )}

          {/* Result */}
          {result ? (
            <ResultCard result={result} />
          ) : !error && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              {isLock ? <Lock size={32} className="opacity-40" /> : <Unlock size={32} className="opacity-40" />}
              <p className="text-xs font-semibold">
                Enter a {levelInfo.idLabel} and click {isLock ? 'Lock' : 'Unlock'}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="fiber-lock-confirm-title"
            className="bg-white rounded-xl shadow-2xl w-96 text-center p-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isLock ? 'bg-red-100' : 'bg-emerald-100'
            }`}>
              {isLock ? <Lock size={18} className="text-red-600" /> : <Unlock size={18} className="text-emerald-600" />}
            </div>
            <h3 id="fiber-lock-confirm-title" className="text-sm font-bold text-slate-800 mb-1 break-words">
              {confirmText(mode, level, trimmedId)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {reason.trim() ? `Reason: ${reason.trim()}` : 'No reason entered.'}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowConfirm(false)} disabled={submitting}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting} autoFocus
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed ${
                  isLock ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {submitting ? (isLock ? 'Locking...' : 'Unlocking...') : (isLock ? 'Lock' : 'Unlock')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   RESULT CARD
   ══════════════════════════════════════════════════════════ */
const ResultCard = ({ result }) => {
  const { mode, id, message, data } = result;
  const isLock = mode === 'lock';
  const level = data?.lock_type || result.level;
  const levelLabel = LEVEL_BY_VALUE[level]?.label || level;
  const counts = data?.counts || {};
  const preforms = Array.isArray(data?.preforms) ? data.preforms : [];
  const spools = Array.isArray(data?.spools) ? data.spools : [];
  const bobbins = Array.isArray(data?.bobbins) ? data.bobbins : [];

  const badges = [
    { label: 'Preforms', value: counts.preforms ?? preforms.length, cls: 'bg-violet-100 text-violet-700' },
    { label: 'Spools', value: counts.spools ?? spools.length, cls: 'bg-sky-100 text-sky-700' },
    { label: 'Bobbins', value: counts.bobbins ?? bobbins.length, cls: 'bg-amber-100 text-amber-700' },
    { label: 'Total', value: counts.total ?? preforms.length + spools.length + bobbins.length, cls: 'bg-slate-800 text-white' },
  ];

  return (
    <div className="m-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-start justify-between gap-3 ${
        isLock ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-start gap-2 min-w-0">
          <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${isLock ? 'text-red-600' : 'text-emerald-600'}`} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800">
              <span className={isLock ? 'text-red-700' : 'text-emerald-700'}>{isLock ? 'Locked' : 'Unlocked'}</span>
              {' '}· {levelLabel} <span className="font-mono">{id}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{message}</p>
            <p className="text-[10px] text-slate-600 mt-1 break-words">
              <span className="font-bold uppercase text-[9px] text-slate-400 mr-1">Reason</span>
              {data?.lock_reason || '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b.label} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${b.cls}`}>
              {b.label}: {b.value}
            </span>
          ))}
        </div>
      </div>

      {/* Lists */}
      <div className={`grid grid-cols-1 gap-3 p-3 ${level === 'preform' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {level === 'preform' && <IdListSection title="Preforms" ids={preforms} />}
        <IdListSection title="Spools" ids={spools} />
        <IdListSection title="Bobbins" ids={bobbins} />
      </div>
    </div>
  );
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-secure contexts (plain http on a LAN IP).
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('copy failed');
};

const IdListSection = ({ title, ids }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await copyText(ids.join(', '));
      setCopied(true);
    } catch {
      showError('Could not copy to clipboard');
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          {title} ({ids.length})
        </span>
        <button type="button" onClick={handleCopy} disabled={ids.length === 0}
          className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy IDs'}
        </button>
      </div>
      {ids.length === 0 ? (
        <p className="px-3 py-4 text-center text-[11px] text-slate-400 font-semibold">None</p>
      ) : (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-800 text-white">
              <tr>
                <th className="px-3 py-1.5 text-left text-[9px] font-bold uppercase w-14">S.No</th>
                <th className="px-3 py-1.5 text-left text-[9px] font-bold uppercase">ID</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((v, i) => (
                <tr key={`${v}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-1 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-1 font-mono text-slate-700">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FiberLockPanel;
