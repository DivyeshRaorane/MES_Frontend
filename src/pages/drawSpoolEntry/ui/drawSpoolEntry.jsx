import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Monitor, Database, Layers, Activity, Wind, Table, Eye, Cpu } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, FormikTextarea, ModuleCard } from '../../../components/common_fields';

const getCurrentShift = () => {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return 'A';
  if (h >= 15 && h < 23) return 'B';
  return 'C';
};

const dummyPitchData = [
  { flowType: 'Standard',  startLength: 0,  endLength: 50,  pitchChange: 50 },
  { flowType: 'HighSpeed', startLength: 50, endLength: 120, pitchChange: 70 },
];

const initialValues = {
  drawTower: '', preformId: 'PF-AUTO-9982', preformWeight: '',
  preformType: '', productType: '', spoolId: '',
  entryDate: new Date().toISOString().split('T')[0],
  shift: getCurrentShift(),
  startDate: '', startTime: '', endDate: '', endTime: '',
  drawnLength: '', spoolStatus: 'OK', drawnSpool: '', remark: '',
  primaryCoat: 'P-COAT-V1', secondaryCoat: 'S-COAT-V2',
  primPress: '', secPress: '', primCoatBatch: '', secCoatBatch: '',
  drawLineSpeed: '', drawTension: '', furnacePower: '', preSequence: '',
  furnaceArgon: '', furnaceHe: '', tubeHe: '', co2Flow: '', uvN2: '', uvAir: '',
  shiftIncharge: '', furnaceOperator: '', dieOperator: '', rampupOperator: '', startupOperator: '',
  pitchDetails: dummyPitchData,
  drawnBreak: false, breakReason: '', windingObs: '', scratchesObs: '',
  spoolChangeOver: '', dieClean: '',
  totalPitchChangeLength: '120', totalScrap: '5.2',
};

/* ══════════════════════════════════════════════════════════ */
const DrawSpoolEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
      <Formik initialValues={initialValues} onSubmit={(v) => console.log('Submit:', v)}>
        {({ values }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3">

            {/* ── 3-column grid fills remaining height ── */}
            <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">

              {/* ══ COL 1: Main Requirements ══ */}
              <ModuleCard
                compact
                title="Main Requirements"
                icon={<Database size={13} className="text-blue-600" />}
              >
                {/* inner scroll if viewport is very short */}
                <div className="flex flex-col gap-2 overflow-y-auto h-full">
                  <div className="grid grid-cols-3 gap-2">
                    <FormikSelect compact label="Draw Tower"    name="drawTower"     options={['Select','Tower 1','Tower 2']} />
                    <FormikInput  compact label="Preform ID"    name="preformId"     readOnly />
                    <FormikInput  compact label="Preform Wt"    name="preformWeight" type="number" step="0.01" />
                    <FormikSelect compact label="Preform Type"  name="preformType"   options={['Select','Type A','Type B']} />
                    <FormikSelect compact label="Product Type"  name="productType"   options={['Select','Single Mode','Multi Mode']} />
                    <FormikInput  compact label="Spool ID"      name="spoolId" />
                    <FormikInput  compact label="Entry Date"    name="entryDate"     type="date" />
                    <FormikInput  compact label="Shift"         name="shift"         readOnly />
                    <FormikInput  compact label="Drawn Length"  name="drawnLength"   type="number" />
                    <FormikInput  compact label="Start Date"    name="startDate"     type="date" />
                    <FormikInput  compact label="Start Time"    name="startTime"     type="time" />
                    <FormikInput  compact label="End Date"      name="endDate"       type="date" />
                    <FormikInput  compact label="End Time"      name="endTime"       type="time" />
                    <FormikSelect compact label="Winding Obs"   name="windingObs"    options={['Select','Poor','Good']} />
                    <FormikSelect compact label="Scratches Obs" name="scratchesObs"  options={['Select','Nil','Minor','Major']} />
                    <FormikSelect compact label="Die Clean"     name="dieClean"      options={['Select','Yes','No']} />
                    <FormikSelect compact label="Spool Status"  name="spoolStatus"   options={['OK','Not OK']} />
                    {values.spoolStatus === 'Not OK' && (
                      <FormikSelect compact label="Drawn Spool" name="drawnSpool"   options={['Select','Scrap','Hold','Rework']} />
                    )}
                    {/* Work Details fields */}
                    <FormikSelect compact label="Shift Incharge"   name="shiftIncharge"   options={['Select','Incharge A','Incharge B']} />
                    <FormikSelect compact label="Furnace Operator" name="furnaceOperator" options={['Select','Operator 1','Operator 2']} />
                    <FormikSelect compact label="Die Operator"     name="dieOperator"     options={['Select','Op 3','Op 4']} />
                    <FormikSelect compact label="Rampup Operator"  name="rampupOperator"  options={['Select','Op 5','Op 6']} />
                    <FormikSelect compact label="StartUp Operator" name="startupOperator" options={['Select','Op 7','Op 8']} />
                  </div>
                  <FormikTextarea compact label="Remark" name="remark" rows={2} placeholder="Enter remarks..." />
                </div>
              </ModuleCard>

              {/* ══ COL 2: Coating | Process Params | Gas Flow ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                <ModuleCard compact title="Coating & Batch" icon={<Layers size={13} className="text-indigo-600" />}>
                  <div className="grid grid-cols-3 gap-2">
                    <FormikInput  compact label="Primary Coat"    name="primaryCoat"   readOnly />
                    <FormikInput  compact label="Secondary Coat"  name="secondaryCoat" readOnly />
                    <FormikInput  compact label="Prim Press"      name="primPress" />
                    <FormikInput  compact label="Sec Press"       name="secPress" />
                    <FormikSelect compact label="Prim Coat Batch" name="primCoatBatch" options={['Select','Batch-01','Batch-02']} />
                    <FormikSelect compact label="Sec Coat Batch"  name="secCoatBatch"  options={['Select','S-Batch-01','S-Batch-02']} />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Process Parameters" icon={<Activity size={13} className="text-emerald-600" />}>
                  <div className="grid grid-cols-3 gap-2">
                    <FormikInput compact label="Draw Line Speed" name="drawLineSpeed" type="number" />
                    <FormikInput compact label="Draw Tension"    name="drawTension"   type="number" />
                    <FormikInput compact label="Furnace Power"   name="furnacePower"  type="number" />
                    <FormikInput compact label="Pre. Sequence"   name="preSequence"   type="number" />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Gas Flow" icon={<Wind size={13} className="text-sky-600" />}>
                  <div className="grid grid-cols-3 gap-2">
                    <FormikInput compact label="Furnace Argon" name="furnaceArgon" />
                    <FormikInput compact label="Furnace He"    name="furnaceHe" />
                    <FormikInput compact label="Tube He"       name="tubeHe" />
                    <FormikInput compact label="CO2 Flow"      name="co2Flow" />
                    <FormikInput compact label="UV N2"         name="uvN2" />
                    <FormikInput compact label="UV Air"        name="uvAir" />
                  </div>
                </ModuleCard>

              </div>

              {/* ══ COL 3: PitchChange | Observations | Totals + Actions ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* PitchChange Details — no scroll, min 10 visible rows */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Table size={13} className="text-purple-600" />
                      <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">PitchChange Details</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-lg uppercase"
                    >
                      <Cpu size={11} /> Automation
                    </button>
                  </div>
                  {/* No scroll — always shows min 10 rows */}
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Flow Type','Start Len','End Len','Pitch Kms'].map(h => (
                          <th key={h} className="px-3 py-1.5 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* real data rows */}
                      {values.pitchDetails.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-1.5 text-slate-700">{row.flowType}</td>
                          <td className="px-3 py-1.5 text-slate-600">{row.startLength}</td>
                          <td className="px-3 py-1.5 text-slate-600">{row.endLength}</td>
                          <td className="px-3 py-1.5 font-mono text-emerald-600 font-bold">{row.pitchChange}</td>
                        </tr>
                      ))}
                      {/* empty filler rows to guarantee min 10 visible rows */}
                      {Array.from({ length: Math.max(0, 10 - values.pitchDetails.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="border-b border-slate-50">
                          <td className="px-3 py-1.5 text-transparent select-none">—</td>
                          <td className="px-3 py-1.5" />
                          <td className="px-3 py-1.5" />
                          <td className="px-3 py-1.5" />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Observations & Break */}
                <ModuleCard compact title="Observations & Break" icon={<Eye size={13} className="text-red-600" />}>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Field
                        type="checkbox"
                        name="drawnBreak"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                      />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Drawn Break Occurred?</span>
                    </label>
                    {values.drawnBreak && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <FormikSelect compact label="Break Reason"      name="breakReason"    options={['Select','Tension High','Gas Issue','Bubble']} />
                        <FormikSelect compact label="Spool Change Over" name="spoolChangeOver" options={['Select','Auto','Manual']} />
                      </div>
                    )}
                  </div>
                </ModuleCard>

                {/* Totals + Action buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase">Total Pitch Change Length</span>
                      <span className="text-base font-black text-indigo-700">{values.totalPitchChangeLength} Kms</span>
                    </div>
                    <div className="px-3 py-2 bg-rose-50 rounded-xl border border-rose-100 flex flex-col">
                      <span className="text-[9px] font-bold text-rose-400 uppercase">Total Scrap</span>
                      <span className="text-base font-black text-rose-700">{values.totalScrap} Kg</span>
                    </div>
                  </div>
                  <div className="flex justify-between gap-3">
                    <ResetButton compact>Reset</ResetButton>
                    <SubmitButton compact>Submit Entry</SubmitButton>
                  </div>
                </div>

              </div>
              {/* ══ end col 3 ══ */}

            </div>
            {/* ══ end 3-col grid ══ */}

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default DrawSpoolEntry;
