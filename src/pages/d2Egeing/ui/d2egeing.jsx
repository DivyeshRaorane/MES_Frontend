import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Scan, ClipboardList, FlaskConical, Activity } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input ── */
const TCell = ({ name, type = 'text' }) => (
  <Field name={name} type={type}
    className="w-full bg-transparent px-1.5 py-1 text-xs focus:outline-none focus:bg-blue-50 rounded transition-all" />
);

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  scan_barcode:    '',
  batch_id:        '',
  chamber_no:      '',
  date:            today,
  plant:           '',
  operator:        '',
  shift_incharge:  '',
  qty_no:          '',
  qty_kms:         '',
  /* table rows */
  main_rows: Array(15).fill(null).map(() => ({
    barcode: '', pt_len: '', d2_chamber: '', date_time: '', grade: '', select: false,
  })),
  h2_rows: Array(6).fill(null).map(() => ({ barcode_id: '', remarks: '' })),
};

/* ══════════════════════════════════════════════════════════ */
const D2Issue = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik initialValues={initialValues} onSubmit={(v) => { console.log('D2 Issue:', v); alert('Saved!'); }}>
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Row 1: Form fields + Status summary ── */}
            <div className="grid grid-cols-[1.6fr_1fr] gap-2 flex-shrink-0">

              {/* Left: all form fields */}
              <ModuleCard compact title="D2 Issue Entry" icon={<FlaskConical size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-4 gap-2">
                  {/* Scan barcode — spans 2 cols with button */}
                  <div className="col-span-2 flex items-end gap-1.5">
                    <div className="flex-1">
                      <FormikInput compact label="Scan Barcode" name="scan_barcode" placeholder="Scan barcode..." />
                    </div>
                    <button type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]">
                      <Scan size={9} /> Scan
                    </button>
                  </div>
                  <FormikInput  compact label="Batch ID"          name="batch_id" />
                  <FormikSelect compact label="D2 Chamber No"     name="chamber_no"
                    options={['Select','Chamber 1','Chamber 2','Chamber 3','Chamber 4','Chamber 5']} />
                  <FormikInput  compact label="Date"              name="date"           type="date" />
                  <FormikSelect compact label="Plant"             name="plant"
                    options={['Select','Plant A','Plant B','Plant C']} />
                  <FormikSelect compact label="Operator"          name="operator"
                    options={['Select','Operator A','Operator B','Operator C']} />
                  <FormikSelect compact label="Shift Incharge"    name="shift_incharge"
                    options={['Select','Incharge A','Incharge B','Supervisor X']} />
                </div>
              </ModuleCard>

              {/* Right: status summary + qty */}
              <ModuleCard compact title="Testing Status" icon={<Activity size={13} className="text-indigo-600" />}>
                <div className="flex flex-col gap-2">
                  {/* Status table from screenshot */}
                  <table className="w-full text-xs border-collapse border border-slate-200 rounded overflow-hidden">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="border border-slate-500 py-1.5 px-2 text-left text-[9px] font-normal"></th>
                        <th className="border border-slate-500 py-1.5 text-[9px] font-normal text-center">Qty in No</th>
                        <th className="border border-slate-500 py-1.5 text-[9px] font-normal text-center">Qty in Kms</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-emerald-50/60">
                        <td className="border border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-700">Final Testing Done</td>
                        <td className="border border-slate-200 h-8 text-center text-xs font-mono text-emerald-700 font-bold">—</td>
                        <td className="border border-slate-200 h-8 text-center text-xs font-mono text-emerald-700 font-bold">—</td>
                      </tr>
                      <tr className="bg-amber-50/60">
                        <td className="border border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-700">Testing Pending</td>
                        <td className="border border-slate-200 h-8 text-center text-xs font-mono text-amber-700 font-bold">—</td>
                        <td className="border border-slate-200 h-8 text-center text-xs font-mono text-amber-700 font-bold">—</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Qty stat boxes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Qty in No</label>
                      <Field name="qty_no" type="number" placeholder="0"
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs font-bold text-blue-700 outline-none focus:ring-1 focus:ring-blue-500/20" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Qty in Kms</label>
                      <Field name="qty_kms" type="number" step="0.001" placeholder="0.000"
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs font-bold text-indigo-700 outline-none focus:ring-1 focus:ring-blue-500/20" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <ResetButton compact type="button" onClick={() => resetForm()} className="flex-1">Reset</ResetButton>
                    <SubmitButton compact type="submit" className="flex-1">Save Entry</SubmitButton>
                  </div>
                </div>
              </ModuleCard>
            </div>

            {/* ── Row 2: Main table + H2 Ageing table ── */}
            <div className="grid grid-cols-[1.6fr_1fr] gap-2 flex-1 min-h-0">

              {/* Main data table — Sr No, Barcode, PT Len, D2 Chamber, Date & Time, Grade, Select */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardList size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">D2 Issue Log</span>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['Sr No','Barcode','PT Len','D2 Chamber','Date & Time','Grade','Select'].map(h => (
                          <th key={h} className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {values.main_rows.map((_, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-2 py-1 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100 w-8">{i + 1}</td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`main_rows.${i}.barcode`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`main_rows.${i}.pt_len`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`main_rows.${i}.d2_chamber`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`main_rows.${i}.date_time`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`main_rows.${i}.grade`} /></td>
                          <td className="px-2 py-1 text-center">
                            <Field type="checkbox" name={`main_rows.${i}.select`}
                              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* H2 Ageing Details table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <FlaskConical size={12} className="text-indigo-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">H2 Ageing Details</span>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">Barcode ID</th>
                        <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {values.h2_rows.map((_, i) => (
                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`h2_rows.${i}.barcode_id`} /></td>
                          <td className="px-1 py-1"><TCell name={`h2_rows.${i}.remarks`} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            {/* ── end row 2 ── */}

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default D2Issue;
