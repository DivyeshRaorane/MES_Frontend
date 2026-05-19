import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Plus, Minus, FileBarChart2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact inline table cell input ── */
const TInput = ({ name, type = 'text', placeholder = '' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className="w-full bg-transparent px-1 py-0.5 text-[10px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded transition-all border border-transparent focus:border-blue-200" />
);

/* ── Compact inline table cell select ── */
const TSelect = ({ name, options }) => (
  <div className="relative">
    <Field as="select" name={name}
      className="w-full appearance-none bg-transparent pl-1 pr-4 py-0.5 text-[10px] outline-none focus:bg-white rounded cursor-pointer border border-transparent focus:border-blue-200 transition-all">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </Field>
    <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
  </div>
);

/* ── Table column headers ── */
const COLS = [
  { label: '',                  w: 'w-7'   },  // checkbox
  { label: 'DT',                w: 'w-8'   },
  { label: 'Plan FKM',          w: 'w-16'  },
  { label: 'Achieved FKM',      w: 'w-20'  },
  { label: 'GAP FKM',           w: 'w-16'  },
  { label: 'Started By',        w: 'w-28'  },
  { label: 'Preform Seq.',      w: 'w-24'  },
  { label: 'Line Speed',        w: 'w-20'  },
  { label: 'Spool ID',          w: 'w-20'  },
  { label: 'Drawn FKM',         w: 'w-20'  },
  { label: 'DC',                w: 'w-14'  },
  { label: 'FC',                w: 'w-14'  },
  { label: 'Break',             w: 'w-14'  },
  { label: 'C/O Timeloss',      w: 'w-20'  },
  { label: 'FC Timeloss',       w: 'w-20'  },
  { label: 'Start Up Timeloss', w: 'w-24'  },
  { label: 'Ramp Up Timeloss',  w: 'w-24'  },
  { label: 'COBB Timeloss',     w: 'w-20'  },
  { label: 'Activities & Issues', w: 'w-32' },
];

const makeRow = (dt) => ({
  checked:        true,
  dt,
  plan_fkm:       '',
  achieved_fkm:   '',
  gap_fkm:        '',
  started_by:     '',
  preform_seq:    '',
  line_speed:     '',
  spool_id:       '',
  drawn_fkm:      '',
  dc:             'No',
  fc:             'No',
  break_val:      '0',
  co_timeloss:    '0',
  fc_timeloss:    '0',
  startup_tl:     '0',
  rampup_tl:      '0',
  cobb_tl:        '0',
  activities:     '',
});

const initialValues = {
  entry_date:     new Date().toISOString().split('T')[0],
  shift:          '',
  ground_team:    '',
  furnace_team:   '',
  die_team:       '',
  shift_incharge: '',
  total_plan:     '',
  total_draw:     '',
  gap:            '',
  total_breaks:   '',
  rows: Array.from({ length: 4 }, (_, i) => makeRow(i + 1)),
};

/* ══════════════════════════════════════════════════════════ */
const DrawShiftReport = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('Draw Shift Report:', v); alert('Saved!'); }}
      >
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
<div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Shift Report</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>                  
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
            {/* ── Header form fields ── */}
            <ModuleCard compact title="Primary Entry" icon={<FileBarChart2 size={13} className="text-blue-600" />}>
              <div className="grid grid-cols-5 gap-2">
                {/* Row 1 */}
                <FormikInput  compact label="Entry Date"     name="entry_date"     type="date" />
                <FormikSelect compact label="Shift"          name="shift"          options={['Please Select--','A','B','C','General']} />
                <FormikSelect compact label="Ground Team"    name="ground_team"    options={['Please Select','Team 1','Team 2','Team 3']} />
                <FormikSelect compact label="Furnace Team"   name="furnace_team"   options={['Please Select','Furnace A','Furnace B']} />
                <FormikInput  compact label="Total Plan"     name="total_plan"     readOnly />
                {/* Row 2 */}
                <FormikSelect compact label="Die Team"       name="die_team"       options={['Please Select','Die A','Die B']} />
                <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={['Please Select--','Incharge A','Incharge B','Supervisor X']} />
                <FormikInput  compact label="Total Draw"     name="total_draw"     readOnly />
                <FormikInput  compact label="GAP"            name="gap"            readOnly />
                <FormikInput  compact label="Total Breaks"   name="total_breaks"   readOnly />
              </div>
            </ModuleCard>

            {/* ── FieldArray table ── */}
            <FieldArray name="rows">
              {({ push, remove, form }) => (
                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                  {/* Add / Remove buttons above table */}
                  {/*<div className="flex gap-2 flex-shrink-0">
                    <button type="button"
                      onClick={() => push(makeRow(form.values.rows.length + 1))}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                      <Plus size={11} /> Add
                    </button>
                    <button type="button"
                      onClick={() => form.values.rows.length > 1 && remove(form.values.rows.length - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                      <Minus size={11} /> Remove
                    </button>
                  </div>*/}

                  {/* Scrollable table */}
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                        <thead className="sticky top-0 bg-slate-700 z-10">
                          <tr>
                            {/* Select-all checkbox */}
                            <th className="px-2 py-2 border-r border-slate-600 w-7">
                              <input type="checkbox"
                                className="w-3.5 h-3.5 rounded border-slate-400 accent-blue-400" />
                            </th>
                            {COLS.slice(1).map(({ label, w }) => (
                              <th key={label}
                                className={`px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 last:border-0 ${w}`}>
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {form.values.rows.map((row, idx) => (
                            <tr key={idx} className={`transition-colors ${row.checked ? 'hover:bg-blue-50/30' : 'bg-slate-50/50 opacity-60'}`}>
                              {/* Checkbox */}
                              <td className="px-2 py-1 text-center border-r border-slate-100">
                                <Field type="checkbox" name={`rows.${idx}.checked`}
                                  className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
                              </td>
                              {/* DT number */}
                              <td className="px-2 py-1 text-[10px] font-bold text-slate-500 text-center border-r border-slate-100">
                                {idx + 1}
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.plan_fkm`} /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.achieved_fkm`} /></td>
                              <td className="px-1 py-1 border-r border-slate-100 bg-slate-50/60">
                                {/* GAP auto-calculated display */}
                                <span className="text-[10px] font-mono text-slate-500 px-1">
                                  {(
                                    (parseFloat(row.plan_fkm) || 0) -
                                    (parseFloat(row.achieved_fkm) || 0)
                                  ).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100">
                                <TSelect name={`rows.${idx}.started_by`}
                                  options={['Please select','Operator A','Operator B','Operator C']} />
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.preform_seq`} /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.line_speed`} type="number" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.spool_id`} /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.drawn_fkm`} type="number" /></td>
                              <td className="px-1 py-1 border-r border-slate-100">
                                <TSelect name={`rows.${idx}.dc`} options={['No','Yes']} />
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100">
                                <TSelect name={`rows.${idx}.fc`} options={['No','Yes']} />
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.break_val`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.co_timeloss`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.fc_timeloss`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.startup_tl`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.rampup_tl`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TInput name={`rows.${idx}.cobb_tl`} type="number" placeholder="0" /></td>
                              <td className="px-1 py-1"><TInput name={`rows.${idx}.activities`} placeholder="Enter..." /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default DrawShiftReport;
