import { useState, useEffect } from 'react';
import {
  Factory, Package, Boxes, Ruler, CalendarClock, Send, RotateCcw, Sparkles,
  Copy, CheckCircle2, Building2, Braces, Hash, History, AlertTriangle, Loader2, ArrowRight,
} from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError } from '../../../../../utils/toastService';
import { createProcessOrder, getMaterials } from '../services/order.api';

/* ══════════════════════════════════════════════════════════
   CREATE PROCESS ORDER (posts a new process order to SAP)
   ══════════════════════════════════════════════════════════ */

const ORDER_TYPES = [
  { value: 'ZSFG', label: 'Semi-finished' },
];

const UNITS = ['KM', 'M', 'EA', 'KG'];

// SAP scheduling types (transaction OPU3).
const SCHEDULING_TYPES = [
  { value: '4', label: 'Forwards', hint: 'From start date' },
  { value: '1', label: 'Backwards', hint: 'From finish date' },
  { value: '3', label: 'Current date', hint: 'Start today' },
  { value: '5', label: 'Forwards in time', hint: 'Time-based fwd' },
  { value: '2', label: 'Backwards in time', hint: 'Time-based bwd' },
  { value: '6', label: 'Capacity only', hint: 'No dates' },
];

const DEFAULT_VALUES = {
  ManufacturingOrderType: 'ZSFG',
  Material: '',
  ProductionPlant: '1200',
  TotalQuantity: '',
  ProductionUnit: 'KM',
  BasicSchedulingType: '4',
};

const schema = Yup.object({
  ManufacturingOrderType: Yup.string().trim().required('Order type is required').max(4, 'Max 4 characters'),
  Material: Yup.string().trim().required('Material is required').max(40, 'Max 40 characters'),
  ProductionPlant: Yup.string().trim().required('Plant is required').max(4, 'Max 4 characters'),
  TotalQuantity: Yup.number()
    .typeError('Enter a valid number')
    .required('Quantity is required')
    .moreThan(0, 'Must be greater than 0'),
  ProductionUnit: Yup.string().trim().required('Unit is required').max(3, 'Max 3 characters'),
  BasicSchedulingType: Yup.string().required('Scheduling type is required'),
});

const toPayload = (v) => ({
  ManufacturingOrderType: String(v.ManufacturingOrderType || '').trim().toUpperCase(),
  Material: String(v.Material || '').trim().toUpperCase(),
  ProductionPlant: String(v.ProductionPlant || '').trim(),
  TotalQuantity: v.TotalQuantity === '' ? '' : String(v.TotalQuantity),
  ProductionUnit: String(v.ProductionUnit || '').trim().toUpperCase(),
  BasicSchedulingType: String(v.BasicSchedulingType || ''),
});

/* ── small presentational helpers ───────────────────────── */
const FieldShell = ({ icon: Icon, label, required, error, touched, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
        <Icon size={11} />
      </span>
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {touched && error ? (
      <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
        <AlertTriangle size={10} /> {error}
      </span>
    ) : hint ? (
      <span className="text-[10px] text-slate-400">{hint}</span>
    ) : null}
  </div>
);

const inputCls = (hasError) =>
  `w-full px-3 py-2 text-xs rounded-lg border bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 ${
    hasError
      ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400'
      : 'border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
  }`;

const CreateProcessOrder = () => {
  const [materials, setMaterials] = useState([]);
  const [lastResult, setLastResult] = useState(null); // { order_no, message, payload }
  const [submitError, setSubmitError] = useState(null);
  const [recent, setRecent] = useState([]); // orders created in this session

  useEffect(() => {
    (async () => {
      try {
        const res = await getMaterials();
        setMaterials(res?.data || []);
      } catch (e) {
        console.error('materials load failed', e);
      }
    })();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitError(null);
    setLastResult(null);
    const payload = toPayload(values);
    try {
      const res = await createProcessOrder(payload);
      const orderNo = res?.data?.order_no || null;
      const result = {
        order_no: orderNo,
        message: res?.data?.message || res?.message,
        sync: res?.data?.sync || null,
        release: res?.data?.release || null,
        db_error: res?.data?.db_error || null,
        payload,
        at: new Date(),
      };
      setLastResult(result);
      setRecent((r) => [result, ...r].slice(0, 5));
      showSuccess(res?.message || 'Process order created');
      resetForm({ values: { ...DEFAULT_VALUES, ManufacturingOrderType: payload.ManufacturingOrderType, ProductionPlant: payload.ProductionPlant } });
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to create process order';
      setSubmitError(msg);
      showError(msg);
    }
    setSubmitting(false);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied');
    } catch {
      showError('Copy failed');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <Formik initialValues={DEFAULT_VALUES} validationSchema={schema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, resetForm }) => {
          const selectedMat = materials.find((m) => m.material_code === values.Material);
          const payload = toPayload(values);

          return (
            <Form className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
              {/* Hero header */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-800 text-white shadow-lg">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute right-24 -bottom-12 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative px-5 py-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/30">
                    <Factory size={22} className="!text-white" color="#ffffff" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-extrabold tracking-wide !text-white">Create Process Order</h2>
                    <p className="text-[11px] !text-white">
                      Fill in the details below to create a new process order directly in SAP.
                    </p>
                  </div>
                  <span className="hidden md:flex items-center gap-1 text-[10px] font-bold !text-white bg-white/15 px-2.5 py-1 rounded-full ring-1 ring-white/25">
                    <Sparkles size={11} color="#ffffff" /> SAP S/4HANA
                  </span>
                </div>
              </div>

              {/* Success banner */}
              {lastResult && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-emerald-800">{lastResult.message || 'Process order created'}</div>
                    <div className="text-[10px] text-emerald-700">
                      {lastResult.payload.Material} · {lastResult.payload.TotalQuantity} {lastResult.payload.ProductionUnit}
                    </div>
                    {lastResult.sync && (
                      <div className={`text-[10px] font-semibold mt-0.5 ${lastResult.sync.synced ? 'text-sky-700' : 'text-amber-700'}`}>
                        {lastResult.sync.synced ? '✓ ' : '⚠ '}{lastResult.sync.message}
                      </div>
                    )}
                    {lastResult.release && lastResult.release.released === false && (
                      <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                        ⚠ Release issue: {lastResult.release.text || 'not released'}
                      </div>
                    )}
                    {lastResult.db_error && (
                      <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                        ⚠ Could not save in MES table: {lastResult.db_error}
                      </div>
                    )}
                  </div>
                  {lastResult.order_no && (
                    <button type="button" onClick={() => copy(lastResult.order_no)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-mono font-bold hover:bg-emerald-100 transition-all">
                      <Hash size={12} /> {lastResult.order_no} <Copy size={11} />
                    </button>
                  )}
                </div>
              )}

              {/* Error banner */}
              {submitError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50">
                  <AlertTriangle size={16} className="text-rose-600 mt-0.5" />
                  <div className="text-xs text-rose-700 font-semibold break-words">{submitError}</div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* ── Form card ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Section: order type */}
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">1 · Order type</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {ORDER_TYPES.map((t) => {
                        const active = values.ManufacturingOrderType === t.value;
                        return (
                          <button key={t.value} type="button"
                            onClick={() => setFieldValue('ManufacturingOrderType', t.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                              active
                                ? 'border-blue-600 bg-blue-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                            <span className={`text-xs font-mono font-extrabold ${active ? 'text-blue-700' : 'text-slate-700'}`}>{t.value}</span>
                            <span className="text-[10px] text-slate-500">{t.label}</span>
                          </button>
                        );
                      })}
                      <input
                        name="ManufacturingOrderType"
                        value={values.ManufacturingOrderType}
                        onChange={(e) => setFieldValue('ManufacturingOrderType', e.target.value.toUpperCase())}
                        onBlur={handleBlur}
                        maxLength={4}
                        placeholder="Other"
                        className={`${inputCls(touched.ManufacturingOrderType && errors.ManufacturingOrderType)} !w-24 font-mono uppercase`}
                      />
                    </div>
                    {touched.ManufacturingOrderType && errors.ManufacturingOrderType && (
                      <span className="text-[10px] text-rose-600 font-semibold mt-1 block">{errors.ManufacturingOrderType}</span>
                    )}
                  </div>

                  {/* Section: material & plant */}
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">2 · Material & plant</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FieldShell icon={Package} label="Material" required
                          error={errors.Material} touched={touched.Material}
                          hint={selectedMat?.material_description || 'Type or pick a material code'}>
                          <input
                            name="Material"
                            list="create-po-material-list"
                            value={values.Material}
                            onChange={(e) => setFieldValue('Material', e.target.value.toUpperCase())}
                            onBlur={handleBlur}
                            placeholder="e.g. COLFIBSMFG652DBL"
                            className={`${inputCls(touched.Material && errors.Material)} font-mono uppercase`}
                          />
                          <datalist id="create-po-material-list">
                            {materials.map((m) => (
                              <option key={m.material_code} value={m.material_code}>{m.material_description}</option>
                            ))}
                          </datalist>
                        </FieldShell>
                      </div>
                      <FieldShell icon={Building2} label="Production plant" required
                        error={errors.ProductionPlant} touched={touched.ProductionPlant}>
                        <input
                          name="ProductionPlant"
                          value={values.ProductionPlant}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          maxLength={4}
                          placeholder="1200"
                          className={`${inputCls(touched.ProductionPlant && errors.ProductionPlant)} font-mono`}
                        />
                      </FieldShell>
                    </div>
                  </div>

                  {/* Section: quantity */}
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">3 · Quantity</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <FieldShell icon={Boxes} label="Total quantity" required
                          error={errors.TotalQuantity} touched={touched.TotalQuantity}>
                          <div className="relative">
                            <input
                              name="TotalQuantity"
                              type="number"
                              min="0"
                              step="any"
                              value={values.TotalQuantity}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="100"
                              className={`${inputCls(touched.TotalQuantity && errors.TotalQuantity)} pr-14 text-sm font-bold font-mono`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                              {values.ProductionUnit || '—'}
                            </span>
                          </div>
                        </FieldShell>
                      </div>
                      <FieldShell icon={Ruler} label="Production unit" required
                        error={errors.ProductionUnit} touched={touched.ProductionUnit}>
                        <div className="flex gap-1">
                          {UNITS.map((u) => (
                            <button key={u} type="button" onClick={() => setFieldValue('ProductionUnit', u)}
                              className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                values.ProductionUnit === u
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}>
                              {u}
                            </button>
                          ))}
                        </div>
                      </FieldShell>
                    </div>
                  </div>

                  {/* Section: scheduling */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                      <CalendarClock size={11} /> 4 · Basic scheduling type
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SCHEDULING_TYPES.map((s) => {
                        const active = values.BasicSchedulingType === s.value;
                        return (
                          <button key={s.value} type="button" onClick={() => setFieldValue('BasicSchedulingType', s.value)}
                            className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                              active
                                ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center ${
                                active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>{s.value}</span>
                              <span className={`text-[11px] font-bold ${active ? 'text-indigo-800' : 'text-slate-700'}`}>{s.label}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 pl-7">{s.hint}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button type="button" disabled={isSubmitting}
                      onClick={() => { resetForm({ values: DEFAULT_VALUES }); setSubmitError(null); }}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50">
                      <RotateCcw size={12} /> Reset
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      {isSubmitting ? 'Creating in SAP…' : 'Create Process Order'}
                    </button>
                  </div>
                </div>

                {/* ── Side column: summary, payload, recent ── */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Summary</div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Package size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-extrabold text-slate-800 truncate">{payload.Material || 'No material yet'}</div>
                        <div className="text-[10px] text-slate-500 truncate">{selectedMat?.material_description || '—'}</div>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        ['Order type', payload.ManufacturingOrderType || '—'],
                        ['Plant', payload.ProductionPlant || '—'],
                        ['Quantity', payload.TotalQuantity ? `${payload.TotalQuantity} ${payload.ProductionUnit}` : '—'],
                        ['Scheduling', SCHEDULING_TYPES.find((s) => s.value === payload.BasicSchedulingType)?.label || '—'],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5">
                          <dt className="text-[9px] uppercase font-bold text-slate-400">{k}</dt>
                          <dd className="font-bold text-slate-700 truncate">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-slate-700">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <Braces size={11} /> SAP payload
                      </span>
                      <button type="button" onClick={() => copy(JSON.stringify(payload, null, 2))}
                        className="text-slate-400 hover:text-white transition-colors" title="Copy payload">
                        <Copy size={12} />
                      </button>
                    </div>
                    <pre className="px-4 py-3 text-[10.5px] leading-relaxed text-emerald-300 font-mono overflow-x-auto">
{JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>

                  {recent.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                        <History size={11} /> Created this session
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {recent.map((r, i) => (
                          <li key={`${r.order_no}-${i}`} className="py-1.5 flex items-center gap-2 text-[11px]">
                            <ArrowRight size={11} className="text-emerald-500" />
                            <span className="font-mono font-bold text-blue-700">{r.order_no || 'created'}</span>
                            <span className="text-slate-500 truncate flex-1">{r.payload.Material}</span>
                            <span className="text-slate-400">{r.at.toLocaleTimeString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CreateProcessOrder;
