import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ClipboardList, Ticket, Copy, Check } from 'lucide-react';
import { ModuleCard, FormikInput, FormikTextarea } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';

/* ── Generate unique ticket ID ── */
const generateTicketId = () => {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ENQ-${ts}-${rand}`;
};

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  customer_name:          '',
  company_name:           '',
  phone_number:           '',
  email_address:          '',
  product_name:           '',
  quantity:               '',
  delivery_address:       '',
  expected_delivery_date: '',
  remarks:                '',
};

const validationSchema = Yup.object({
  customer_name:  Yup.string().required('Required'),
  phone_number:   Yup.string().required('Required'),
  email_address:  Yup.string().email('Invalid email').required('Required'),
  product_name:   Yup.string().required('Required'),
  quantity:       Yup.number().positive('Must be positive').required('Required'),
});

/* ══════════════════════════════════════════════════════════ */
const CustomerEnquiry = () => {
  const [ticketId,  setTicketId]  = useState(null);
  const [copied,    setCopied]    = useState(false);

  const handleSubmit = (values, { resetForm }) => {
    const id = generateTicketId();
    setTicketId(id);
    console.log('Customer Enquiry Submitted:', { ticketId: id, ...values });
    resetForm();
  };

  const copyTicket = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ resetForm, errors, touched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">

              {/* ── Two-column layout ── */}
              <div className="grid grid-cols-[1.4fr_1fr] gap-3 flex-1 min-h-0">

                {/* ══ COL 1: Enquiry Form ══ */}
                <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">

                  <ModuleCard
                    compact
                    title="Customer Enquiry Details"
                    icon={<ClipboardList size={13} className="text-blue-600" />}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {/* Customer Name */}
                      <div className="flex flex-col gap-0.5">
                        <FormikInput compact label="Customer Name" name="customer_name" placeholder="Full name..." />
                        {touched.customer_name && errors.customer_name && (
                          <span className="text-[8px] text-rose-500 ml-0.5">{errors.customer_name}</span>
                        )}
                      </div>

                      {/* Company Name */}
                      <FormikInput compact label="Company Name" name="company_name" placeholder="Company / Organisation..." />

                      {/* Phone */}
                      <div className="flex flex-col gap-0.5">
                        <FormikInput compact label="Phone Number" name="phone_number" placeholder="+91 XXXXX XXXXX" />
                        {touched.phone_number && errors.phone_number && (
                          <span className="text-[8px] text-rose-500 ml-0.5">{errors.phone_number}</span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-0.5">
                        <FormikInput compact label="Email Address" name="email_address" type="email" placeholder="email@company.com" />
                        {touched.email_address && errors.email_address && (
                          <span className="text-[8px] text-rose-500 ml-0.5">{errors.email_address}</span>
                        )}
                      </div>

                      {/* Product Name */}
                      <div className="flex flex-col gap-0.5">
                        <FormikInput compact label="Product Name" name="product_name" placeholder="e.g. G.652.D SMF" />
                        {touched.product_name && errors.product_name && (
                          <span className="text-[8px] text-rose-500 ml-0.5">{errors.product_name}</span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex flex-col gap-0.5">
                        <FormikInput compact label="Quantity (km)" name="quantity" type="number" step="0.001" placeholder="0.000" />
                        {touched.quantity && errors.quantity && (
                          <span className="text-[8px] text-rose-500 ml-0.5">{errors.quantity}</span>
                        )}
                      </div>

                      {/* Expected Delivery Date */}
                      <FormikInput compact label="Expected Delivery Date" name="expected_delivery_date" type="date" />

                      {/* Delivery Address — full width */}
                      <div className="col-span-2">
                        <FormikTextarea compact label="Delivery Address" name="delivery_address" rows={2}
                          placeholder="Full delivery address..." />
                      </div>

                      {/* Remarks — full width */}
                      <div className="col-span-2">
                        <FormikTextarea compact label="Remarks" name="remarks" rows={3}
                          placeholder="Any additional requirements or notes..." />
                      </div>
                    </div>
                  </ModuleCard>

                  {/* Actions */}
                  <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                    <ResetButton compact type="button" onClick={() => { resetForm(); setTicketId(null); }}>
                      Reset
                    </ResetButton>
                    <SubmitButton compact type="submit">Save Enquiry</SubmitButton>
                  </div>
                </div>

                {/* ══ COL 2: Ticket + Info ══ */}
                <div className="flex flex-col gap-3 min-h-0">

                  {/* Ticket ID card */}
                  <ModuleCard compact title="Enquiry Ticket" icon={<Ticket size={13} className="text-emerald-600" />}>
                    {ticketId ? (
                      <div className="flex flex-col gap-3">
                        {/* Success badge */}
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={13} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-emerald-600 uppercase">Enquiry Submitted</p>
                            <p className="text-[8px] text-emerald-500">Ticket created successfully</p>
                          </div>
                        </div>

                        {/* Ticket ID display */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Ticket ID</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-900 rounded-lg px-3 py-2.5 font-mono text-sm font-bold text-emerald-400 tracking-wider">
                              {ticketId}
                            </div>
                            <button type="button" onClick={copyTicket}
                              className={`flex items-center gap-1 px-3 py-2.5 rounded-lg text-[9px] font-bold transition-all ${
                                copied
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}>
                              {copied ? <Check size={11} /> : <Copy size={11} />}
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Date stamp */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Created On</label>
                          <span className="text-xs font-semibold text-slate-700">
                            {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                          <Ticket size={24} className="text-slate-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">No Ticket Yet</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Fill the form and click Save Enquiry</p>
                        </div>
                      </div>
                    )}
                  </ModuleCard>

                  {/* How it works info card */}
                  <ModuleCard compact title="How It Works" icon={<ClipboardList size={13} className="text-slate-500" />}>
                    <div className="flex flex-col gap-2">
                      {[
                        { step: '1', text: 'Fill in customer and product details' },
                        { step: '2', text: 'Click Save Enquiry to submit' },
                        { step: '3', text: 'A unique Ticket ID is auto-generated' },
                        { step: '4', text: 'Share the Ticket ID with the customer for tracking' },
                      ].map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[8px] font-black text-white">{step}</span>
                          </div>
                          <span className="text-[10px] text-slate-600 leading-relaxed">{text}</span>
                        </div>
                      ))}
                    </div>
                  </ModuleCard>

                </div>
                {/* ══ end col 2 ══ */}

              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CustomerEnquiry;
