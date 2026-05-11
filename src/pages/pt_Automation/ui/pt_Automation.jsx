import React from 'react';
import { useFormik, FormikProvider, Field, FieldArray, Form } from 'formik';
import {
  Settings, Cpu, Barcode, TrendingUp,
  Clock, AlertTriangle, ClipboardList,
  Plus, Trash2, Search, Save, User
} from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── table-cell input ── */
const TInput = ({ name }) => (
  <Field
    name={name}
    className="w-full bg-transparent px-1.5 py-1 text-xs focus:outline-none focus:bg-white rounded transition-all"
  />
);
const TSelect = ({ name, options }) => (
  <Field
    as="select"
    name={name}
    className="w-full bg-transparent px-1 py-1 text-xs focus:outline-none focus:bg-white rounded transition-all cursor-pointer"
  >
    {options.map(o => <option key={o}>{o}</option>)}
  </Field>
);

/* ══════════════════════════════════════════════════════════ */
const PTAutomation = () => {
  const formik = useFormik({
    initialValues: {
      ptMachine:           '',
      drawSpoolBarcode:    '',
      preformId:           '',
      ptId:                '',
      ptBobbinBarcode:     '',
      operator:            '',
      incharge:            '',
      bobbinType:          '',
      bobbinColor:         '',
      drawLength:          '',
      ptDone:              '',
      balanceLength:       '',
      ptRunningStrain:     '',
      nextPtOkLen:         '',
      ptBobbinStatus:      'OK',
      timeLoss:            '',
      timeLossReason:      '',
      speedLoss:           '',
      speedLossReason:     '',
      drawRejectionReason: 'None',
      meRejectionReason:   'None',
      scratchesReason:     'None',
      spoolEndReason:      '',
      ptScrapReason:       '',
      drawFlaws: [{ type: '', p1: '', p2: '', defectLen: '', actCuttingLen: '' }],
      ptLogs:    [{ identifier: '', length: '', reason: 'OK' }],
    },
    onSubmit: (values) => console.log('PT Automation Submit:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

          {/* ── Action bar ── */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-indigo-600" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">PT Production Automation</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-all"
              >
                <Search size={11} /> Get Allocation
              </button>
              <SubmitButton compact onClick={formik.handleSubmit}>
                <Save size={11} /> Save Entry
              </SubmitButton>
            </div>
          </div>

          <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3">
            <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">

              {/* ══ COL 1: Machine Setup + Personnel ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                <ModuleCard compact title="Machine Setup" icon={<Settings size={13} className="text-blue-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <FormikInput compact label="Draw Spool Barcode" name="drawSpoolBarcode" placeholder="Scan barcode..." />
                    </div>
                    <FormikInput compact label="PT Machine"    name="ptMachine"        placeholder="Machine #" />
                    <FormikInput compact label="PT ID"         name="ptId" />
                    <FormikInput compact label="Preform ID"    name="preformId" />
                    <FormikInput compact label="PT Bobbin"     name="ptBobbinBarcode"  placeholder="Scan bobbin..." />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Personnel & Bobbin" icon={<User size={13} className="text-purple-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="Operator"     name="operator" />
                    <FormikInput compact label="Incharge"     name="incharge" />
                    <FormikInput compact label="Bobbin Type"  name="bobbinType" />
                    <FormikInput compact label="Bobbin Color" name="bobbinColor" />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Reasoning" icon={<ClipboardList size={13} className="text-slate-500" />}>
                  <div className="grid grid-cols-1 gap-2">
                    <FormikInput compact label="Spool End Reason" name="spoolEndReason" />
                    <FormikInput compact label="PT Scrap Reason"  name="ptScrapReason" />
                  </div>
                </ModuleCard>
              </div>

              {/* ══ COL 2: Production Metrics + Loss Tracking ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                <ModuleCard compact title="Production Metrics" icon={<TrendingUp size={13} className="text-emerald-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput compact label="Draw Length"     name="drawLength" />
                    <FormikInput compact label="PT Done"         name="ptDone" />
                    {/* Balance highlight */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-indigo-500 uppercase ml-0.5">Balance Length</label>
                      <Field
                        name="balanceLength"
                        className="w-full bg-indigo-50 border border-indigo-200 rounded px-2 py-1.5 text-xs font-bold text-indigo-700 font-mono outline-none"
                      />
                    </div>
                    <FormikInput compact label="Running Strain"  name="ptRunningStrain" />
                    <FormikSelect compact label="Bobbin Status"  name="ptBobbinStatus" options={['OK','Scrap','PT Break']} />
                    <FormikInput compact label="Next PT OK Len"  name="nextPtOkLen" />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Loss Tracking" icon={<Clock size={13} className="text-orange-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput  compact label="Time Loss (min)"    name="timeLoss" />
                    <FormikInput  compact label="Speed Loss (m/min)" name="speedLoss" />
                    <FormikSelect compact label="Time Loss Reason"   name="timeLossReason"  options={['None','Power Cut','Machine Fault','Material Issue','Operator Delay','Other']} />
                    <FormikSelect compact label="Speed Loss Reason"  name="speedLossReason" options={['None','Vibration','Tension Issue','Coating Problem','Other']} />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Quality Control" icon={<AlertTriangle size={13} className="text-rose-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="Draw Rejection" name="drawRejectionReason" options={['None','Surface Defect','Ovality','Diameter']} />
                    <FormikSelect compact label="M/E Rejection"  name="meRejectionReason"   options={['None','Machine Error','Tool Wear']} />
                    <FormikSelect compact label="Scratches"      name="scratchesReason"      options={['None','Guide Roll','Payoff','Winder']} />
                  </div>
                </ModuleCard>
              </div>

              {/* ══ COL 3: Draw Flaw Log + PT Log ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* Draw Flaw Log — scrollable */}
                <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={13} className="text-amber-500" />
                      <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Draw Flaw Log</span>
                    </div>
                    <FieldArray name="drawFlaws">
                      {({ push }) => (
                        <button
                          type="button"
                          onClick={() => push({ type: '', p1: '', p2: '', defectLen: '', actCuttingLen: '' })}
                          className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
                        >
                          <Plus size={11} />
                        </button>
                      )}
                    </FieldArray>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <FieldArray name="drawFlaws">
                      {({ remove, form }) => (
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-200">
                              {['Flaw','P1','P2','Defect','Act Cut',''].map(h => (
                                <th key={h} className="px-2 py-1.5 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {form.values.drawFlaws.map((_, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-1 py-1"><TInput name={`drawFlaws.${idx}.type`} /></td>
                                <td className="px-1 py-1"><TInput name={`drawFlaws.${idx}.p1`} /></td>
                                <td className="px-1 py-1"><TInput name={`drawFlaws.${idx}.p2`} /></td>
                                <td className="px-1 py-1"><TInput name={`drawFlaws.${idx}.defectLen`} /></td>
                                <td className="px-1 py-1"><TInput name={`drawFlaws.${idx}.actCuttingLen`} /></td>
                                <td className="px-1 py-1 text-center">
                                  <button type="button" onClick={() => remove(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </FieldArray>
                  </div>
                </div>

                {/* PT Log — scrollable */}
                <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={13} className="text-indigo-600" />
                      <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Process Log (PT Log)</span>
                    </div>
                    <FieldArray name="ptLogs">
                      {({ push }) => (
                        <button
                          type="button"
                          onClick={() => push({ identifier: '', length: '', reason: 'OK' })}
                          className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all"
                        >
                          <Plus size={11} />
                        </button>
                      )}
                    </FieldArray>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <FieldArray name="ptLogs">
                      {({ remove, form }) => (
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-200">
                              {['Barcode / ID / Flaw','Length','Reason',''].map(h => (
                                <th key={h} className="px-2 py-1.5 text-[9px] font-bold text-slate-500 uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {form.values.ptLogs.map((_, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-1 py-1"><TInput name={`ptLogs.${idx}.identifier`} /></td>
                                <td className="px-1 py-1"><TInput name={`ptLogs.${idx}.length`} /></td>
                                <td className="px-1 py-1">
                                  <TSelect
                                    name={`ptLogs.${idx}.reason`}
                                    options={['OK','PT Scrap','Draw Scrap','PT Break Scrap']}
                                  />
                                </td>
                                <td className="px-1 py-1 text-center">
                                  <button type="button" onClick={() => remove(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </FieldArray>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3">
                  <ResetButton compact type="button" onClick={() => formik.resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Save Entry</SubmitButton>
                </div>

              </div>
              {/* ══ end col 3 ══ */}

            </div>
          </Form>
        </div>
      </div>
    </FormikProvider>
  );
};

export default PTAutomation;
