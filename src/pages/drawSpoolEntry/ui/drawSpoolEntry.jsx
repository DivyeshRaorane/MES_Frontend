import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Database, Layers, Activity, Table, Eye, Cpu } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, FormikTextarea, ModuleCard } from '../../../components/common_fields';

const getCurrentShift = () => {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return 'A';
  if (h >= 15 && h < 23) return 'B';
  return 'C';
};

const dummyPitchData = [
  { flowType: 'Standard', startLength: 0, endLength: 50, pitchChange: 50 },
  { flowType: 'HighSpeed', startLength: 50, endLength: 120, pitchChange: 70 },
];

const initialValues = {
  drawTower: '', preformId: 'PF-AUTO-9982', preformWeight: '',
  preformType: '', productType: '', fid: '', spoolId: '',
  entryDate: new Date().toISOString().split('T')[0],
  shift: getCurrentShift(),
  startDate: '', startTime: '', endDate: '', endTime: '',
  drawnLength: '', spoolStatus: 'OK', drawnSpool: '', remark: '',
  primaryCoat: 'P-COAT-V1', secondaryCoat: 'S-COAT-V2',
  primPress: '', secPress: '', primCoatBatch: '', secCoatBatch: '',
  drawLineSpeed: '', drawTension: '', furnacePower: '', preSequence: '',
  furnaceArgon: '', furnaceHe: '', tubeHe: '', co2Flow: '', N2Flow: '', uvAir: '',
  shiftIncharge: '', furnaceOperator: '', dieOperator: '', groundOperator: '',
  pitchDetails: dummyPitchData,
  drawnBreak: false, breakReason: '', windingObs: '', scratchesObs: '',
  spoolChangeOver: '', dieClean: '',
  processRemark: 'Select', drawBreakReason: '',
  totalPitchChangeLength: '120', totalScrap: '5.2',
  trial: false,
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
                <div className="flex flex-col gap-1 overflow-y-auto h-full">
                  <div className="grid grid-cols-3 gap-1">
                    <FormikSelect compact label="Draw Tower" name="drawTower" options={['Select', 'Tower 1', 'Tower 2']} />
                    <FormikInput compact label="Preform ID" name="preformId" readOnly />
                    <FormikInput compact label="Preform Wt" name="preformWeight" type="number" step="0.01" />
                    <FormikSelect compact label="Preform Type" name="preformType" options={['Select', 'Type A', 'Type B']} />
                    <FormikSelect compact label="Product Type" name="productType" options={['Select', 'Single Mode', 'Multi Mode']} />
                    <FormikInput compact label="Spool ID" name="spoolId" />
                    <FormikInput compact label="FID" name="fid" />
                    <FormikInput compact label="Entry Date" name="entryDate" type="date" />
                    <FormikInput compact label="Shift" name="shift" readOnly />
                    <FormikInput compact label="Drawn Weight" name="drawnweight" type="number" />
                    <FormikInput compact label="Drawn Length" name="drawnLength" type="number" />
                    <FormikSelect compact label="Winding Obs" name="windingObs" options={['Select', 'Poor', 'Good']} />
                    <FormikSelect compact label="Scratches Obs" name="scratchesObs" options={['Select', 'Nil', 'Minor', 'Major']} />
                    <FormikInput compact label="Top End Scrap" name="drawnLength" type="number" />
                    <FormikInput compact label="Bottom End Scrap" name="drawnLength" type="number" />
                    <FormikInput compact label="Balance weight" name="drawnLength" type="number" />
                    <FormikSelect compact label="Die Clean" name="dieClean" options={['Select', 'Yes', 'No']} />
                    <FormikInput compact label="Start Date" name="startDate" type="date" />
                    <FormikInput compact label="Start Time" name="startTime" type="time" />
                    <FormikInput compact label="End Date" name="endDate" type="date" />
                    <FormikInput compact label="End Time" name="endTime" type="time" />
                    <FormikSelect compact label="Spool Status" name="spoolStatus" options={['OK', 'Not OK']} />
                    {values.spoolStatus === 'Not OK' && (
                      <FormikSelect compact label="Drawn Spool" name="drawnSpool" options={['Select', 'Scrap', 'Hold', 'Rework']} />
                    )}
                    {/* Work Details fields */}
                    <FormikSelect compact label="Shift Incharge" name="shiftIncharge" options={['Select', 'Incharge A', 'Incharge B']} />
                    <FormikSelect compact label="Furnace Operator" name="furnaceOperator" options={['Select', 'Operator 1', 'Operator 2']} />
                    <FormikSelect compact label="Die Operator" name="dieOperator" options={['Select', 'Op 3', 'Op 4']} />
                    <FormikSelect compact label="Ground Operator" name="groundOperator" options={['Select', 'Op 5', 'Op 6']} />
                  </div>
                  <FormikTextarea compact label="Process Remark" name="remark" rows={2} placeholder="Enter remarks..." />
                </div>
              </ModuleCard>

              {/* ══ COL 2: Coating | Process Params | Gas Flow ══ */}
              <div className="flex flex-col gap-2 min-h-0">

                <ModuleCard compact title="Coating & Batch" icon={<Layers size={13} className="text-indigo-600" />}>
                  <div className="grid grid-cols-3 gap-1">
                    <FormikInput compact label="Primary Coat" name="primaryCoat" readOnly />
                    <FormikInput compact label="Secondary Coat" name="secondaryCoat" readOnly />
                    <FormikSelect compact label="Coating Type" name="coating_type" options={['Select', 'Batch-01', 'Batch-02']} />
                    <FormikInput compact label="Prim Press" name="primPress" />
                    <FormikInput compact label="Sec Press" name="secPress" />
                    <FormikSelect compact label="Prim Coat Batch" name="primCoatBatch" options={['Select', 'Batch-01', 'Batch-02']} />
                    <FormikSelect compact label="Sec Coat Batch" name="secCoatBatch" options={['Select', 'S-Batch-01', 'S-Batch-02']} />
                    <FormikInput compact label="Process Type" name="process_type" />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Process Parameters" icon={<Activity size={13} className="text-emerald-600" />}>
                  <div className="grid grid-cols-3 gap-1">
                    <FormikInput compact label="Draw Line Speed" name="drawLineSpeed" type="number" />
                    <FormikInput compact label="Draw Tension" name="drawTension" type="number" />
                    <FormikInput compact label="Furnace Power" name="furnacePower" type="number" />
                    <FormikInput compact label="Pre. Sequence" name="preSequence" type="number" />
                    <FormikInput compact label="Furnace Argon" name="furnaceArgon" />
                    <FormikInput compact label="Furnace He" name="furnaceHe" />
                    <FormikInput compact label="Tube He" name="tubeHe" />
                    <FormikInput compact label="CO2 Flow" name="co2Flow" />
                    <FormikInput compact label="N2 Flow" name="N2Flow" />
                    <FormikInput compact label="UV Air" name="uvAir" />
                    {/* Remark + conditional Draw Break Reason in same row */}
                    <FormikSelect compact label="Remark" name="processRemark"
                      options={['Select', 'OK', 'Not OK']} />
                    {values.processRemark === 'Not OK' && (
                      <FormikSelect compact label="Draw Break Reason" name="drawBreakReason"
                        options={['Select', 'Tension High', 'Gas Issue', 'Bubble', 'Coating Defect', 'Other']} />
                    )}
                  </div>
                </ModuleCard>

                {/* Indication + Trial */}
                <ModuleCard compact title="Additional" icon={<Activity size={13} className="text-slate-500" />}>
                  <div className="grid grid-cols-3 gap-1 items-end">
                    <FormikSelect compact label="Indication Fiber Cut" name="indication_fiber_cut"
                      options={['Select', 'Cut', 'Sample', 'Break']} />
                    {/* Trial checkbox — styled consistently */}
                    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-all h-[30px] self-end">
                      <Field
                        type="checkbox"
                        name="trial"
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-indigo-600"
                      />
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Trial</span>
                    </label>
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
                        {['Flow Type', 'Start Len', 'End Len', 'Pitch Kms'].map(h => (
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
                <ModuleCard compact title="Trial Confirmaton" icon={<Eye size={13} className="text-red-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="FID for trial" name="fid_for_trial" />
                    <button class="relative inline-flex items-center gap-1 px-1 py-1 text-white font-semibold text-sm rounded-sm 
bg-gradient-to-r from-purple-600 to-blue-500 
shadow-lg shadow-blue-500/30 
transition-all duration-300 
hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 
active:scale-95 overflow-hidden">

                      🚀 Click For Stage Trial
                    </button>
                  </div>
                </ModuleCard>

                {/* Totals + Action buttons */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="px-1 py-1 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col">
                      <span className="text-[7px] font-bold text-indigo-400 uppercase">Total Pitch Change Length</span>
                      <span className="text-base font-black text-indigo-700">{values.totalPitchChangeLength} Kms</span>
                    </div>
                    <div className="px-1 py-1 bg-rose-50 rounded-xl border border-rose-100 flex flex-col">
                      <span className="text-[7px] font-bold text-rose-400 uppercase">Total Scrap</span>
                      <span className="text-base font-black text-rose-700">{values.totalScrap} Kg</span>
                    </div>
                    <div className="px-1 py-1 bg-rose-50 rounded-xl border border-rose-100 flex flex-col">
                      <span className="text-[7px] font-bold text-Slate-400 uppercase">Drawn Breaks</span>
                      <span className="text-base font-black text-slate-700">{values?.k || 4}</span>
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
