import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Clock, Plus, Minus } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input ── */
const TInput = ({ name, type = 'text', placeholder = '' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className="w-full bg-transparent px-1 py-0.5 text-[10px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded border border-transparent focus:border-blue-200 transition-all text-center min-w-[40px]" />
);

/* ── Column group definitions ── */
const SHIFT_COLS      = ['L.S TH', 'Line Speed', 'Plan', 'Total Drawn'];
const FURNACE_COLS    = ['Time Loss', 'Break Count', 'No. of CO', 'No. of Join TS', 'No. of S/C', 'F/C', 'C/O'];
const GROUND_COLS     = ['PNA.PM', 'Start Up', 'RU', 'BAD', 'BBD', 'BAC', 'MAINT', 'Utility', 'Process', 'EOT', 'BE LF'];

/* ── Field key helpers ── */
const shiftKeys   = ['ls_th', 'line_speed', 'plan', 'total_drawn'];
const furnaceKeys = ['time_loss', 'break_count', 'no_co', 'no_join_ts', 'no_sc', 'fc', 'co'];
const groundKeys  = ['pna_pm', 'start_up', 'ru', 'bad', 'bbd', 'bac', 'maint', 'utility', 'process', 'eot', 'be_lf'];

const makeRow = () => ({
  dt_no: '',
  ...shiftKeys.reduce((a, k)   => ({ ...a, [k]: '' }), {}),
  ...furnaceKeys.reduce((a, k) => ({ ...a, [k]: '' }), {}),
  ...groundKeys.reduce((a, k)  => ({ ...a, [k]: '' }), {}),
});

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  dt_shendra:    false,
  floor_type:    '',          // 'furnace' | 'ground'
  date:          today,
  shift:         '',
  phase:         '',
  operator:      '',
  shift_incharge:'',
  rows:          Array.from({ length: 5 }, makeRow),
};

/* ══════════════════════════════════════════════════════════ */
const DrawTimelossEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('Draw Timeloss Entry:', v); alert('Saved!'); }}
      >
        {({ values, setFieldValue, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Header fields ── */}
            <ModuleCard compact title="Draw Timeloss Entry" icon={<Clock size={13} className="text-blue-600" />}>
              <div className="flex flex-col gap-2">

                {/* Row 1: DT Shendra checkbox + Floor radio buttons */}
                <div className="flex items-center gap-6 pb-2 border-b border-slate-100">
                  {/* DT Shendra checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Field type="checkbox" name="dt_shendra"
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">DT Shendra</span>
                  </label>

                  {/* Floor type radio buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase mr-2">Floor:</span>
                    {[
                      { val: 'furnace', label: 'Furnace Floor' },
                      { val: 'ground',  label: 'Ground Floor'  },
                    ].map(({ val, label }) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="floor_type"
                          value={val}
                          checked={values.floor_type === val}
                          onChange={() => setFieldValue('floor_type', val)}
                          className="w-3.5 h-3.5 accent-indigo-600"
                        />
                        <span className={`text-[10px] font-bold uppercase ${
                          values.floor_type === val ? 'text-indigo-600' : 'text-slate-600'
                        }`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Row 2: Date, Shift, Phase, Operator, Shift Incharge */}
                <div className="grid grid-cols-5 gap-2">
                  <FormikInput  compact label="Date"           name="date"           type="date" />
                  <FormikSelect compact label="Shift"          name="shift"          options={['Select','A','B','C','General']} />
                  <FormikSelect compact label="Phase"          name="phase"          options={['Select','Phase 1','Phase 2','Phase 3']} />
                  <FormikSelect compact label="Operator"       name="operator"       options={['Select','Operator A','Operator B','Operator C']} />
                  <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={['Select','Incharge A','Incharge B','Supervisor X']} />
                </div>
              </div>
            </ModuleCard>

            {/* ── FieldArray table ── */}
            <FieldArray name="rows">
              {({ push, remove, form }) => (
                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                  {/* Add / Remove buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button"
                      onClick={() => push(makeRow())}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                      <Plus size={11} /> Add Row
                    </button>
                    <button type="button"
                      onClick={() => form.values.rows.length > 1 && remove(form.values.rows.length - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                      <Minus size={11} /> Remove Row
                    </button>
                  </div>

                  {/* Scrollable table */}
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                        <thead className="sticky top-0 z-20">

                          {/* ── Group header row ── */}
                          <tr className="bg-slate-800 text-white">
                            {/* DT No */}
                            <th rowSpan={2}
                              className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap border-r border-slate-600 align-middle text-center w-20">
                              DT No
                            </th>
                            {/* Shift Entry group */}
                            <th colSpan={SHIFT_COLS.length}
                              className="px-3 py-1.5 text-[9px] font-bold uppercase text-center border-r border-slate-600 bg-blue-700">
                              Shift Entry
                            </th>
                            {/* Furnace Floor group */}
                            <th colSpan={FURNACE_COLS.length}
                              className="px-3 py-1.5 text-[9px] font-bold uppercase text-center border-r border-slate-600 bg-orange-700">
                              Furnace Floor Operator
                            </th>
                            {/* Ground Floor group */}
                            <th colSpan={GROUND_COLS.length}
                              className="px-3 py-1.5 text-[9px] font-bold uppercase text-center bg-emerald-700">
                              Ground Floor Operator
                            </th>
                          </tr>

                          {/* ── Individual column headers ── */}
                          <tr className="bg-slate-700 text-slate-200">
                            {/* Shift Entry cols */}
                            {SHIFT_COLS.map(h => (
                              <th key={h} className="px-2 py-1.5 text-[8px] font-bold uppercase whitespace-nowrap border-r border-slate-600 text-center bg-blue-800/60">
                                {h}
                              </th>
                            ))}
                            {/* Furnace Floor cols */}
                            {FURNACE_COLS.map(h => (
                              <th key={h} className="px-2 py-1.5 text-[8px] font-bold uppercase whitespace-nowrap border-r border-slate-600 text-center bg-orange-800/60">
                                {h}
                              </th>
                            ))}
                            {/* Ground Floor cols */}
                            {GROUND_COLS.map((h, i) => (
                              <th key={h} className={`px-2 py-1.5 text-[8px] font-bold uppercase whitespace-nowrap text-center bg-emerald-800/60 ${i < GROUND_COLS.length - 1 ? 'border-r border-slate-600' : ''}`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {form.values.rows.map((_, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {/* DT No */}
                              <td className="px-1 py-1 border-r border-slate-200 bg-slate-50/50">
                                <TInput name={`rows.${idx}.dt_no`} placeholder={`DT-${idx + 1}`} />
                              </td>
                              {/* Shift Entry cells */}
                              {shiftKeys.map((k, i) => (
                                <td key={k} className={`px-1 py-1 bg-blue-50/20 ${i < shiftKeys.length - 1 ? 'border-r border-slate-100' : 'border-r border-slate-200'}`}>
                                  <TInput name={`rows.${idx}.${k}`} type="number" />
                                </td>
                              ))}
                              {/* Furnace Floor cells */}
                              {furnaceKeys.map((k, i) => (
                                <td key={k} className={`px-1 py-1 bg-orange-50/20 ${i < furnaceKeys.length - 1 ? 'border-r border-slate-100' : 'border-r border-slate-200'}`}>
                                  <TInput name={`rows.${idx}.${k}`} type="number" />
                                </td>
                              ))}
                              {/* Ground Floor cells */}
                              {groundKeys.map((k, i) => (
                                <td key={k} className={`px-1 py-1 bg-emerald-50/20 ${i < groundKeys.length - 1 ? 'border-r border-slate-100' : ''}`}>
                                  <TInput name={`rows.${idx}.${k}`} type="number" />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </FieldArray>

            {/* ── Reset + Submit ── */}
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

export default DrawTimelossEntry;
