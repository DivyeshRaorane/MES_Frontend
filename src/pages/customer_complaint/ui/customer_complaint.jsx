import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, ArrowLeft, Loader2, CheckCircle2, Clock, X } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormikInput, FormikSelect, FormikTextarea, ModuleCard } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getComplaints, getComplaintById, raiseComplaint, updateComplaint } from '../services/complaint.api';

const COMPLAINT_TYPES = [
  { label: 'Quality Issue', value: 'Quality Issue' },
  { label: 'Delivery Issue', value: 'Delivery Issue' },
  { label: 'Documentation', value: 'Documentation' },
  { label: 'Packaging', value: 'Packaging' },
  { label: 'Other', value: 'Other' },
];

const today = () => new Date().toISOString().split('T')[0];

/* ══════════════════════════════════════════════════════════ */
const CustomerComplaint = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  if (view === 'create') return <RaiseComplaint onBack={() => setView('list')} onCreated={() => setView('list')} />;
  if (view === 'detail' && selectedComplaint) return <ComplaintDetail complaint={selectedComplaint} onBack={() => { setView('list'); setSelectedComplaint(null); }} />;

  return <ComplaintList onRaise={() => setView('create')} onSelect={(c) => { setSelectedComplaint(c); setView('detail'); }} />;
};

/* ══════════════════════════════════════════════════════════
   COMPLAINT LIST
   ══════════════════════════════════════════════════════════ */
const ComplaintList = ({ onRaise, onSelect }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // '' | 'open' | 'close'

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getComplaints(filter);
      setComplaints(res?.data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, [filter]);

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    return !q || c.complaint_id?.toString().includes(q) || c.customer_name?.toLowerCase().includes(q) || c.po_no?.toLowerCase().includes(q);
  });

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={15} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Customer Complaints</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{complaints.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID, customer, PO..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-48" />
            </div>
            {/* Filter tabs */}
            <div className="flex bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              {[{ label: 'All', value: '' }, { label: 'Open', value: 'open' }, { label: 'Closed', value: 'close' }].map(f => (
                <button key={f.value} type="button" onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 text-[9px] font-bold transition-all ${filter === f.value ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={onRaise}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Raise Complaint
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div> : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['ID', 'Customer', 'Type', 'PO No', 'Date', 'Status', 'Raised By'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">No complaints found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.complaint_id} onClick={() => onSelect(c)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer">
                  <td className="px-3 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{c.complaint_id}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-100">{c.customer_name}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 border-r border-slate-100">{c.complaint_type || '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 border-r border-slate-100">{c.po_no || '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 border-r border-slate-100">{c.complaint_date ? new Date(c.complaint_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.complaint_status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.complaint_status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{c.raised_by || '—'}</td>
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
   RAISE COMPLAINT
   ══════════════════════════════════════════════════════════ */
const raiseSchema = Yup.object({
  customer_name: Yup.string().required('Customer name is required'),
  complaint_type: Yup.string().required('Complaint type is required'),
  complaint_date: Yup.string().required('Date is required'),
  raised_by: Yup.string().required('Raised By is required'),
});

const RaiseComplaint = ({ onBack, onCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const axios = (await import('axios')).default;
        const [uRes, cRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/getuser`),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/customers`),
        ]);
        setUsers(uRes.data?.data || uRes.data || []);
        setCustomers((cRes.data?.data || []).filter(c => !c.disable));
      } catch (_) {}
    })();
  }, []);

  const userOptions = users.map(u => ({ label: u.emp_name, value: u.emp_id }));
  const customerOptions = customers.map(c => ({ label: c.customer_name, value: c.customer_name }));

  const initialValues = {
    complaint_type: '', customer_name: '', complaint_date: today(), raised_by: '',
    product_details: '', po_no: '', po_quantity: '', reject_quantity: '',
    shipment_date: '', grn_no: '', test_cert_no: '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await raiseComplaint(values);
      if (res?.success) { showSuccess('Complaint raised successfully'); onCreated(); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="h-full font-sans text-slate-800 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="flex flex-col flex-1 overflow-hidden m-2">
        <Formik initialValues={initialValues} validationSchema={raiseSchema} validateOnChange={false} validateOnBlur={true} onSubmit={handleSubmit}>
          <Form className="flex flex-col flex-1 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 bg-white rounded-t-xl border border-slate-200 border-b-0 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-4">
                <button type="button" onClick={onBack}
                  className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold hover:text-blue-800 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ClipboardList size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">Raise New Complaint</h1>
                  <p className="text-[10px] text-slate-400 mt-0.5">Complete all required fields marked with *</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ResetButton compact type="button" onClick={onBack}>Cancel</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Complaint'}</SubmitButton>
              </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-12 gap-5">

                  {/* Left: Customer & Order (8 cols) */}
                  <div className="col-span-8 flex flex-col gap-5">

                    {/* Customer Section */}
                    <div className="bg-gradient-to-r from-blue-50/80 to-transparent rounded-xl border border-blue-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                          <ClipboardList size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Customer & Complaint</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormikSelect compact label="Customer Name *" name="customer_name" options={customerOptions} />
                        <FormikSelect compact label="Complaint Type *" name="complaint_type" options={COMPLAINT_TYPES} />
                        <FormikInput compact label="Complaint Date *" name="complaint_date" type="date" />
                        <FormikSelect compact label="Raised By *" name="raised_by" options={userOptions} />
                      </div>
                    </div>

                    {/* Order & Shipment Section */}
                    <div className="bg-gradient-to-r from-indigo-50/80 to-transparent rounded-xl border border-indigo-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <ClipboardList size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Order & Shipment Details</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormikInput compact label="PO No" name="po_no" placeholder="Purchase order" />
                        <FormikInput compact label="PO Qty (KM)" name="po_quantity" type="number" step="0.001" placeholder="0.000" />
                        <FormikInput compact label="Reject Qty (KM)" name="reject_quantity" type="number" step="0.001" placeholder="0.000" />
                        <FormikInput compact label="Shipment Date" name="shipment_date" type="date" />
                        <FormikInput compact label="GRN No" name="grn_no" placeholder="GRN number" />
                        <FormikInput compact label="Test Cert No" name="test_cert_no" placeholder="Certificate no." />
                      </div>
                    </div>

                  </div>

                  {/* Right: Product Details (4 cols) */}
                  <div className="col-span-4">
                    <div className="bg-gradient-to-b from-emerald-50/80 to-transparent rounded-xl border border-emerald-100 p-4 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <ClipboardList size={12} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Product / Issue Details</span>
                      </div>
                      <div className="flex-1">
                        <FormikTextarea compact label="Description" name="product_details" rows={12}
                          placeholder="Describe the product details, issue observed, batch numbers, fiber specifications, affected quantities, test results, etc..." />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </Form>
        </Formik>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COMPLAINT DETAIL (View + Change Status)
   ══════════════════════════════════════════════════════════ */
const ComplaintDetail = ({ complaint, onBack }) => {
  const [data, setData] = useState(complaint);
  const [feedback, setFeedback] = useState(complaint.complaint_feedBack || '');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = async () => {
    if (!feedback.trim()) { showError('Enter feedback before closing'); return; }
    setSubmitting(true);
    try {
      const res = await updateComplaint(data.complaint_id, {
        complaint_status: 'close',
        closed_date: today(),
        complaint_feedBack: feedback,
      });
      if (res?.success) {
        showSuccess('Complaint closed successfully');
        setData(prev => ({ ...prev, complaint_status: 'close', closed_date: today() }));
      } else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const handleReopen = async () => {
    setSubmitting(true);
    try {
      const res = await updateComplaint(data.complaint_id, { complaint_status: 'open', closed_date: null });
      if (res?.success) { showSuccess('Complaint reopened'); setData(prev => ({ ...prev, complaint_status: 'open', closed_date: null })); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const isOpen = data.complaint_status === 'open';

  return (
    <div className="h-full font-sans text-slate-800 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="flex flex-col flex-1 overflow-hidden m-2">

        {/* Header */}
        <div className="px-6 py-4 bg-white rounded-t-xl border border-slate-200 border-b-0 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold hover:text-blue-800 transition-colors">
              <ArrowLeft size={14} /> Back to List
            </button>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${isOpen ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200' : 'bg-gradient-to-br from-emerald-500 to-green-700 shadow-emerald-200'}`}>
              {isOpen ? <Clock size={20} className="text-white" /> : <CheckCircle2 size={20} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">Complaint #{data.complaint_id}</h1>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${isOpen ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                  {isOpen ? '● Open' : '● Closed'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{data.customer_name} · {data.complaint_type || 'General'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isOpen ? (
              <button type="button" onClick={handleClose} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 transition-all">
                <CheckCircle2 size={14} /> {submitting ? 'Closing...' : 'Close Complaint'}
              </button>
            ) : (
              <button type="button" onClick={handleReopen} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-amber-200 disabled:opacity-50 transition-all">
                <Clock size={14} /> {submitting ? 'Reopening...' : 'Reopen Complaint'}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-12 gap-5">

              {/* Left: Details (8 cols) */}
              <div className="col-span-8 flex flex-col gap-5">

                {/* Customer & Dates */}
                <div className="bg-gradient-to-r from-blue-50/80 to-transparent rounded-xl border border-blue-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ClipboardList size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Complaint Information</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <DetailField label="Customer Name" value={data.customer_name} highlight />
                    <DetailField label="Complaint Type" value={data.complaint_type} />
                    <DetailField label="Raised By" value={data.raised_by} />
                    <DetailField label="Complaint Date" value={data.complaint_date ? new Date(data.complaint_date).toLocaleDateString('en-IN') : '—'} />
                    <DetailField label="Closed Date" value={data.closed_date ? new Date(data.closed_date).toLocaleDateString('en-IN') : '—'} />
                    <DetailField label="Created At" value={data.created_at ? new Date(data.created_at).toLocaleString('en-IN') : '—'} />
                  </div>
                </div>

                {/* Order & Shipment */}
                <div className="bg-gradient-to-r from-indigo-50/80 to-transparent rounded-xl border border-indigo-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <ClipboardList size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Order & Shipment</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <DetailField label="PO No" value={data.po_no} />
                    <DetailField label="PO Quantity (KM)" value={data.po_quantity} />
                    <DetailField label="Reject Quantity (KM)" value={data.reject_quantity} />
                    <DetailField label="Shipment Date" value={data.shipment_date ? new Date(data.shipment_date).toLocaleDateString('en-IN') : '—'} />
                    <DetailField label="GRN No" value={data.grn_no} />
                    <DetailField label="Test Cert No" value={data.test_cert_no} />
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-slate-600 rounded-lg flex items-center justify-center">
                      <ClipboardList size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Product Details</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white rounded-lg border border-slate-100 p-3 min-h-[60px]">
                    {data.product_details || 'No details provided.'}
                  </p>
                </div>
              </div>

              {/* Right: Feedback (4 cols) */}
              <div className="col-span-4">
                <div className={`rounded-xl border p-4 h-full flex flex-col ${isOpen ? 'bg-gradient-to-b from-amber-50/80 to-transparent border-amber-200' : 'bg-gradient-to-b from-emerald-50/80 to-transparent border-emerald-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isOpen ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isOpen ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {isOpen ? 'Resolution / Feedback' : 'Closure Feedback'}
                    </span>
                  </div>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                    disabled={!isOpen} rows={12}
                    placeholder={isOpen ? "Enter resolution details, corrective actions taken, root cause analysis..." : ""}
                    className={`w-full flex-1 bg-white border rounded-xl px-4 py-3 text-xs outline-none resize-none transition-all ${
                      isOpen
                        ? 'border-amber-200 focus:ring-2 focus:ring-amber-200 focus:border-amber-400'
                        : 'border-emerald-200 opacity-80 cursor-not-allowed'
                    }`} />
                  {isOpen && (
                    <p className="text-[8px] text-amber-500 mt-2 font-medium">* Feedback is required before closing the complaint</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Detail display field ── */
const DetailField = ({ label, value, highlight }) => (
  <div>
    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
    <p className={`text-xs font-medium ${highlight ? 'text-blue-800 font-bold' : 'text-slate-700'}`}>{value || '—'}</p>
  </div>
);

export default CustomerComplaint;
