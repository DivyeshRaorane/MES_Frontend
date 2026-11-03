import { useState, useEffect } from 'react';
import {
  CircleCheckBig, Scale, X, Loader2, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw,
} from 'lucide-react';
import { showSuccess, showError } from '../../../../../utils/toastService';
import { tecoProcessOrder, changeProcessOrderQty } from '../services/order.api';

/* ══════════════════════════════════════════════════════════
   ORDER ACTION MODAL - TECO / Change Qty for one order row.
   The backend re-syncs the order from SAP after success, so the
   list only needs a refresh (onDone).
   ══════════════════════════════════════════════════════════ */

const QTY_RE = /^\d+(\.\d{1,3})?$/;

const META = {
  teco: { title: 'TECO Process Order', Icon: CircleCheckBig, btn: 'Yes, TECO' },
  qty: { title: 'Change Order Quantity', Icon: Scale, btn: 'Update Quantity' },
};

const OrderActionModal = ({ action, order, onClose, onDone }) => {
  const [qty, setQty] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const meta = META[action];
  const currentQty = order?.order_qty != null ? parseFloat(order.order_qty).toFixed(3) : '—';

  const qtyErr = action !== 'qty' ? null
    : !qty.trim() ? 'New quantity is required'
      : !QTY_RE.test(qty.trim()) ? 'Enter a number with up to 3 decimals'
        : Number(qty) <= 0 ? 'Must be greater than 0'
          : null;

  // Close on Escape (not while a request is running).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !loading) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleClose = () => {
    if (loading) return;
    if (result) onDone?.();
    onClose();
  };

  const submit = async (e) => {
    e?.preventDefault();
    setTouched(true);
    if (qtyErr) return;
    setLoading(true);
    setError(null);
    try {
      const res = action === 'teco'
        ? await tecoProcessOrder(order.order_no)
        : await changeProcessOrderQty(order.order_no, qty.trim());
      setResult(res?.data || {});
      showSuccess(res?.data?.message || 'Done');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Request failed';
      setError(msg);
      showError(msg);
    }
    setLoading(false);
  };

  if (!meta || !order) return null;
  const { Icon } = meta;
  const sync = result?.sync;
  const syncOk = sync?.synced;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-5 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/30">
            <Icon size={18} className="!text-white" color="#ffffff" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold !text-white">{meta.title}</div>
            <div className="text-[11px] !text-white font-mono">Order {order.order_no}</div>
          </div>
          <button type="button" onClick={handleClose} disabled={loading}
            className="text-white/70 hover:text-white disabled:opacity-40">
            <X size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 flex flex-col gap-3">
          {/* Order summary */}
          <dl className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              ['Material', order.material_code],
              ['Quantity', `${currentQty} ${order.uom || ''}`],
              ['Status', order.order_status],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 min-w-0">
                <dt className="text-[9px] uppercase font-bold text-slate-400">{k}</dt>
                <dd className="font-bold text-slate-700 truncate font-mono">{v || '—'}</dd>
              </div>
            ))}
          </dl>

          {!result && action === 'teco' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800">
                <div className="font-bold">Technically complete this order in SAP?</div>
                No further production or confirmations can be posted against it after TECO.
              </div>
            </div>
          )}

          {!result && action === 'qty' && (
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                New total quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  autoFocus
                  value={qty}
                  onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ''))}
                  onBlur={() => setTouched(true)}
                  disabled={loading}
                  inputMode="decimal"
                  placeholder={currentQty !== '—' ? currentQty : 'e.g. 150'}
                  className={`w-full px-4 py-3 pr-14 text-base font-mono font-bold rounded-xl border bg-white outline-none transition-all text-slate-800 placeholder:text-slate-300 placeholder:font-normal ${
                    touched && qtyErr
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{order.uom || ''}</span>
              </div>
              {touched && qtyErr ? (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle size={10} /> {qtyErr}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-1 block">Sent to SAP with 3 decimals</span>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-800 min-w-0">
                  <div className="font-bold">{result.message}</div>
                  {action === 'teco' && result.teco?.text && <div>{result.teco.text}</div>}
                  {action === 'qty' && (
                    <div className="flex items-center gap-1.5 font-mono font-bold mt-0.5">
                      {result.previous_qty ?? '?'} <ArrowRight size={11} /> {result.new_qty}
                    </div>
                  )}
                </div>
              </div>
              {sync && (
                <div className={`rounded-xl border px-4 py-2 flex items-center gap-2 text-[11px] ${
                  syncOk ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {syncOk ? <RefreshCw size={13} /> : <AlertTriangle size={13} />}
                  <span className="font-semibold">{sync.message}</span>
                </div>
              )}
              {result.db_error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-800 font-semibold">
                  Could not update MES record: {result.db_error}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-700 font-semibold break-words">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {result ? (
              <button type="button" onClick={handleClose}
                className="px-5 py-2 text-[11px] font-bold rounded-lg text-white bg-slate-800 hover:bg-slate-900">
                Close
              </button>
            ) : (
              <>
                <button type="button" onClick={handleClose} disabled={loading}
                  className="px-4 py-2 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className={`flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold rounded-lg text-white shadow-md disabled:opacity-60 ${
                    action === 'teco' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}>
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                  {loading ? 'Sending to SAP…' : meta.btn}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderActionModal;
