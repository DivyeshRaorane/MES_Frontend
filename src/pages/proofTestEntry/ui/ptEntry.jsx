import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Scan, ClipboardCheck, Ruler, TrendingUp,
  Clock, AlertTriangle, Users, Database
} from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── helpers ── */
const today = new Date().toISOString().split('T')[0];

const calcBalance = (drawnLength, ptDone) => {
  const dl = parseFloat(drawnLength) || 0;
  const pt = parseFloat(ptDone)     || 0;
  return Math.max(0, dl - pt).toFixed(3);
};

const validationSchema = Yup.object({
  drawn_spool_no: Yup.string().required('Required'),
  pt_bobbin_no:   Yup.string().required('Required'),
  operator_name:  Yup.string().required('Required'),
  shift_incharge: Yup.string().required('Required'),
});

const initialValues = {
  /* ── Spool info (auto-fetched on scan) ── */
  pt_machine_no:          '',
  drawn_spool_no:         '',
  preform_id:             'PR-2026-0045',   // auto
  drawn_length:           '450.500',        // auto (km)
  drawn_date:             '2026-04-29',     // auto
  dt_no:                  'DT-99812',       // auto
  drawn_remark:           '',               // auto
  pt_allocation_remark:   '',               // auto

  /* ── PT Entry ── */
  pt_date:                today,
  pt_bobbin_no:           '',
  pt_done:                '',               // km
  running_strain:         'Strain-A',
  product_type:           'Single Mode',    // auto

  /* ── Loss Tracking ── */
  time_loss:              '',
  time_loss_reason:       '',
  speed_loss:             '',
  speed_loss_reason:      '',

  /* ── Quality ── */
  rejection:              'None',
  balance_draw_rejection: 'None',
  me_rejection:           'None',
  scratches:              'None',

  /* ── Personnel ── */
  operator_name:          '',
  shift_incharge:         '',
};

/* ══════════════════════════════════════════════════════════ */
const PTEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(v) => { console.log('PT Entry Submit:', v); alert('PT Entry Saved!'); }}
      >
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3">

            {/* ── 3-column grid ── */}
            <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">

              {/* ══ COL 1: Spool Info ══ */}
              <ModuleCard
                compact
                title="Spool Information"
                icon={<Database size={13} className="text-blue-600" />}
              >
                <div className="flex flex-col gap-2 h-full overflow-y-auto">
                  {/* Scan row */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormikInput
                        compact
                        label="Drawn Spool No"
                        name="drawn_spool_no"
                        placeholder="Scan barcode..."
                      />
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase tracking-wider hover:bg-indigo-700 transition-all h-[30px]"
                    >
                      <Scan size={10} /> Scan
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="PT Machine No"       name="pt_machine_no"        options={['Select','PT-MAC-01','PT-MAC-02','PT-MAC-03']} />
                    <FormikInput  compact label="Preform ID"          name="preform_id"            readOnly />
                    <FormikInput  compact label="Drawn Length (km)"   name="drawn_length"          readOnly />
                    <FormikInput  compact label="Drawn Date"          name="drawn_date"            type="date" readOnly />
                    <FormikInput  compact label="DT No"               name="dt_no"                 readOnly />
                    <FormikInput  compact label="PT Date"             name="pt_date"               type="date" />
                  </div>

                  <FormikTextarea compact label="Drawn Remark"         name="drawn_remark"         rows={2} placeholder="Auto-fetched remark..." />
                  <FormikTextarea compact label="PT Allocation Remark" name="pt_allocation_remark" rows={2} placeholder="Auto-fetched PT remark..." />
                </div>
              </ModuleCard>

              {/* ══ COL 2: PT Entry + Loss Tracking ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* PT Entry */}
                <ModuleCard
                  compact
                  title="PT Entry"
                  icon={<ClipboardCheck size={13} className="text-indigo-600" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput  compact label="PT Bobbin No"      name="pt_bobbin_no"    placeholder="Scan bobbin..." />
                    <FormikInput  compact label="PT Done (km)"      name="pt_done"         type="number" step="0.001" placeholder="0.000" />

                    {/* Balance — calculated, read-only display */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Balance (km)</label>
                      <div className="w-full bg-indigo-50 border border-indigo-200 rounded px-2 py-1.5 text-xs font-bold text-indigo-700 font-mono">
                        {calcBalance(values.drawn_length, values.pt_done)}
                      </div>
                    </div>

                    <FormikSelect compact label="Running Strain"    name="running_strain"  options={['Strain-A','Strain-B','Strain-C','Strain-D']} />
                    <FormikInput  compact label="Product Type"      name="product_type"    readOnly />
                  </div>
                </ModuleCard>

                {/* Loss Tracking */}
                <ModuleCard
                  compact
                  title="Loss Tracking"
                  icon={<Clock size={13} className="text-orange-500" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FormikInput  compact label="Time Loss (min)"    name="time_loss"         type="number" placeholder="0" />
                    <FormikInput  compact label="Speed Loss (m/min)" name="speed_loss"        type="number" placeholder="0" />
                    <FormikSelect compact label="Time Loss Reason"   name="time_loss_reason"  options={['None','Power Cut','Machine Fault','Material Issue','Operator Delay','Other']} />
                    <FormikSelect compact label="Speed Loss Reason"  name="speed_loss_reason" options={['None','Vibration','Tension Issue','Coating Problem','Other']} />
                  </div>
                </ModuleCard>
              </div>

              {/* ══ COL 3: Quality + Personnel + Actions ══ */}
              <div className="flex flex-col gap-3 min-h-0">

                {/* Quality Control */}
                <ModuleCard
                  compact
                  title="Quality Control"
                  icon={<AlertTriangle size={13} className="text-rose-500" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="Rejection"              name="rejection"              options={['None','Surface Defect','Ovality','Diameter Out','Bubble','Other']} />
                    <FormikSelect compact label="Balance Draw Rejection" name="balance_draw_rejection" options={['None','Scrap','Hold','Rework']} />
                    <FormikSelect compact label="M/E Rejection"          name="me_rejection"           options={['None','Machine Error','Tool Wear','Setup Error','Other']} />
                    <FormikSelect compact label="Scratches"              name="scratches"              options={['None','Guide Roll','Payoff','Winder','Minor','Major']} />
                  </div>
                </ModuleCard>

                {/* Personnel */}
                <ModuleCard
                  compact
                  title="Personnel"
                  icon={<Users size={13} className="text-emerald-600" />}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="Operator Name"   name="operator_name"  options={['Select','Operator A','Operator B','Operator C','Senior Op']} />
                    <FormikSelect compact label="Shift Incharge"  name="shift_incharge" options={['Select','Incharge A','Incharge B','Supervisor X']} />
                  </div>
                </ModuleCard>

                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase">PT Done</span>
                    <span className="text-base font-black text-indigo-700 font-mono">
                      {parseFloat(values.pt_done || 0).toFixed(3)} km
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Balance</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {calcBalance(values.drawn_length, values.pt_done)} km
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3 mt-auto">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Save PT Entry</SubmitButton>
                </div>

              </div>
              {/* ══ end col 3 ══ */}

            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default PTEntry;
