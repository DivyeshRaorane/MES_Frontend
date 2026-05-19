import React from 'react';
import { Formik, Form } from 'formik';
import { FlaskConical } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Auto-generate batch ID from tank + date ── */
const makeBatchId = (tankNo, date) => {
  if (!tankNo || tankNo === 'Select' || !date) return '';
  const d = date.replace(/-/g, '');
  const t = tankNo.replace(/\D/g, '').padStart(2, '0');
  return `D2G-${d}-T${t}`;
};

const today   = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const initialValues = {
  tank_no:          '',
  batch_id:         '',   // auto
  gas_concentration:'',
  fresh:            '',
  used:             '',
  n2:               '',
  tank_pressure:    '',
  date:             today,
  time:             nowTime,
  cycle_time:       '',
  operator:         '',
  total_no_bobbin:  '',   // automatic
  qty:              '',
};

/* ══════════════════════════════════════════════════════════ */
const D2GasConeEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('D2 Gas Cone Entry:', v); alert('Saved!'); }}
      >
        {({ values, setFieldValue, resetForm }) => {
          /* keep batch_id in sync whenever tank or date changes */
          const syncBatch = (tank, date) =>
            setFieldValue('batch_id', makeBatchId(tank, date));

          return (
            <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3">
 <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">D2 Gas</span>
              <div className="flex gap-1.5">
                <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                <SubmitButton compact type="submit">Submit</SubmitButton>
                <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
              </div>
            </div>
              {/* ── Single centred card ── */}
              <div className="flex flex-1 items-start justify-center overflow-y-auto">
                <div className="w-full">

                  <ModuleCard
                    compact
                    title="D2 Gas Cone Entry"
                    icon={<FlaskConical size={13} className="text-blue-600" />}
                  >
                    <div className="flex flex-col gap-3">

                      {/* Row 1: Tank No + Batch ID */}
                      <div className="grid grid-cols-2 gap-2">
                        <FormikSelect
                          compact
                          label="Select Tank No"
                          name="tank_no"
                          options={['Select','Tank 01','Tank 02','Tank 03','Tank 04','Tank 05']}
                          onChange={(e) => {
                            setFieldValue('tank_no', e.target.value);
                            syncBatch(e.target.value, values.date);
                          }}
                        />
                        <FormikInput
                          compact
                          label="Batch ID (Auto)"
                          name="batch_id"
                          readOnly
                          placeholder="Auto-generated..."
                        />
                      </div>

                      {/* Row 2: Gas Concentration */}
                      <FormikInput compact label="Gas Concentration" name="gas_concentration" type="number" step="0.01" placeholder="0.00" />

                      {/* Row 3: Gas Consumption group */}
                      <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gas Consumption</p>
                        <div className="grid grid-cols-3 gap-2">
                          <FormikInput compact label="Fresh"  name="fresh" type="number" step="0.001" placeholder="0.000" />
                          <FormikInput compact label="Used"   name="used"  type="number" step="0.001" placeholder="0.000" />
                          <FormikInput compact label="N2"     name="n2"    type="number" step="0.001" placeholder="0.000" />
                        </div>
                      </div>

                      {/* Row 4: Tank Pressure */}
                      <FormikInput compact label="Tank Pressure" name="tank_pressure" type="number" step="0.01" placeholder="0.00" />

                      {/* Row 5: Date + Time */}
                      <div className="grid grid-cols-2 gap-2">
                        <FormikInput
                          compact
                          label="Date"
                          name="date"
                          type="date"
                          onChange={(e) => {
                            setFieldValue('date', e.target.value);
                            syncBatch(values.tank_no, e.target.value);
                          }}
                        />
                        <FormikInput compact label="Time" name="time" type="time" />
                      </div>

                      {/* Row 6: Cycle Time + Operator */}
                      <div className="grid grid-cols-2 gap-2">
                        <FormikInput  compact label="Cycle Time (min)" name="cycle_time" type="number" placeholder="0" />
                        <FormikSelect compact label="Operator"          name="operator"
                          options={['Select','Operator A','Operator B','Operator C','Senior Op']} />
                      </div>

                      {/* Row 7: Total No of Bobbin (auto) + Qty */}
                      <div className="grid grid-cols-2 gap-2">
                        <FormikInput compact label="Total No of Bobbin (Auto)" name="total_no_bobbin" readOnly placeholder="Auto-calculated..." />
                        <FormikInput compact label="Qty"                        name="qty"             type="number" placeholder="0" />
                      </div>

                    </div>
                  </ModuleCard>

                </div>
              </div>

            </Form>
          );
        }}
      </Formik>
    </div>
  </div>
);

export default D2GasConeEntry;
