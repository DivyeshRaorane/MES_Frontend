import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Droplets, Activity, Plus, Minus } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table cell ── */
const TC = ({ name, type = 'text', placeholder = '', w = 'w-20' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className={`${w} bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-center transition-all`} />
);

/* ── Compact select ── */
const TS = ({ name, options }) => (
  <div className="relative">
    <Field as="select" name={name}
      className="w-24 appearance-none bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer pr-4">
      {options.map(o => <option key={o}>{o}</option>)}
    </Field>
    <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
  </div>
);

/* ── Fixed steps per cycle (from screenshot) ── */
const STEPS = [
  { temp: 23,  rh: 50 },
  { temp: 85,  rh: 95 },
  { temp: 85,  rh: 95 },
  { temp: -10, rh: 0  },
];

const makeStep = (temp, rh) => ({
  temp, rh,
  trh_date: '', trh_time: '',
  attn_1310: '', attn_1550: '', attn_1625: '',
  tested_by: '',
});

const makeCycle = () => ({ steps: STEPS.map(s => makeStep(s.temp, s.rh)) });

const today   = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const initialValues = {
  start_date:    today,
  start_time:    nowTime,
  end_date:      '',
  end_time:      '',
  fiber_id:      '',
  preform_id:    '',
  tower_id:      '',
  spool_id:      '',
  test_standard: '',
  length:        '',
  remark:        '',
  at_1310:       '',
  at_1550:       '',
  at_1625:       '',
  cycles:        [makeCycle()],
};

/* ══════════════════════════════════════════════════════════ */
const TRH_Cycle = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden">
      <Formik initialValues={initialValues}
        onSubmit={(v) => { console.log('TRH Cycle:', v); alert('Saved!'); }}>
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Header fields ── */}
            <ModuleCard compact title="TRH Cycle Entry" icon={<Droplets size={13} className="text-violet-600" />}>
              <div className="grid grid-cols-4 gap-2">
                <FormikInput  compact label="Start Date"       name="start_date"    type="date" />
                <FormikInput  compact label="Start Time"       name="start_time"    type="time" />
                <FormikInput  compact label="End Date"         name="end_date"      type="date" />
                <FormikInput  compact label="End Time"         name="end_time"      type="time" />
                <FormikInput  compact label="Fiber ID"         name="fiber_id" />
                <FormikInput  compact label="Preform ID"       name="preform_id" />
                <FormikInput  compact label="Tower ID"         name="tower_id" />
                <FormikInput  compact label="Spool ID"         name="spool_id" />
                <FormikSelect compact label="Testing Standard" name="test_standard"
                  options={['Select','IEC 60793','ITU-T G.652','ITU-T G.657','TIA','ISO','Other']} />
                <FormikInput  compact label="Length"           name="length"        type="number" />
                <div className="col-span-2">
                  <FormikTextarea compact label="Remark" name="remark" rows={2} placeholder="General test notes..." />
                </div>
              </div>

              {/* Initial Attenuation */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity size={12} className="text-violet-600" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Initial Attenuation</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormikInput compact label="At 1310 NM" name="at_1310" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="At 1550 NM" name="at_1550" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="At 1625 NM" name="at_1625" type="number" step="0.001" placeholder="0.000" />
                </div>
              </div>
            </ModuleCard>

            {/* ── FieldArray cycles table ── */}
            <FieldArray name="cycles">
              {({ push, remove, form }) => (
                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                  {/* Add / Remove cycle buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => push(makeCycle())}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                      <Plus size={11} /> Add Cycle
                    </button>
                    <button type="button"
                      onClick={() => form.values.cycles.length > 1 && remove(form.values.cycles.length - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                      <Minus size={11} /> Remove Cycle
                    </button>
                    <span className="text-[9px] text-slate-400 font-medium self-center">
                      {form.values.cycles.length} cycle{form.values.cycles.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Scrollable table */}
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                        <thead className="sticky top-0 z-20">
                          {/* Group header */}
                          <tr className="bg-slate-800 text-white">
                            <th rowSpan={2} className="px-3 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-16 align-middle">No. of Cycle</th>
                            <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Temp (°C)</th>
                            <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">RH (%)</th>
                            <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">TRH Date</th>
                            <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">TRH Time</th>
                            <th colSpan={3} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-700">
                              Attenuation in DB/KM
                            </th>
                            <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase text-center align-middle">Tested By</th>
                          </tr>
                          <tr className="bg-slate-700 text-slate-200">
                            {['1310 NM','1550 NM','1625 NM'].map(h => (
                              <th key={h} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">{h}</th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {form.values.cycles.map((cycle, ci) =>
                            cycle.steps.map((step, si) => (
                              <tr key={`${ci}-${si}`}
                                className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${si === 0 ? 'border-t-2 border-t-slate-300' : ''}`}>
                                {/* Cycle No — spans all 4 step rows */}
                                {si === 0 && (
                                  <td rowSpan={cycle.steps.length}
                                    className="px-2 py-1 text-xs font-bold text-slate-600 text-center border-r border-slate-200 bg-slate-50/80 align-middle">
                                    {ci + 1}
                                  </td>
                                )}
                                {/* Temp */}
                                <td className="px-2 py-1 text-center border-r border-slate-100">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    step.temp === 23  ? 'bg-blue-100 text-blue-700' :
                                    step.temp === 85  ? 'bg-rose-100 text-rose-700' :
                                                        'bg-indigo-100 text-indigo-700'
                                  }`}>{step.temp}°C</span>
                                </td>
                                {/* RH */}
                                <td className="px-2 py-1 text-center border-r border-slate-100">
                                  <span className="text-[10px] font-bold text-blue-600">{step.rh}%</span>
                                </td>
                                {/* TRH Date */}
                                <td className="px-1 py-1 border-r border-slate-100">
                                  <TC name={`cycles.${ci}.steps.${si}.trh_date`} type="date" w="w-28" />
                                </td>
                                {/* TRH Time */}
                                <td className="px-1 py-1 border-r border-slate-100">
                                  <TC name={`cycles.${ci}.steps.${si}.trh_time`} type="time" w="w-24" />
                                </td>
                                {/* Attenuation */}
                                <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20">
                                  <TC name={`cycles.${ci}.steps.${si}.attn_1310`} placeholder="—" />
                                </td>
                                <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20">
                                  <TC name={`cycles.${ci}.steps.${si}.attn_1550`} placeholder="—" />
                                </td>
                                <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20">
                                  <TC name={`cycles.${ci}.steps.${si}.attn_1625`} placeholder="—" />
                                </td>
                                {/* Tested By */}
                                <td className="px-1 py-1">
                                  <TS name={`cycles.${ci}.steps.${si}.tested_by`}
                                    options={['Select','Op A','Op B','Op C','Manager']} />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </FieldArray>

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

export default TRH_Cycle;
