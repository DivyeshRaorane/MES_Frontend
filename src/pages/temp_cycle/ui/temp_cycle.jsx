import React from 'react';
import { Formik, Form } from 'formik';
import { Thermometer, Activity } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const today   = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const initialValues = {
  start_date:   today,
  start_time:   nowTime,
  end_date:     '',
  end_time:     '',
  fiber_id:     '',
  preform_id:   '',
  tower_no:     '',
  spool_id:     '',
  length:       '',
  test_standard:'',
  remark:       '',
  at_1310:      '',
  at_1550:      '',
  at_1625:      '',
};

const TempEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden">
      <Formik initialValues={initialValues}
        onSubmit={(v) => { console.log('Temp Entry:', v); alert('Saved!'); }}>
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Main fields ── */}
            <ModuleCard compact title="Temp Entry" icon={<Thermometer size={13} className="text-blue-600" />}>
              <div className="grid grid-cols-4 gap-2">
                <FormikInput  compact label="Start Date"        name="start_date"    type="date" />
                <FormikInput  compact label="Start Time"        name="start_time"    type="time" />
                <FormikInput  compact label="End Date"          name="end_date"      type="date" />
                <FormikInput  compact label="End Time"          name="end_time"      type="time" />
                <FormikInput  compact label="Fiber ID"          name="fiber_id" />
                <FormikInput  compact label="Preform ID"        name="preform_id" />
                <FormikInput  compact label="Tower No"          name="tower_no" />
                <FormikInput  compact label="Spool ID"          name="spool_id" />
                <FormikInput  compact label="Length"            name="length"        type="number" />
                <FormikSelect compact label="Testing Standard"  name="test_standard"
                  options={['Select','IEC 60793','ITU-T G.652','ITU-T G.657','Other']} />
                <div className="col-span-2">
                  <FormikTextarea compact label="Remark" name="remark" rows={2} placeholder="Enter remarks..." />
                </div>
              </div>
            </ModuleCard>

            {/* ── Initial Attenuation ── */}
            <ModuleCard compact title="Initial Attenuation" icon={<Activity size={13} className="text-indigo-600" />}>
              <div className="grid grid-cols-3 gap-2">
                <FormikInput compact label="At 1310 (dB)" name="at_1310" type="number" step="0.001" placeholder="0.000" />
                <FormikInput compact label="At 1550 (dB)" name="at_1550" type="number" step="0.001" placeholder="0.000" />
                <FormikInput compact label="At 1625 (dB)" name="at_1625" type="number" step="0.001" placeholder="0.000" />
              </div>
            </ModuleCard>

            {/* ── Actions ── */}
            <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit</SubmitButton>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default TempEntry;
