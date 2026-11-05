import { useState, useRef, useEffect } from 'react';
import { Loader2, Undo2, CircleAlert, CircleCheck, X } from 'lucide-react';
import { showSuccess } from '../../../../../utils/toastService';
import { reverseDrawGrn, getEntryServiceErrorMessage } from '../services/entry_services.api';

const SPOOL_ID_LENGTH = 10;

const labelCls = 'font-bold text-slate-800 uppercase ml-0.5 text-[9px]';
const inputCls =
  'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60';

/* ══════════════════════════════════════════════════════════
   DRAW REVERSAL FORM (GRN > DRAW)
   ══════════════════════════════════════════════════════════ */
const DrawReversalForm = () => {
  const [spoolId, setSpoolId] = useState('');
  const [touched, setTouched] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Synchronous guard against double submit (state updates are async).
  const inFlight = useRef(false);

  const trimmed = spoolId.trim();
  const isValid = trimmed.length === SPOOL_ID_LENGTH;
  const idError =
    touched && !isValid ? `Spool ID must be exactly ${SPOOL_ID_LENGTH} characters` : '';

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
    setTouched(true);
    if (!isValid || submitting) return;
    setError('');
    setSuccessMsg('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (inFlight.current || !isValid) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    try {
      const res = await reverseDrawGrn({ spool_id: trimmed });
      setShowConfirm(false);
      if (res?.success) {
        const msg = res.message || `Spool ${trimmed} reversed successfully.`;
        setSuccessMsg(msg);
        showSuccess(msg);
        setSpoolId('');
        setTouched(false);
      } else {
        setError(res?.error || res?.message || 'Failed to reverse entry');
      }
    } catch (e) {
      setShowConfirm(false);
      setError(getEntryServiceErrorMessage(e, 'Failed to reverse entry'));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOpenConfirm} noValidate className="flex flex-col gap-3">
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

        {successMsg && (
          <div role="status"
            className="flex items-start gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
            <CircleCheck size={14} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold flex-1 break-words">{successMsg}</p>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <label htmlFor="reversal-spool-id" className={labelCls}>Spool ID *</label>
          <input id="reversal-spool-id" value={spoolId} autoComplete="off" maxLength={SPOOL_ID_LENGTH}
            onChange={(e) => setSpoolId(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={`${SPOOL_ID_LENGTH} characters`} disabled={submitting}
            aria-invalid={!!idError} aria-describedby={idError ? 'reversal-spool-err' : undefined}
            className={inputCls} />
          <div className="flex justify-between">
            {idError
              ? <p id="reversal-spool-err" className="text-red-500 text-[8px]">{idError}</p>
              : <span />}
            <span className="text-[8px] text-slate-400">{spoolId.length}/{SPOOL_ID_LENGTH}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="submit" disabled={!isValid || submitting}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all ${
              !isValid || submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}>
            {submitting && <Loader2 size={12} className="animate-spin" />}
            Submit for Reversal
          </button>
        </div>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[210] p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="reversal-confirm-title"
            className="bg-white rounded-xl shadow-2xl w-80 text-center p-5">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Undo2 size={18} className="text-rose-600" />
            </div>
            <h3 id="reversal-confirm-title" className="text-sm font-bold text-slate-800 mb-1">
              Reverse DRAW entry for spool {trimmed}?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This reverses the entry in SAP and MES.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowConfirm(false)} disabled={submitting}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting} autoFocus
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-bold ${
                  submitting ? 'bg-rose-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
                }`}>
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {submitting ? 'Reversing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrawReversalForm;
