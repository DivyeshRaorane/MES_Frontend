import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Search, Loader2, X } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getAllOrders, createOrder, updateOrder, getCustomers } from '../services/order.api';

/* ══════════════════════════════════════════════════════════ */
const OrderRegister = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const oRes = await getAllOrders();
      setOrders(oRes?.data || []);
    } catch (e) { console.error('Orders fetch error:', e); }
    try {
      const cRes = await getCustomers();
      console.log('Customers response:', cRes);
      setCustomers((cRes?.data || []).filter(c => !c.disable));
    } catch (e) { console.error('Customers fetch error:', e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const customerOptions = customers.map(c => ({ label: c.customer_name, value: c.customer_name }));

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.order_no?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q);
  });

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Order Register</h1>
              <p className="text-[9px] text-slate-400 mt-0.5">Manage packing orders</p>
            </div>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-2">{orders.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order/customer..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-48" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Create Order
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Order No', 'Customer', 'Required KM', 'Box Capacity', 'Stack Capacity', 'Created', 'Actions'].map(h =>
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.packing_order_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{o.order_no}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-100">{o.customer_name || '—'}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{o.required_km || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{o.box_capacity}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{o.stack_capacity}</td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <button type="button" onClick={() => { setEditItem(o); setShowForm(true); }}
                      className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                      <Edit2 size={9} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <OrderFormModal
          item={editItem}
          customerOptions={customerOptions}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchData(); }}
        />
      )}
    </div>
  );
};

/* ── Order Form Modal ── */
const OrderFormModal = ({ item, customerOptions, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    order_no: Yup.string().required('Order No is required'),
    customer_name: Yup.string().required('Customer is required'),
    required_km: Yup.number().typeError('Must be a number').required('Required KM is required'),
    box_capacity: Yup.number().typeError('Must be a number').min(1, 'Min 1').required('Box capacity is required'),
    stack_capacity: Yup.number().typeError('Must be a number').min(1, 'Min 1').required('Stack capacity is required'),
  });

  const initVals = {
    order_no: item?.order_no || '',
    customer_name: item?.customer_name || '',
    required_km: item?.required_km || '',
    box_capacity: item?.box_capacity || '',
    stack_capacity: item?.stack_capacity || '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        order_no: values.order_no,
        customer_name: values.customer_name,
        required_km: Number(values.required_km),
        box_capacity: Number(values.box_capacity),
        stack_capacity: Number(values.stack_capacity),
      };
      let res;
      if (isEdit) { res = await updateOrder(item.packing_order_id, payload); }
      else { res = await createOrder(payload); }

      if (res?.success) { showSuccess(isEdit ? 'Order updated' : 'Order created'); onSaved(); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Order' : 'Create New Order'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Order No *" name="order_no" placeholder="e.g. ORD-2026-001" readOnly={isEdit} />
              <FormikSelect compact label="Customer *" name="customer_name" options={customerOptions} />
              <FormikInput compact label="Required KM *" name="required_km" type="number" step="0.01" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-2">
                <FormikInput compact label="Box Capacity *" name="box_capacity" type="number" placeholder="Bobbins per box" />
                <FormikInput compact label="Stack Capacity *" name="stack_capacity" type="number" placeholder="Boxes per stack" />
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                <ResetButton compact type="button" onClick={onClose}>Cancel</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create Order'}
                </SubmitButton>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default OrderRegister;
