import React from 'react';
import { Formik, Form, Field } from 'formik';
import { ShieldCheck, Scan, ClipboardCheck, User, Calendar } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const today   = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const initialValues = {
  online_pv:      false,
  re_pv:          false,
  barcode:        '',
  fiber_type:     'Single Mode',   // auto
  colour:         '',              // auto if applied
  qty_no:         '',
  qty_kms:        '',
  pv_instruction: '',
  pv_remark:      '',
  pv_operator:    '',
  date:           today,
  time:           nowTime,
  shift:          '',
};

const PVEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('PV Entry:', v); alert('PV Entry Saved!'); }}
      >
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3">

            {/* ── 2-column layout fills full height ── */}
            <div className="grid grid-cols-[1.4fr_1fr] gap-3 flex-1 min-h-0">

              {/* ══ COL 1: All form fields ══ */}
              <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">

                {/* Verification type */}
                <ModuleCard compact title="Verification Type" icon={<ShieldCheck size={13} className="text-blue-600" />}>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Field type="checkbox" name="online_pv"
                        className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                        Online Physical Verification
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Field type="checkbox" name="re_pv"
                        className="w-4 h-4 rounded border-slate-300 accent-indigo-600" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">
                        Re-Physical Verification
                      </span>
                    </label>
                  </div>
                </ModuleCard>

                {/* Spool identification */}
                <ModuleCard compact title="Spool Identification" icon={<Scan size={13} className="text-indigo-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Barcode + scan button spans both cols */}
                    <div className="col-span-2 flex items-end gap-2">
                      <div className="flex-1">
                        <FormikInput compact label="Barcode" name="barcode" placeholder="Scan or enter barcode..." />
                      </div>
                      <button type="button"
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]">
                        <Scan size={10} /> Scan
                      </button>
                    </div>
                    <FormikInput compact label="Fiber Type"          name="fiber_type" readOnly />
                    <FormikInput compact label="Colour (if applied)" name="colour"     readOnly />
                    <FormikInput compact label="Quantity (No)"       name="qty_no"     type="number" placeholder="0" />
                    <FormikInput compact label="Quantity (Kms)"      name="qty_kms"    type="number" step="0.001" placeholder="0.000" />
                  </div>
                </ModuleCard>

                {/* Instructions & Remarks */}
                <ModuleCard compact title="Instructions & Remarks" icon={<ClipboardCheck size={13} className="text-emerald-600" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikTextarea compact label="PV Instruction" name="pv_instruction" rows={4} placeholder="Enter PV instructions..." />
                    <FormikTextarea compact label="PV Remark"      name="pv_remark"      rows={4} placeholder="Enter remarks..." />
                  </div>
                </ModuleCard>

                {/* Personnel & Timing */}
                <ModuleCard compact title="Personnel & Timing" icon={<User size={13} className="text-orange-500" />}>
                  <div className="grid grid-cols-4 gap-2">
                    <FormikSelect compact label="PV Operator" name="pv_operator"
                      options={['Select','Operator A','Operator B','Operator C','Senior Op']} />
                    <FormikInput  compact label="Date"  name="date"  type="date" />
                    <FormikInput  compact label="Time"  name="time"  type="time" />
                    <FormikSelect compact label="Shift" name="shift" options={['Select','A','B','C']} />
                  </div>
                </ModuleCard>

              </div>

              {/* ══ COL 2: Summary + Status + Actions ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* Live summary stats */}
                <ModuleCard compact title="Entry Summary" icon={<ClipboardCheck size={13} className="text-blue-600" />}>
                  <div className="flex flex-col gap-2">
                    {/* Verification mode badges */}
                    <div className="flex gap-2">
                      <div className={`flex-1 px-3 py-2 rounded-lg border text-center transition-all ${
                        values.online_pv
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <p className="text-[8px] font-bold uppercase tracking-wider">Online PV</p>
                        <p className="text-xs font-black mt-0.5">{values.online_pv ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div className={`flex-1 px-3 py-2 rounded-lg border text-center transition-all ${
                        values.re_pv
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <p className="text-[8px] font-bold uppercase tracking-wider">Re-PV</p>
                        <p className="text-xs font-black mt-0.5">{values.re_pv ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>

                    {/* Qty stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-3 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-blue-400 uppercase">Qty (No)</span>
                        <span className="text-2xl font-black text-blue-700 font-mono mt-0.5">
                          {values.qty_no || '0'}
                        </span>
                      </div>
                      <div className="px-3 py-3 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase">Qty (Kms)</span>
                        <span className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                          {parseFloat(values.qty_kms || 0).toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Barcode preview */}
                    <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Barcode</p>
                      <p className="text-xs font-bold text-slate-700 font-mono truncate">
                        {values.barcode || '—'}
                      </p>
                    </div>

                    {/* Fiber info */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Fiber Type</p>
                        <p className="text-xs font-bold text-slate-700">{values.fiber_type || '—'}</p>
                      </div>
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Colour</p>
                        <p className="text-xs font-bold text-slate-700">{values.colour || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </ModuleCard>

                {/* Date / Operator info */}
                <ModuleCard compact title="Session Info" icon={<Calendar size={13} className="text-slate-500" />}>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Date</p>
                        <p className="text-xs font-bold text-slate-700">{values.date || '—'}</p>
                      </div>
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Time</p>
                        <p className="text-xs font-bold text-slate-700">{values.time || '—'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Shift</p>
                        <p className="text-xs font-bold text-slate-700">{values.shift || '—'}</p>
                      </div>
                      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Operator</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{values.pv_operator || '—'}</p>
                      </div>
                    </div>
                  </div>
                </ModuleCard>

                {/* Actions — pushed to bottom */}
                <div className="mt-auto flex flex-col gap-2">
                  <div className="flex gap-2">
                    <ResetButton compact type="button" onClick={() => resetForm()} className="flex-1">
                      Reset
                    </ResetButton>
                    <SubmitButton compact type="submit" className="flex-1">
                      Save PV Entry
                    </SubmitButton>
                  </div>
                </div>

              </div>
              {/* ══ end col 2 ══ */}

            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default PVEntry;
