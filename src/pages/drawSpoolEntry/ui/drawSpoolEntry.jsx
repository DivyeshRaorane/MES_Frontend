import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Plus, Trash2 } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, FormikTextarea } from '../../../components/common_fields';

/* ── Compact section label ── */
const SL = ({ title, color = 'text-blue-700' }) => (
  <p className={`text-[9px] font-bold uppercase tracking-wider ${color} border-b border-slate-100 pb-0.5 mb-1`}>{title}</p>
);

/* ── Compact table cell ── */
const TCell = ({ name }) => (
  <Field name={name}
    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 transition-all" />
);

const getCurrentShift = () => {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return 'A';
  if (h >= 15 && h < 23) return 'B';
  return 'C';
};

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  tower_no: '', preform_id: 'PF-AUTO-9982', shift: getCurrentShift(),
  draw_barcode_id: '', drawn_len_km: '0', cumm_len_km: '0',
  start_date: today, start_time: '', spool_id: '', preform_wt_kg: '0',
  drawn_wt_kg: '0', theoretical_len_km: '0',
  end_date: today, end_time: '', piece_no: '', preform_type: '',
  adjust_km: '0.15', product_type: '',
  line_speed: '0', bot_end_scrap: '', draw_seq: '', power: '0',
  bare_fiber_tension: '0', allan_key_taken_at: '0',
  die_no: '', die_cleaned: '', fsu: '', temp: '0',
  humidity: '0', change_over_time: '0',
  undrawn: '', wind_spool_cndtn: '', spool_condition: '',
  draw_break: '', spool_end_type: '',
  remarks: '', manual_entry_reason: '',
  shift_inc: '', process_opr: '', furnace_opr: '',
  die_opr: '', rampup_opr: '', spool_end_opr: '',
  primary_pressure: '', primary_cons_kg: '', primary_coating: '',
  primary_batch: '', secondary_pressure: '', secondary_cons_kg: '',
  secondary_coating: '', secondary_batch: '',
  draw_flaws: [],
};

const CONSUMPTION_TABS = ['Coating'];
{/*['Coating', 'Furnace Gas', 'Nitrogen Gas', 'Helium Gas', 'CO2 Gas'];*/ }

/* ══════════════════════════════════════════════════════════ */
const DrawSpoolEntry = () => {
  const [activeConsTab, setActiveConsTab] = useState('Coating');

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={initialValues} onSubmit={(v) => console.log('Submit:', v)}>
          {({ values, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Top action bar ── */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Spool Entry</span>
                <div className="flex gap-1.5">
                  <button type="button" className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">Save</button>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>

              {/* ── 2-column body — no scroll ── */}
              <div className="flex gap-2 flex-1 min-h-0 px-2 py-2 overflow-hidden">

                {/* ══ LEFT COLUMN ══ */}
                <div className="flex flex-col gap-2 flex-1 min-w-0 overflow-hidden">

                  {/* Initial Parameters */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Initial Parameters" />
                    <div className="grid grid-cols-8 gap-x-2 gap-y-1">
                      <FormikSelect compact label="Tower No" name="tower_no" options={['Select', 'Tower 1', 'Tower 2', 'Tower 3']} />
                      <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                      <FormikInput compact label="Preform Wt(KG)" name="preform_wt_kg" type="number" />
                      <FormikInput compact label="Preform Type" name="preform_type" readOnly />
                      <FormikInput compact label="Spool ID" name="draw_barcode_id" />
                      <FormikInput compact label="Product Type" name="product_type" readOnly />
                      <FormikInput compact label="Drawn Wt(KG)" name="drawn_wt_kg" type="number" />
                      <FormikInput compact label="Drawn Len(KM)" name="drawn_len_km" type="number" />
                      <FormikInput compact label="Balance Weight" name="balance_weight" type="number" />
                      <FormikSelect compact label="Shift" name="shift" options={['A', 'B', 'C']} />

                      <FormikInput compact label="Start Date" name="start_date" type="date" />
                      <FormikInput compact label="Start Time" name="start_time" type="time" />

                      <FormikInput compact label="End Date" name="end_date" type="date" />
                      <FormikInput compact label="End Time" name="end_time" type="time" />
                      <FormikInput compact label="Entry Date" name="entry_date" type="date" />
                      <FormikInput compact label="Spool Number" name="spool_no" type='number' />

                    </div>
                  </div>

                  {/* Draw Parameters */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Draw Parameters" />
                    <div className="grid grid-cols-8 gap-x-2 gap-y-1">
                      <FormikInput compact label="Draw Line Speed" name="line_speed" type="number" />
                      <FormikInput compact label="Draw Tension" name="draw_tenstion" />
                      <FormikInput compact label="Furnace Power" name="furnace_power" />
                      <FormikInput compact label="Preform Sequence" name="preform_sequence" type="number" />
                      <FormikInput compact label="Furnace Argon" name="furnace_argon" type="number" />
                      <FormikInput compact label="Furnace HE" name="furnace_he" type="number" />

                      <FormikInput compact label="Tube HE" name="tube_he" />
                      <FormikInput compact label="CO2 Flow" name="co2_flow" />
                      <FormikInput compact label="N2 Flow" name="n2_flow" />
                      <FormikInput compact label="UV Air" name="uv_air" type="text" />
                      <FormikSelect compact label="Winding Observation" name="winding_observation" options={['Select', 'Yes', 'No']} />
                      <FormikSelect compact label="Scr Observation" name="scratches_observation" options={['Select', 'Yes', 'No']} />

                      <FormikInput compact label="Top End Scrap" name="top_end_scrap" />
                      <FormikInput compact label="Bottom End Scrap" name="bottom_end_csrap" />

                      <FormikSelect compact label="Die Clean" name="die_clean" options={['Select', 'Yes', 'No']} />
                      <FormikSelect compact label="Spool Status" name="spool_status" options={['Select', 'Ok', 'Not Ok']} />
                      {values.spool_status == "Not Ok" && (
                        <FormikSelect 
                        compact
                        label="Reason"
                        name="spool_not_ok_reason"
                        options={["Select","Scrap","Hold","Rework"]}
                        />
                      )}
                      <FormikSelect
                        compact
                        label="Indication Fiber Cut"
                        name="indication_fiber_cut"
                        options={['Select', 'cut', 'sample', 'break', 'trial']}
                      />

                      {/* Conditional Reason Dropdown */}
                      {values.indication_fiber_cut !== 'Select' && (
                        <FormikSelect
                          compact
                          label={`${values.indication_fiber_cut} Reason`}
                          name="indication_reason"
                          options={['Select', 'Yes', 'No']}
                        />
                      )}
                      <div className="col-span-3">
                        <FormikTextarea compact label="Remarks" name="remarks" rows={1} placeholder="" />
                      </div>

                    </div>
                  </div>

                  {/* Consumption Details */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-1 min-h-0">
                    <SL title="Consumption Details" />
                    {/* Tab bar */}
                    <div className="flex gap-1 mb-1.5">
                      {CONSUMPTION_TABS.map(tab => (
                        <button key={tab} type="button" onClick={() => setActiveConsTab(tab)}
                          className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all ${activeConsTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}>
                          {tab}
                        </button>
                      ))}
                    </div>
                    {activeConsTab === 'Coating' && (
                      <div className="grid grid-cols-5 gap-x-2 gap-y-1">
                        <FormikSelect compact label="Primary Coating" name="primary_coating" options={['Select', 'P-COAT-V1', 'P-COAT-V2']} />
                        <FormikSelect compact label="Secondary Coating" name="secondary_coating" options={['Select', 'S-COAT-V1', 'S-COAT-V2']} />
                        <FormikSelect compact label="Coating Type" name="coating_type" options={['Select', 'S-Batch-01', 'S-Batch-02']} />
                        <FormikInput compact label="Primary Pressure" name="primary_pressure" type="number" />
                        <FormikInput compact label="Secondary Pressure" name="secondary_pressure" type="number" />
                        <FormikSelect compact label="Primary Batch" name="primary_batch" options={['Select', 'Batch-01', 'Batch-02']} />
                        <FormikSelect compact label="Secondary Batch" name="secondary_batch" options={['Select', 'S-Batch-01', 'S-Batch-02']} />
                        <FormikInput compact label="Process Type" name="process_type" type="text" />
                      </div>
                    )}
                    {activeConsTab !== 'Coating' && (
                      <p className="text-[9px] text-slate-400 text-center py-3">{activeConsTab} fields — coming soon</p>
                    )}
                  </div>

                </div>
                {/* ══ end left column ══ */}

                {/* ══ RIGHT COLUMN ══ */}
                <div className="flex flex-col gap-2 w-72 flex-shrink-0 overflow-hidden">

                  {/* Operator Details */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Operator Details" />
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <FormikSelect compact label="Shift Inc." name="shift_inc" options={['Please Select', 'Incharge A', 'Incharge B']} />
                      <FormikSelect compact label="Furnace Opr." name="furnace_opr" options={['Please Select', 'Op C', 'Op D']} />
                      <FormikSelect compact label="Die Opr." name="die_opr" options={['Please Select', 'Op E', 'Op F']} />
                      <FormikSelect compact label="Ground Opr." name="ground_opr" options={['Please Select', 'Op G', 'Op H']} />
                    </div>
                  </div>

                  {/* Draw Flaws Details */}
                  <FieldArray name="draw_flaws">
                    {({ push, remove, form }) => (
                      <div className="border border-slate-200 rounded bg-white flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">Draw Flaws Details</span>
                          <div className="flex gap-1">
                            <button type="button"
                              className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded hover:bg-blue-700 transition-all">
                              Get Draw Flaws
                            </button>
                            <button type="button"
                              onClick={() => push({ flaw: '', position1: '', position2: '', defect_len: '', act_cut_len: '' })}
                              className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-bold rounded hover:bg-emerald-700 transition-all">
                              <Plus size={9} />Add Rows
                            </button>
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 px-2 py-1">
                          {form.values.draw_flaws.length === 0 ? (
                            <p className="text-[9px] text-slate-400 text-center py-4">Click "Add Rows" to add entries</p>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Flaw', 'P1', 'P2', 'Def Len', 'Act Cut', ''].map(h => (
                                    <th key={h} className="px-0.5 py-1 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.values.draw_flaws.map((_, idx) => (
                                  <tr key={idx}>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.flaw`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.position1`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.position2`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.defect_len`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.act_cut_len`} /></td>
                                    <td className="px-0.5 py-0.5 text-center">
                                      <button type="button" onClick={() => remove(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={10} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </FieldArray>

                </div>
                {/* ══ end right column ══ */}

              </div>
              {/* ── end 2-col body ── */}

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DrawSpoolEntry;
