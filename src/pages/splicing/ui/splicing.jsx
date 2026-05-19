import React from 'react';
import { Formik, Form } from 'formik';
import { Scissors, Activity } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  test_date: today,
  barcode_id_a: '',
  barcode_id_b: '',
  mfd_a: '',
  mfd_b: '',
  product_type: '',
  brand_name: '',
  operator: '',
  result: '',
  remark: '',
  ab_side_1310: '',
  ab_side_1550: '',
  ab_side_1625: '',
  ba_side_1310: '',
  ba_side_1550: '',
  ba_side_1625: '',
  avg_splice_loss_1310: '',
  avg_splice_loss_1550: '',
  avg_splice_loss_1625: '',
  m_c_loss: '',
};

/* ── Measurement sub-section ── */
const MeasureRow = ({ title, prefix }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-0.5">{title}</p>
    <div className="grid grid-cols-3 gap-2">
      <FormikInput compact label="1310 NM" name={`${prefix}_1310`} type="number" step="0.001" placeholder="0.000" />
      <FormikInput compact label="1550 NM" name={`${prefix}_1550`} type="number" step="0.001" placeholder="0.000" />
      <FormikInput compact label="1625 NM" name={`${prefix}_1625`} type="number" step="0.001" placeholder="0.000" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Splicing = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('Splicing:', v); alert('Saved!'); }}
      >
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
              <div className="flex gap-1.5">
                <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                <SubmitButton compact type="submit">Submit</SubmitButton>
                <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
              </div>
            </div>
            {/* ── 2-column layout ── */}
            <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">

              {/* ══ COL 1: Identification + Other ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                <ModuleCard compact title="Splicing Entry" icon={<Scissors size={13} className="text-blue-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="Test Date" name="test_date" readOnly />
                    <FormikInput compact label="Barcode ID A" name="barcode_id_a" />
                    <FormikInput compact label="Barcode ID B" name="barcode_id_b" />
                    <FormikInput compact label="MFD A" name="mfd_a" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="MFD B" name="mfd_b" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="Machine Loss" name="m_c_loss" type="number" step="0.001" placeholder="0.000" />
                    <FormikSelect compact label="Product Type" name="product_type"
                      options={['Select', 'Single Mode', 'Multi Mode', 'Other']} />
                    <FormikSelect compact label="Brand Name" name="brand_name"
                      options={['Select', 'Brand A', 'Brand B', 'Brand C']} />
                    <FormikSelect compact label="Operator" name="operator"
                      options={['Select', 'Operator A', 'Operator B', 'Operator C']} />
                    <FormikSelect compact label="Result" name="result"
                      options={['Select', 'Pass', 'Fail']} />
                  </div>
                  <div className="mt-2">
                    <FormikTextarea compact label="Remark" name="remark" rows={3} placeholder="Enter remarks..." />
                  </div>
                </ModuleCard>

              </div>

              {/* ══ COL 2: Measurements ══ */}
              <ModuleCard compact title="Splice Loss Measurements" icon={<Activity size={13} className="text-indigo-600" />}>
                <div className="flex flex-col gap-3 h-full">
                  <MeasureRow title="From A → B Side" prefix="ab_side" />
                  <MeasureRow title="From B → A Side" prefix="ba_side" />
                  <MeasureRow title="Average Splice Loss" prefix="avg_splice_loss" />
                </div>
              </ModuleCard>

            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default Splicing;
