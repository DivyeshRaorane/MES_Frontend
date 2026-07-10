import React from 'react';
import { Formik, Form } from 'formik';
import { useLocation } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';

const today = new Date().toISOString().split('T')[0];

const defaultValues = {
  complaint_no:             '',
  date_of_closure:          today,
  complaint_closed_by:      '',
  capa_report_no:           '',
  closure_remark:           '',
  raised_by:                '',
  name_customer_vendor:     '',
  date_of_complaint:        '',
  date_reporting_complaint: '',
  complaint_type:           '',
  product_details:          '',
  purchase_order_no:        '',
  po_qty:                   '',
  reject_qty:               '',
  shipment_date:            '',
  grn_no:                   '',
  test_certificate_no:      '',
  complaint_feedback:       '',
};

const SL = ({ label, color = 'text-blue-600' }) => (
  <p className={`text-[9px] font-bold uppercase tracking-wider ${color} pb-1 border-b border-slate-100 mb-1.5`}>{label}</p>
);

/* ══════════════════════════════════════════════════════════ */
const ComplaintClosure = () => {
  const location = useLocation();
  const prefill  = location.state?.complaint || {};
  const initVals = { ...defaultValues, ...prefill };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      

        <Formik initialValues={initVals} enableReinitialize
          onSubmit={(v) => { console.log('Complaint Closure:', v); alert('Saved!'); }}>
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Row 1: Closure header fields + remark ── */}
              <ModuleCard compact title="Complaint Closure" icon={<FileCheck size={13} className="text-emerald-600" />}>
                <div className="grid grid-cols-5 gap-2">
                  <FormikSelect compact label="Complaint No."       name="complaint_no"
                    options={['--Complaint No--','CP00000001','CP00000002','CP00000003','CP00000004']} />
                  <FormikInput  compact label="Date of Closure"     name="date_of_closure"    type="date" />
                  <FormikSelect compact label="Complaint Closed By" name="complaint_closed_by"
                    options={['--Select Type--','Quality Manager','Tech Lead','Supervisor']} />
                  <FormikInput  compact label="CAPA Report No."     name="capa_report_no" />
                  <FormikSelect compact label="Raised By"           name="raised_by"
                    options={['--Select Type--','Sales','Quality','Production','Customer']} />
                </div>
                <div className="mt-2">
                  <FormikTextarea compact label="Closure Remark" name="closure_remark" rows={2}
                    placeholder="Document the resolution steps..." />
                </div>
              </ModuleCard>

              {/* ── Row 2: Two columns ── */}
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">

                {/* Left: Customer/Vendor + Nature */}
                <div className="flex flex-col gap-2">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2">
                    <SL label="Customer / Vendor Details" color="text-blue-600" />
                    <div className="grid grid-cols-2 gap-2">
                      <FormikSelect compact label="Name of Customer/Vendor" name="name_customer_vendor"
                        options={['--Select Type--','Vendor A','Vendor B','Customer X','Customer Y']} />
                      <FormikInput  compact label="Date of Complaint"           name="date_of_complaint"          type="date" />
                      <div className="col-span-2">
                        <FormikInput compact label="Date of Reporting Complaint" name="date_reporting_complaint" type="date" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2">
                    <SL label="Nature of Complaint" color="text-indigo-600" />
                    <div className="grid grid-cols-2 gap-2">
                      <FormikSelect compact label="Complaint Type" name="complaint_type"
                        options={['--Select Type--','Product Performance','Delivery','Packaging','Documentation','Other']} />
                      <FormikInput  compact label="Product Details" name="product_details" />
                    </div>
                  </div>
                </div>

                {/* Right: Delivery Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2">
                  <SL label="Delivery Details" color="text-orange-600" />
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="Purchase Order No."    name="purchase_order_no" />
                    <FormikInput compact label="PO QTY"               name="po_qty"             type="number" />
                    <FormikInput compact label="Reject QTY"           name="reject_qty"         type="number" />
                    <FormikInput compact label="Shipment Date"        name="shipment_date"      type="date" />
                    <FormikInput compact label="GRN No."              name="grn_no" />
                    <FormikInput compact label="Test Certificate No." name="test_certificate_no" />
                  </div>
                </div>
              </div>

              {/* ── Row 3: Feedback + Actions ── */}
              <div className="flex items-end gap-3 flex-shrink-0">
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2">
                  <SL label="Complaint / Feedback Details" color="text-rose-600" />
                  <FormikTextarea compact label="" name="complaint_feedback" rows={3}
                    placeholder="Enter complaint or feedback details..." />
                </div>
                <div className="flex flex-col gap-2 pb-0.5">
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <ResetButton  compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      
    </div>
  );
};

export default ComplaintClosure;
