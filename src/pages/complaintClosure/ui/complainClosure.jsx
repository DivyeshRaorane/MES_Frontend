import React from 'react';
import { Formik, Form } from 'formik';
import { useLocation } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

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

/* ── Section label ── */
const SectionLabel = ({ label, color = 'text-blue-600' }) => (
  <p className={`text-[9px] font-bold uppercase tracking-wider ${color} mb-1.5`}>{label}</p>
);

/* ══════════════════════════════════════════════════════════ */
const ComplaintClosure = () => {
  const location = useLocation();
  /* Pre-fill from complaint table row click */
  const prefill  = location.state?.complaint || {};
  const initVals = { ...defaultValues, ...prefill };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initVals}
          enableReinitialize
          onSubmit={(v) => { console.log('Complaint Closure:', v); alert('Saved!'); }}
        >
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-y-auto px-4 py-3 gap-3">

              {/* ── Section 1: Complaint Closure ── */}
              <ModuleCard compact title="Complaint Closure" icon={<FileCheck size={13} className="text-emerald-600" />}>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-4 gap-2">
                    <FormikSelect compact label="Complaint No."       name="complaint_no"
                      options={['--Complaint No--','CP00000001','CP00000002','CP00000003','CP00000004']} />
                    <FormikInput  compact label="Date of Closure"     name="date_of_closure"    type="date" />
                    <FormikSelect compact label="Complaint Closed By" name="complaint_closed_by"
                      options={['--Select Type--','Quality Manager','Tech Lead','Supervisor']} />
                    <FormikInput  compact label="CAPA Report No."     name="capa_report_no" />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormikTextarea compact label="Closure Remark" name="closure_remark" rows={3}
                        placeholder="Document the resolution steps and verification details..." />
                    </div>
                    <div className="pb-0.5">
                      <SubmitButton compact type="submit">Submit</SubmitButton>
                    </div>
                  </div>
                </div>
              </ModuleCard>

              {/* ── Section 2: Raised By ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                <div className="grid grid-cols-4 gap-2">
                  <FormikSelect compact label="Raised By" name="raised_by"
                    options={['--Select Type--','Sales','Quality','Production','Customer']} />
                </div>
              </div>

              {/* ── Section 3: Customer/Vendor Details ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                <SectionLabel label="Customer/Vendor Details" color="text-blue-600" />
                <div className="grid grid-cols-3 gap-2">
                  <FormikSelect compact label="Name of Customer/Vendor" name="name_customer_vendor"
                    options={['--Select Type--','Vendor A','Vendor B','Customer X','Customer Y']} />
                  <FormikInput  compact label="Date of Complaint"           name="date_of_complaint"          type="date" />
                  <FormikInput  compact label="Date of Reporting Complaint" name="date_reporting_complaint"   type="date" />
                </div>
              </div>

              {/* ── Section 4: Nature of Complaint ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                <SectionLabel label="Nature of Complaint" color="text-indigo-600" />
                <div className="grid grid-cols-3 gap-2">
                  <FormikSelect compact label="Complaint Type" name="complaint_type"
                    options={['--Select Type--','Product Performance','Delivery','Packaging','Documentation','Other']} />
                  <div className="col-span-2">
                    <FormikInput compact label="Product Details" name="product_details" />
                  </div>
                </div>
              </div>

              {/* ── Section 5: Delivery Details ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                <SectionLabel label="Delivery Details" color="text-orange-600" />
                <div className="grid grid-cols-4 gap-2">
                  <FormikInput compact label="Purchase Order No."    name="purchase_order_no" />
                  <FormikInput compact label="PO QTY"               name="po_qty"             type="number" />
                  <FormikInput compact label="Reject QTY"           name="reject_qty"         type="number" />
                  <FormikInput compact label="Shipment Date"        name="shipment_date"      type="date" />
                  <FormikInput compact label="GRN No."              name="grn_no" />
                  <FormikInput compact label="Test Certificate No." name="test_certificate_no" />
                </div>
              </div>

              {/* ── Section 6: Complaint/Feedback Details ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
                <SectionLabel label="Complaint/Feedback Details" color="text-rose-600" />
                <FormikTextarea compact label="" name="complaint_feedback" rows={4}
                  placeholder="Enter complaint or feedback details..." />
              </div>

              {/* ── Reset ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ComplaintClosure;
