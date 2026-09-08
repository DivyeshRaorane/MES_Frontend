import { useState, useEffect } from 'react';
import {
  Plus, Edit2, ArrowLeft, Loader2, Search, FileText, Trash2, Eye,
  RefreshCw, CheckCircle2, XCircle, MinusCircle, CloudDownload, ListChecks,
} from 'lucide-react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import {
  getAllOrders,
  getOrderByNo,
  createOrder,
  updateOrder,
  getMaterials,
  syncProcessOrders,
} from '../services/order.api';

/* ══════════════════════════════════════════════════════════
   ORDER PANEL - Main Component (router: list | form | view)
   ══════════════════════════════════════════════════════════ */
const OrderPanel = ({ onBack }) => {
  const [tab, setTab] = useState('orders'); // 'orders' | 'sync'
  const [view, setView] = useState('list'); // 'list' | 'form' | 'view'
  const [activeOrderNo, setActiveOrderNo] = useState(null);

  const handleCreate = () => { setActiveOrderNo(null); setView('form'); };
  const handleEdit = (orderNo) => { setActiveOrderNo(orderNo); setView('form'); };
  const handleView = (orderNo) => { setActiveOrderNo(orderNo); setView('view'); };
  const handleBackToList = () => { setActiveOrderNo(null); setView('list'); };

  // Form & view are full-screen sub-flows (no tab strip) under the Orders tab
  if (tab === 'orders' && view === 'form') {
    return <OrderForm orderNo={activeOrderNo} onBack={handleBackToList} onSaved={handleBackToList} />;
  }
  if (tab === 'orders' && view === 'view') {
    return <OrderView orderNo={activeOrderNo} onBack={handleBackToList} onEdit={() => handleEdit(activeOrderNo)} />;
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Tab strip */}
        <div className="px-4 pt-2 border-b border-slate-200 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline pb-2">
            <ArrowLeft size={11} /> Back to Admin
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-t-lg border-b-2 transition-all ${
                tab === 'orders'
                  ? 'text-blue-700 border-blue-600 bg-white'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}>
              <ListChecks size={13} /> Process Orders
            </button>
            <button type="button" onClick={() => setTab('sync')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-t-lg border-b-2 transition-all ${
                tab === 'sync'
                  ? 'text-blue-700 border-blue-600 bg-white'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}>
              <CloudDownload size={13} /> Sync from SAP
            </button>
          </div>
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-hidden">
          {tab === 'orders'
            ? <OrderList onCreate={handleCreate} onEdit={handleEdit} onView={handleView} />
            : <OrderSync />}
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   ORDER LIST (one row per order_no)
   ══════════════════════════════════════════════════════════ */
const OrderList = ({ onCreate, onEdit, onView }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res?.data || []);
    } catch (e) {
      console.error(e);
      showError('Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q
      || o.order_no?.toLowerCase().includes(q)
      || o.material_code?.toLowerCase().includes(q)
      || o.order_status?.toLowerCase().includes(q);
  });

  const statusPill = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('COMPLETE') || s.includes('CLOSED') || s.includes('CNF')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('CANCEL') || s.includes('DLFL')) return 'bg-rose-100 text-rose-700';
    if (s.includes('REL') || s.includes('OPEN') || s.includes('CRTD')) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Sub-header */}
        <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-100">
              <FileText size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Order Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              {orders.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={onCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Create Order
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['Order No', 'Material Code', 'Order Qty', 'UOM', 'GR Qty', 'Status', 'Creation Date', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.order_no} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{o.order_no}</td>
                    <td className="px-3 py-2 text-xs text-slate-700 border-r border-slate-100">{o.material_code || '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 text-right font-mono">
                      {o.order_qty != null ? parseFloat(o.order_qty).toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{o.uom || '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 text-right font-mono">
                      {o.gr_qty != null ? parseFloat(o.gr_qty).toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusPill(o.order_status)}`}>
                        {o.order_status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-100">
                      {o.order_creation_date ? new Date(o.order_creation_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onView(o.order_no)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-[8px] font-bold rounded hover:bg-slate-100 transition-all">
                          <Eye size={9} /> View
                        </button>
                        <button type="button" onClick={() => onEdit(o.order_no)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   ORDER SYNC (Fetch process orders from SAP by date)
   ══════════════════════════════════════════════════════════ */
// Convert a native date input value "YYYY-MM-DD" to "DD-MM-YYYY" for the API.
const toApiDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
};

const STATUS_META = {
  inserted: { label: 'Inserted', badge: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  skipped: { label: 'Skipped', badge: 'bg-amber-100 text-amber-700', Icon: MinusCircle },
  failed: { label: 'Failed', badge: 'bg-rose-100 text-rose-700', Icon: XCircle },
};

const OrderSync = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'inserted' | 'skipped' | 'failed'

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await syncProcessOrders(date ? toApiDate(date) : undefined);
      if (res?.success) {
        setSummary(res.summary || null);
        setFilter('all');
        showSuccess(res.message || 'Process order sync completed');
      } else {
        setSummary(null);
        setError(res?.message || 'Sync failed');
        showError(res?.message || 'Sync failed');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Sync failed';
      setSummary(null);
      setError(msg);
      showError(msg);
    }
    setLoading(false);
  };

  const details = summary?.details || [];
  const filteredDetails = filter === 'all' ? details : details.filter(d => d.status === filter);

  const counters = summary
    ? [
        { key: 'fetched', label: 'Fetched', value: summary.fetched, cls: 'text-slate-700 bg-slate-100' },
        { key: 'inserted', label: 'Inserted', value: summary.inserted, cls: 'text-emerald-700 bg-emerald-100' },
        {
          key: 'skipped',
          label: 'Skipped',
          value: (summary.skipped_existing || 0) + (summary.skipped_no_order_no || 0) + (summary.skipped_duplicate_in_batch || 0),
          cls: 'text-amber-700 bg-amber-100',
        },
        { key: 'failed', label: 'Failed', value: summary.failed, cls: 'text-rose-700 bg-rose-100' },
      ]
    : [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-600 bg-blue-100">
            <CloudDownload size={14} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sync Process Orders from SAP</span>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="font-bold text-slate-800 uppercase ml-0.5 text-[9px]">Order Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <button type="button" onClick={handleSync} disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg text-white transition-all ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing...' : 'Load / Sync'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 size={20} className="text-blue-500 animate-spin" />
            <span className="text-xs text-slate-500">Fetching from SAP, this can take a few seconds...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
            <XCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-700">Sync failed</p>
              <p className="text-[11px] text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Idle (nothing run yet) */}
        {!loading && !error && !summary && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <CloudDownload size={28} className="text-slate-300" />
            <p className="text-xs text-slate-400">Pick a date and click <span className="font-bold">Load / Sync</span> to import process orders from SAP.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && summary && (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Date: <span className="text-slate-700 font-mono">{summary.date}</span>
              </span>
              {counters.map(c => (
                <span key={c.key} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.cls}`}>
                  {c.label}: {c.value ?? 0}
                </span>
              ))}
            </div>

            {/* Empty state when nothing fetched */}
            {summary.fetched === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
                <MinusCircle size={26} className="text-slate-300" />
                <p className="text-xs text-slate-400">No process orders found for this date.</p>
              </div>
            ) : (
              <>
                {/* Filter chips */}
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'all', label: `All (${details.length})` },
                    { key: 'inserted', label: `Inserted (${details.filter(d => d.status === 'inserted').length})` },
                    { key: 'skipped', label: `Skipped (${details.filter(d => d.status === 'skipped').length})` },
                    { key: 'failed', label: `Failed (${details.filter(d => d.status === 'failed').length})` },
                  ].map(chip => (
                    <button key={chip.key} type="button" onClick={() => setFilter(chip.key)}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all ${
                        filter === chip.key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}>
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Details table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800">
                      <tr>
                        {['Order No', 'Status', 'Message'].map(h => (
                          <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDetails.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">No orders in this filter</td></tr>
                      ) : filteredDetails.map((d, i) => {
                        const meta = STATUS_META[d.status] || { label: d.status, badge: 'bg-slate-100 text-slate-600', Icon: MinusCircle };
                        const Icon = meta.Icon;
                        return (
                          <tr key={d.order_no ?? `row-${i}`} className="hover:bg-blue-50/30">
                            <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">
                              {d.order_no || '—'}
                            </td>
                            <td className="px-3 py-1.5 border-r border-slate-100">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                                <Icon size={10} /> {meta.label}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-xs text-slate-600">{d.message || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   ORDER FORM (Create / Edit) - header + components + operations
   order_conf is NOT editable here.
   ══════════════════════════════════════════════════════════ */
const emptyComponent = { material_code: '', mat_desc: '', qty: '', uom: '', storage_location: '', movement_type: '' };
const emptyOperation = {
  operation_no: '', workcenter: '', operation_qty: '',
  activity_1: '', activity_2: '', activity_3: '', activity_4: '', activity_5: '', activity_6: '',
};

// Treat empty strings as null so blank numeric fields don't fail validation.
const emptyToNull = (value, originalValue) =>
  originalValue === '' || originalValue === null || originalValue === undefined ? null : value;

const orderSchema = Yup.object({
  order_no: Yup.string().trim().required('Order No is required').max(10, 'Max 10 chars'),
  material_code: Yup.string().max(40, 'Max 40 chars').nullable(),
  order_qty: Yup.number().transform(emptyToNull).typeError('Must be a number').min(0, 'Cannot be negative').nullable(),
  gr_qty: Yup.number().transform(emptyToNull).typeError('Must be a number').min(0, 'Cannot be negative').nullable(),
  components: Yup.array().of(
    Yup.object({
      material_code: Yup.string().max(40, 'Max 40 chars').nullable(),
      qty: Yup.number().transform(emptyToNull).typeError('Must be a number').min(0, 'Cannot be negative').nullable(),
      movement_type: Yup.number().transform(emptyToNull).typeError('Must be a number').integer('Whole number').nullable(),
    })
  ),
  operations: Yup.array().of(
    Yup.object({
      operation_no: Yup.number().transform(emptyToNull).typeError('Must be a number').integer('Whole number').nullable(),
      workcenter: Yup.string().max(10, 'Max 10 chars').nullable(),
      operation_qty: Yup.number().transform(emptyToNull).typeError('Must be a number').min(0, 'Cannot be negative').nullable(),
    })
  ),
});

const toNum = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const toInt = (v) => (v === '' || v === null || v === undefined ? null : parseInt(v, 10));

const OrderForm = ({ orderNo, onBack, onSaved }) => {
  const isEdit = !!orderNo;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [initialValues, setInitialValues] = useState({
    order_no: '',
    material_code: '',
    order_qty: '',
    uom: '',
    storage_location: '',
    gr_qty: '',
    order_status: '',
    type: '',
    order_creation_date: '',
    components: [{ ...emptyComponent }],
    operations: [{ ...emptyOperation }],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        try {
          const matRes = await getMaterials();
          setMaterials(matRes?.data || []);
        } catch (e) { console.error('materials load failed', e); }

        if (isEdit) {
          const res = await getOrderByNo(orderNo);
          const d = res?.data || {};
          const h = d.header || {};
          setInitialValues({
            order_no: h.order_no || orderNo,
            material_code: h.material_code || '',
            order_qty: h.order_qty ?? '',
            uom: h.uom || '',
            storage_location: h.storage_location || '',
            gr_qty: h.gr_qty ?? '',
            order_status: h.order_status || '',
            type: h.type || '',
            order_creation_date: h.order_creation_date ? h.order_creation_date.slice(0, 10) : '',
            components: (d.components?.length ? d.components : [{ ...emptyComponent }]).map(c => ({
              material_code: c.material_code || '',
              mat_desc: c.mat_desc || '',
              qty: c.qty ?? '',
              uom: c.uom || '',
              storage_location: c.storage_location || '',
              movement_type: c.movement_type ?? '',
            })),
            operations: (d.operations?.length ? d.operations : [{ ...emptyOperation }]).map(op => ({
              operation_no: op.operation_no ?? '',
              workcenter: op.workcenter || '',
              operation_qty: op.operation_qty ?? '',
              activity_1: op.activity_1 ?? '',
              activity_2: op.activity_2 ?? '',
              activity_3: op.activity_3 ?? '',
              activity_4: op.activity_4 ?? '',
              activity_5: op.activity_5 ?? '',
              activity_6: op.activity_6 ?? '',
            })),
          });
        }
      } catch (e) {
        console.error(e);
        showError('Failed to load order data');
      }
      setLoading(false);
    };
    loadData();
  }, [orderNo, isEdit]);

  const handleSubmit = async (values) => {
    // duplicate order_no components not restricted; but require order_no
    setSubmitting(true);
    try {
      const payload = {
        header: {
          order_no: values.order_no.trim(),
          material_code: values.material_code || null,
          order_qty: toNum(values.order_qty),
          uom: values.uom || null,
          storage_location: values.storage_location || null,
          gr_qty: toNum(values.gr_qty),
          order_status: values.order_status || null,
          type: values.type || null,
          order_creation_date: values.order_creation_date || null,
        },
        components: values.components
          .filter(c => c.material_code || c.mat_desc || c.qty !== '')
          .map(c => ({
            material_code: c.material_code || null,
            mat_desc: c.mat_desc || null,
            qty: toNum(c.qty),
            uom: c.uom || null,
            storage_location: c.storage_location || null,
            movement_type: toInt(c.movement_type),
          })),
        operations: values.operations
          .filter(op => op.operation_no !== '' || op.workcenter || op.operation_qty !== '')
          .map(op => ({
            operation_no: toInt(op.operation_no),
            workcenter: op.workcenter || null,
            operation_qty: toNum(op.operation_qty),
            activity_1: toInt(op.activity_1),
            activity_2: toInt(op.activity_2),
            activity_3: toInt(op.activity_3),
            activity_4: toInt(op.activity_4),
            activity_5: toInt(op.activity_5),
            activity_6: toInt(op.activity_6),
          })),
      };

      const res = isEdit ? await updateOrder(orderNo, payload) : await createOrder(payload);
      if (res?.success) {
        showSuccess(isEdit ? 'Order updated successfully' : 'Order created successfully');
        onSaved();
      } else {
        showError(res?.message || 'Failed to save order');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  const materialOptions = materials.map(m => ({
    value: m.material_code,
    label: m.material_code,
    desc: m.material_description || m.mat_desc || m.material_desc || '',
  }));

  const labelCls = 'font-bold text-slate-800 uppercase ml-0.5 text-[9px]';
  const inputCls = 'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';
  const cellInput = 'w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500';

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik
          initialValues={initialValues}
          validationSchema={orderSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched, submitForm, validateForm, setTouched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* Form Header */}
              <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onBack}
                    className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
                    <ArrowLeft size={11} /> Back to List
                  </button>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-100">
                    <FileText size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {isEdit ? 'Edit Order' : 'Create Order'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={onBack}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">
                    Cancel
                  </button>
                  <button type="button" disabled={submitting}
                    onClick={async () => {
                      const validationErrors = await validateForm();
                      if (Object.keys(validationErrors).length > 0) {
                        // Mark all fields touched so inline errors show, and surface a toast.
                        setTouched(
                          Object.keys(validationErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
                          false
                        );
                        showWarning('Please fix the highlighted fields before saving.');
                        return;
                      }
                      submitForm();
                    }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all
                      ${submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

                {/* ── ORDER HEADER (order_hdr) ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Order Header</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Order No *</label>
                      <input
                        value={values.order_no}
                        onChange={(e) => setFieldValue('order_no', e.target.value)}
                        disabled={isEdit}
                        maxLength={10}
                        placeholder="e.g. 1000001"
                        className={`${inputCls} ${isEdit ? 'bg-slate-200 text-slate-500 cursor-default' : ''}`}
                      />
                      {errors.order_no && touched.order_no && (
                        <p className="text-red-500 text-[8px]">{errors.order_no}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Material Code</label>
                      <input
                        list="order-material-list"
                        value={values.material_code}
                        onChange={(e) => {
                          const code = e.target.value;
                          setFieldValue('material_code', code);
                        }}
                        maxLength={10}
                        placeholder="Material code"
                        className={inputCls}
                      />
                      <datalist id="order-material-list">
                        {materialOptions.map(m => (
                          <option key={m.value} value={m.value}>{m.desc}</option>
                        ))}
                      </datalist>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Order Qty</label>
                      <input type="number" step="0.01" value={values.order_qty}
                        onChange={(e) => setFieldValue('order_qty', e.target.value)}
                        placeholder="0.00" className={inputCls} />
                      {errors.order_qty && touched.order_qty && (
                        <p className="text-red-500 text-[8px]">{errors.order_qty}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>UOM</label>
                      <input value={values.uom} maxLength={10}
                        onChange={(e) => setFieldValue('uom', e.target.value)}
                        placeholder="e.g. KM / EA" className={inputCls} />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Storage Location</label>
                      <input value={values.storage_location} maxLength={10}
                        onChange={(e) => setFieldValue('storage_location', e.target.value)}
                        placeholder="e.g. 0001" className={inputCls} />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>GR Qty</label>
                      <input type="number" step="0.01" value={values.gr_qty}
                        onChange={(e) => setFieldValue('gr_qty', e.target.value)}
                        placeholder="0.00" className={inputCls} />
                      {errors.gr_qty && touched.gr_qty && (
                        <p className="text-red-500 text-[8px]">{errors.gr_qty}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Order Status</label>
                      <input value={values.order_status} maxLength={20}
                        onChange={(e) => setFieldValue('order_status', e.target.value)}
                        placeholder="e.g. CRTD / REL / TECO" className={inputCls} />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Type</label>
                      <select value={values.type}
                        onChange={(e) => setFieldValue('type', e.target.value)}
                        className={inputCls}>
                        <option value="">-- Select Type --</option>
                        {['DRAW', 'PT', 'REW', 'COLOR'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className={labelCls}>Creation Date</label>
                      <input type="date" value={values.order_creation_date}
                        onChange={(e) => setFieldValue('order_creation_date', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* ── ORDER COMPONENTS (order_comp) ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Order Components</h3>
                  <FieldArray name="components">
                    {({ push, remove }) => (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-[1fr_1.6fr_0.8fr_0.6fr_0.8fr_0.8fr_auto] gap-2 px-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Material Code</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Description</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Qty</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">UOM</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Storage Loc</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Movement Type</span>
                          <span className="w-8"></span>
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
                          {values.components.map((c, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1.6fr_0.8fr_0.6fr_0.8fr_0.8fr_auto] gap-2 items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                              <input
                                list="order-material-list"
                                value={c.material_code}
                                onChange={(e) => {
                                  const code = e.target.value;
                                  setFieldValue(`components.${index}.material_code`, code);
                                  const found = materialOptions.find(m => m.value === code);
                                  if (found && !c.mat_desc) setFieldValue(`components.${index}.mat_desc`, found.desc);
                                }}
                                maxLength={20}
                                placeholder="Material"
                                className={cellInput}
                              />
                              <input value={c.mat_desc}
                                onChange={(e) => setFieldValue(`components.${index}.mat_desc`, e.target.value)}
                                placeholder="Description" className={cellInput} />
                              <input type="number" step="0.01" value={c.qty}
                                onChange={(e) => setFieldValue(`components.${index}.qty`, e.target.value)}
                                placeholder="0.00" className={`${cellInput} font-mono`} />
                              <input value={c.uom} maxLength={10}
                                onChange={(e) => setFieldValue(`components.${index}.uom`, e.target.value)}
                                placeholder="UOM" className={cellInput} />
                              <input value={c.storage_location} maxLength={10}
                                onChange={(e) => setFieldValue(`components.${index}.storage_location`, e.target.value)}
                                placeholder="Stor. Loc" className={cellInput} />
                              <input type="number" value={c.movement_type}
                                onChange={(e) => setFieldValue(`components.${index}.movement_type`, e.target.value)}
                                placeholder="e.g. 261" className={`${cellInput} font-mono`} />
                              <div className="flex items-center justify-center">
                                <button type="button"
                                  onClick={() => values.components.length > 1 ? remove(index) : showWarning('At least one component row is required')}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all" title="Remove row">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={() => push({ ...emptyComponent })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg hover:bg-blue-100 transition-all self-start mt-1">
                          <Plus size={11} /> Add Component
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* ── ORDER OPERATIONS (order_opr) ── */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Order Operations</h3>
                  <FieldArray name="operations">
                    {({ push, remove }) => (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-[0.7fr_0.9fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-1.5 px-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Opr No</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Workcenter</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Opr Qty</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 1</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 2</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 3</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 4</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 5</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Act 6</span>
                          <span className="w-8"></span>
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
                          {values.operations.map((op, index) => (
                            <div key={index} className="grid grid-cols-[0.7fr_0.9fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-1.5 items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                              <input type="number" value={op.operation_no}
                                onChange={(e) => setFieldValue(`operations.${index}.operation_no`, e.target.value)}
                                placeholder="10" className={`${cellInput} font-mono`} />
                              <input value={op.workcenter} maxLength={10}
                                onChange={(e) => setFieldValue(`operations.${index}.workcenter`, e.target.value)}
                                placeholder="WC" className={cellInput} />
                              <input type="number" step="0.01" value={op.operation_qty}
                                onChange={(e) => setFieldValue(`operations.${index}.operation_qty`, e.target.value)}
                                placeholder="0.00" className={`${cellInput} font-mono`} />
                              {[1, 2, 3, 4, 5, 6].map(n => (
                                <input key={n} type="number" value={op[`activity_${n}`]}
                                  onChange={(e) => setFieldValue(`operations.${index}.activity_${n}`, e.target.value)}
                                  placeholder="0" className={`${cellInput} font-mono`} />
                              ))}
                              <div className="flex items-center justify-center">
                                <button type="button"
                                  onClick={() => values.operations.length > 1 ? remove(index) : showWarning('At least one operation row is required')}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all" title="Remove row">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={() => push({ ...emptyOperation })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg hover:bg-blue-100 transition-all self-start mt-1">
                          <Plus size={11} /> Add Operation
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                <p className="text-[9px] text-slate-400 italic px-1">
                  Note: Order Confirmations (reverse data from SAP) are view-only and cannot be edited here.
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};


/* ── Read-only view helpers (module scope) ── */
const HeaderField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    <span className="text-xs font-semibold text-slate-700">{value ?? '—'}</span>
  </div>
);

const Th = ({ children }) => (
  <th className="px-3 py-2 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{children}</th>
);

const Td = ({ children, mono }) => (
  <td className={`px-3 py-1.5 text-xs text-slate-700 border-r border-slate-100 last:border-0 ${mono ? 'font-mono' : ''}`}>{children ?? '—'}</td>
);

/* ══════════════════════════════════════════════════════════
   ORDER VIEW (read-only) - header + components + operations + confirmations
   ══════════════════════════════════════════════════════════ */
const OrderView = ({ orderNo, onBack, onEdit }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ header: {}, components: [], operations: [], confirmations: [] });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getOrderByNo(orderNo);
        const d = res?.data || {};
        setData({
          header: d.header || {},
          components: d.components || [],
          operations: d.operations || [],
          confirmations: d.confirmations || [],
        });
      } catch (e) {
        console.error(e);
        showError('Failed to load order');
      }
      setLoading(false);
    };
    load();
  }, [orderNo]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  const { header, components, operations, confirmations } = data;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back to List
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-100">
              <FileText size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Order {header.order_no || orderNo}</span>
          </div>
          <button type="button" onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold rounded-lg hover:bg-amber-100 transition-all">
            <Edit2 size={11} /> Edit
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

          {/* Header details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Order Header</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <HeaderField label="Order No" value={header.order_no} />
              <HeaderField label="Material Code" value={header.material_code} />
              <HeaderField label="Order Qty" value={header.order_qty != null ? parseFloat(header.order_qty).toFixed(2) : null} />
              <HeaderField label="UOM" value={header.uom} />
              <HeaderField label="Storage Location" value={header.storage_location} />
              <HeaderField label="GR Qty" value={header.gr_qty != null ? parseFloat(header.gr_qty).toFixed(2) : null} />
              <HeaderField label="Status" value={header.order_status} />
              <HeaderField label="Type" value={header.type} />
              <HeaderField label="Creation Date" value={header.order_creation_date ? new Date(header.order_creation_date).toLocaleDateString() : null} />
              <HeaderField label="Updated At" value={header.updated_at ? new Date(header.updated_at).toLocaleString() : null} />
            </div>
          </div>

          {/* Components */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Components ({components.length})</h3>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr><Th>Material Code</Th><Th>Description</Th><Th>Qty</Th><Th>UOM</Th><Th>Storage Location</Th><Th>Movement Type</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {components.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">No components</td></tr>
                ) : components.map((c, i) => (
                  <tr key={c.order_comp_id ?? i} className="hover:bg-blue-50/30">
                    <Td mono>{c.material_code}</Td>
                    <Td>{c.mat_desc}</Td>
                    <Td mono>{c.qty != null ? parseFloat(c.qty).toFixed(2) : null}</Td>
                    <Td>{c.uom}</Td>
                    <Td>{c.storage_location}</Td>
                    <Td mono>{c.movement_type}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Operations */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Operations ({operations.length})</h3>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  <Th>Opr No</Th><Th>Workcenter</Th><Th>Opr Qty</Th>
                  <Th>Act 1</Th><Th>Act 2</Th><Th>Act 3</Th><Th>Act 4</Th><Th>Act 5</Th><Th>Act 6</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operations.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-6 text-center text-xs text-slate-400">No operations</td></tr>
                ) : operations.map((op, i) => (
                  <tr key={op.order_opr_id ?? i} className="hover:bg-blue-50/30">
                    <Td mono>{op.operation_no}</Td>
                    <Td>{op.workcenter}</Td>
                    <Td mono>{op.operation_qty != null ? parseFloat(op.operation_qty).toFixed(2) : null}</Td>
                    <Td mono>{op.activity_1}</Td>
                    <Td mono>{op.activity_2}</Td>
                    <Td mono>{op.activity_3}</Td>
                    <Td mono>{op.activity_4}</Td>
                    <Td mono>{op.activity_5}</Td>
                    <Td mono>{op.activity_6}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Confirmations (view-only, reverse SAP data) */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200 flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Confirmations ({confirmations.length})</h3>
              <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase">View only</span>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  <Th>Confirmation No</Th><Th>Counter</Th><Th>Cancelled</Th><Th>Opr No</Th>
                  <Th>Confirmed Qty</Th><Th>GR Document</Th><Th>Inspection Lot</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {confirmations.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-400">No confirmations</td></tr>
                ) : confirmations.map((cf, i) => (
                  <tr key={cf.order_conf_id ?? i} className="hover:bg-blue-50/30">
                    <Td mono>{cf.confrmation_no}</Td>
                    <Td mono>{cf.confirmation_counter}</Td>
                    <Td>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cf.cancelling_flag ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {cf.cancelling_flag ? 'Yes' : 'No'}
                      </span>
                    </Td>
                    <Td mono>{cf.operation_no}</Td>
                    <Td mono>{cf.confirmed_qty != null ? parseFloat(cf.confirmed_qty).toFixed(2) : null}</Td>
                    <Td mono>{cf.gr_document}</Td>
                    <Td mono>{cf.inspection_lot}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
