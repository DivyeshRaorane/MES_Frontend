import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
  ClipboardList, ShoppingCart, Warehouse, Truck,
  Check, ChevronRight, ChevronLeft, Save
} from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';

/* ── Stage definitions ── */
const STAGES = [
  { key: 'enquiry',   label: 'Enquiry Details',          icon: ClipboardList, color: 'text-blue-500'    },
  { key: 'order',     label: 'Order Management',          icon: ShoppingCart,  color: 'text-indigo-500'  },
  { key: 'inventory', label: 'Inventory & Availability',  icon: Warehouse,     color: 'text-amber-500'   },
  { key: 'dispatch',  label: 'Dispatch & Shipment',       icon: Truck,         color: 'text-emerald-500' },
];

/* ── Progress Bar ── */
const ProgressBar = ({ currentStage, completedUpTo, onStageClick }) => (
  <div className="flex items-center gap-0 flex-shrink-0">
    {STAGES.map((stage, idx) => {
      const Icon      = stage.icon;
      const isActive  = idx === currentStage;
      const isDone    = idx < completedUpTo;
      const isClickable = idx <= completedUpTo;

      return (
        <React.Fragment key={stage.key}>
          <button
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStageClick(idx)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : isDone
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              isActive ? 'bg-white/20' : isDone ? 'bg-emerald-200' : 'bg-slate-200'
            }`}>
              {isDone && !isActive
                ? <Check size={11} className="text-emerald-600" />
                : <Icon size={11} className={isActive ? 'text-white' : ''} />
              }
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap hidden sm:block">
              {stage.label}
            </span>
            <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full hidden sm:block ${
              isActive ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-400'
            }`}>
              {idx + 1}
            </span>
          </button>

          {/* Connector line */}
          {idx < STAGES.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
              idx < completedUpTo ? 'bg-emerald-400' : 'bg-slate-200'
            }`} style={{ minWidth: '20px' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Stage 1: Enquiry Details (read-only) ── */
const EnquiryStage = ({ data }) => (
  <ModuleCard compact title="Customer Enquiry Details" icon={<ClipboardList size={13} className="text-blue-600" />}>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Customer Name',          val: data?.customer_name          },
        { label: 'Company Name',           val: data?.company_name           },
        { label: 'Phone Number',           val: data?.phone_number           },
        { label: 'Email Address',          val: data?.email_address          },
        { label: 'Product Name',           val: data?.product_name           },
        { label: 'Quantity (km)',          val: data?.quantity               },
        { label: 'Expected Delivery Date', val: data?.expected_delivery_date },
      ].map(({ label, val }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">{label}</span>
          <div className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 font-medium">
            {val || '—'}
          </div>
        </div>
      ))}
      <div className="col-span-3 flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Delivery Address</span>
        <div className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700">{data?.delivery_address || '—'}</div>
      </div>
      {data?.remarks && (
        <div className="col-span-3 flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">Remarks</span>
          <div className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700">{data.remarks}</div>
        </div>
      )}
    </div>
  </ModuleCard>
);

/* ── Stage 2: Order Management ── */
const OrderStage = ({ initialValues, onSave }) => (
  <Formik initialValues={initialValues} enableReinitialize
    onSubmit={onSave}>
    {({ resetForm }) => (
      <Form className="flex flex-col gap-3">
        <ModuleCard compact title="Order Management" icon={<ShoppingCart size={13} className="text-indigo-600" />}>
          <div className="grid grid-cols-3 gap-2">
            <FormikInput  compact label="Order No"          name="order_no" />
            <FormikInput  compact label="Quotation Amount"  name="quotation_amount" />
            <FormikInput  compact label="Approved By"       name="approved_by" />
            <FormikSelect compact label="Order Status"      name="order_status"
              options={['Select','Pending','Confirmed','Cancelled','On Hold']} />
            <FormikInput  compact label="Payment Terms"     name="payment_terms" placeholder="e.g. 30 days net" />
            <FormikSelect compact label="Production Status" name="production_status"
              options={['Select','Not Started','In Production','Completed','Quality Check']} />
          </div>
        </ModuleCard>
        <div className="flex justify-between gap-3">
          <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
          <SubmitButton compact type="submit">Save & Continue</SubmitButton>
        </div>
      </Form>
    )}
  </Formik>
);

/* ── Stage 3: Inventory & Availability ── */
const InventoryStage = ({ initialValues, onSave }) => (
  <Formik initialValues={initialValues} enableReinitialize onSubmit={onSave}>
    {({ resetForm }) => (
      <Form className="flex flex-col gap-3">
        <ModuleCard compact title="Inventory & Availability" icon={<Warehouse size={13} className="text-amber-600" />}>
          <div className="grid grid-cols-2 gap-2">
            <FormikSelect compact label="Stock Availability"  name="stock_availability"
              options={['Select','Available','Partially Available','Out of Stock','On Order']} />
            <FormikInput  compact label="Warehouse Location"  name="warehouse_location" placeholder="e.g. WH-A Block 3" />
            <FormikInput  compact label="Reserved Quantity"   name="reserved_quantity"  placeholder="e.g. 500 km" />
            <div className="col-span-2">
              <FormikTextarea compact label="Inventory Notes" name="inventory_notes" rows={3} placeholder="Any notes about stock..." />
            </div>
          </div>
        </ModuleCard>
        <div className="flex justify-between gap-3">
          <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
          <SubmitButton compact type="submit">Save & Continue</SubmitButton>
        </div>
      </Form>
    )}
  </Formik>
);

/* ── Stage 4: Dispatch & Shipment ── */
const DispatchStage = ({ initialValues, onSave }) => (
  <Formik initialValues={initialValues} enableReinitialize onSubmit={onSave}>
    {({ resetForm }) => (
      <Form className="flex flex-col gap-3">
        <ModuleCard compact title="Dispatch & Shipment Details" icon={<Truck size={13} className="text-emerald-600" />}>
          <div className="grid grid-cols-3 gap-2">
            <FormikInput  compact label="Dispatch Date"      name="dispatch_date"      type="date" />
            <FormikInput  compact label="Transporter Name"   name="transporter_name"   placeholder="e.g. Blue Dart" />
            <FormikInput  compact label="Vehicle Number"     name="vehicle_number"     placeholder="e.g. MH-01-AB-1234" />
            <FormikInput  compact label="Tracking Number"    name="tracking_number"    placeholder="Tracking / AWB no." />
            <FormikSelect compact label="Shipment Status"    name="shipment_status"
              options={['Select','Pending','Dispatched','In Transit','Delivered','Returned']} />
            <FormikInput  compact label="Delivery Date"      name="delivery_date"      type="date" />
          </div>
        </ModuleCard>
        <div className="flex justify-between gap-3">
          <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
          <SubmitButton compact type="submit">
            <Save size={12} /> Complete & Save
          </SubmitButton>
        </div>
      </Form>
    )}
  </Formik>
);

/* ══════════════════════════════════════════════════════════ */
const CustomerEnquiryFormPage = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { enquiry, jumpStage = 0 } = location.state || {};

  /* Stage data — start from what was passed in */
  const [stageData, setStageData] = useState({
    enquiry:   enquiry?.enquiry   || {},
    order:     enquiry?.order     || { order_no:'', quotation_amount:'', approved_by:'', order_status:'', payment_terms:'', production_status:'' },
    inventory: enquiry?.inventory || { stock_availability:'', warehouse_location:'', reserved_quantity:'', inventory_notes:'' },
    dispatch:  enquiry?.dispatch  || { dispatch_date:'', transporter_name:'', vehicle_number:'', tracking_number:'', shipment_status:'', delivery_date:'' },
  });

  const [currentStage,   setCurrentStage]   = useState(jumpStage);
  const [completedUpTo,  setCompletedUpTo]  = useState(jumpStage);  // highest stage reached

  const handleSaveStage = (stageKey, values) => {
    const idx = STAGES.findIndex(s => s.key === stageKey);
    setStageData(prev => ({ ...prev, [stageKey]: values }));
    const nextIdx = idx + 1;
    if (nextIdx < STAGES.length) {
      setCurrentStage(nextIdx);
      setCompletedUpTo(prev => Math.max(prev, nextIdx));
    } else {
      /* All stages done */
      console.log('All stages complete:', stageData);
      alert('Enquiry workflow completed successfully!');
      navigate('/order/enquirylist');
    }
  };

  if (!enquiry) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No enquiry data. <button onClick={() => navigate('/order/enquirylist')} className="ml-2 text-blue-600 underline">Go back to list</button>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Top: ticket info + progress bar ── */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex flex-col gap-2 flex-shrink-0">
          {/* Ticket info row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Ticket</span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {enquiry.ticket_no}
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-600">{enquiry.enquiry?.customer_name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{enquiry.enquiry?.product_name}</span>
            <button type="button" onClick={() => navigate('/order/enquirylist')}
              className="ml-auto flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-blue-600 transition-colors">
              <ChevronLeft size={12} /> Back to List
            </button>
          </div>

          {/* Progress bar */}
          <ProgressBar
            currentStage={currentStage}
            completedUpTo={completedUpTo}
            onStageClick={(idx) => setCurrentStage(idx)}
          />
        </div>

        {/* ── Stage content ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {currentStage === 0 && (
            <div className="flex flex-col gap-3">
              <EnquiryStage data={stageData.enquiry} />
              <div className="flex justify-end">
                <button type="button"
                  onClick={() => { setCurrentStage(1); setCompletedUpTo(prev => Math.max(prev, 1)); }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">
                  Next: Order Management <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {currentStage === 1 && (
            <OrderStage
              initialValues={stageData.order}
              onSave={(v) => handleSaveStage('order', v)}
            />
          )}

          {currentStage === 2 && (
            <InventoryStage
              initialValues={stageData.inventory}
              onSave={(v) => handleSaveStage('inventory', v)}
            />
          )}

          {currentStage === 3 && (
            <DispatchStage
              initialValues={stageData.dispatch}
              onSave={(v) => handleSaveStage('dispatch', v)}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerEnquiryFormPage;
