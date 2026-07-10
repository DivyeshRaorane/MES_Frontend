import React from 'react';
import { Formik, Form } from 'formik';
import { Scissors, Activity } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  complaint_no: "",
  c_type: "",
  raised_by: "",
  customer_name: "",
  complaint_date: "",
  reporting_date: "",
  product_details: "",
  po_no: "",
  po_qty: "",
  reject_qty: "",
  shipment_date: "",
  grn_no: "",
  test_certificate_no: "",
  complaint_feedback: ""
};


/* ══════════════════════════════════════════════════════════ */
const ComplaintRegister = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('Splicing:', v); alert('Saved!'); }}
      >
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── 2-column layout ── */}
            <div className="grid grid-cols-1 gap-3 flex-1 min-h-0">

              {/* ══ COL 1: Identification + Other ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                <ModuleCard compact title="Compliant Register" icon={<Scissors size={13} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 gap-2">
                    <ModuleCard compact title="Primary Details" icon={<Scissors size={13} className="text-blue-600" />}>
                     <div className="grid grid-cols-3 gap-2">
                    <FormikInput compact label="Complaint No" name="complaint_no" readOnly />
                    <FormikSelect compact label="Complaint Type" name="c_type"
                      options={['Select', 'Pass', 'Fail']} />
                       <FormikSelect compact label="Raised By" name="raised_by"
                      options={['Select', 'Pass', 'Fail']} />
                    </div>
                    </ModuleCard>
                    <div className="grid grid-cols-2   gap-2">
                      <ModuleCard compact title="Nature of Complaint" icon={<Scissors size={13} className="text-blue-600" />}>
                      <div className='grid grid-cols-2 gap-2'>
                      <FormikSelect compact label="Customer Name" name="customer_name"
                      options={['Select', 'Pass', 'Fail']} />
                      <FormikInput compact label="Complaint Date" name="complaint_date" type='date' />
                      <FormikInput compact label="Reporting Date" name="reporting_date" type='date' />
                      <FormikSelect compact label="Product Details" name="product_details"
                      options={['Select', 'Pass', 'Fail']} />
                      </div>
                      </ModuleCard>
                      <ModuleCard compact title="Delivery Details" icon={<Scissors size={13} className="text-blue-600" />}>
                      <div className="grid grid-cols-2   gap-2">
                      <FormikInput compact label="Purchase Order No" name="po_no" type='text' />
                      <FormikInput compact label="Purchase Order Quantity" name="po_qty" type='number' />
                      <FormikInput compact label="Reject Quantity" name="reject_qty" type='number' />
                      <FormikInput compact label="Shipment Date" name="shipment_date" type='date' />
                      <FormikInput compact label="GRN Number" name="grn_no" type='number' />
                      <FormikInput compact label="Test Certificate No" name="test_certificate_no" type='number' />
                      </div>
                      </ModuleCard>
                      </div>
                  </div>
                  <div className="mt-2">
                    <FormikTextarea compact label="Complaint Feedback" name="complaint_feedback" rows={3} placeholder="Enter remarks..." />
                  </div>
                </ModuleCard>

              </div>

              {/* ══ COL 2: Measurements ══ */}
             

            </div>

            {/* ── Actions ── */}
            <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit Entry</SubmitButton>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default ComplaintRegister;
