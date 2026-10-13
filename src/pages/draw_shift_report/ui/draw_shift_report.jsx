import { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Plus, Minus, FileBarChart2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { submitDrawShiftReport, getDrawUsers } from '../services/draw_shift_report.api';

const DEFAULT_SPEED = 2700;

/* ── Compact inline table cell input ── */
const TInput = ({ name, type = 'text', placeholder = '' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className="w-full bg-transparent px-1 py-0.5 text-[10px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded transition-all border border-transparent focus:border-blue-200" />
);

/* ── Per-preform (addable) columns ── */
const PREFORM_COLS = [
  { label: 'Preform ID',   key: 'preform_id',    type: 'text'   },
  { label: 'Spool ID',     key: 'spool_id',      type: 'text'   },
  { label: 'Actual Length',key: 'act_length',    type: 'number' },
  { label: 'C/O',          key: 'c_o',           type: 'number' },
  { label: 'F/C',          key: 'f_c',           type: 'number' },
  { label: 'D/C',          key: 'd_c',           type: 'number' },
  { label: 'Furnace E Seq',key: 'furnace_e_seq', type: 'text'   },
  { label: 'Breaks',       key: 'breaks',        type: 'number' },
  { label: 'Activities',   key: 'activities',    type: 'text'   },
];

const makePreform = () => ({
  preform_id:    '',
  spool_id:      '',
  act_length:    '',
  c_o:           '',
  f_c:           '',
  d_c:           '',
  furnace_e_seq: '',
  breaks:        '',
  activities:    '',
});

const makeTower = (dt) => ({
  dt,
  speed:    DEFAULT_SPEED,
  preforms: [makePreform()],
});

const initialValues = {
  date:         new Date().toISOString().split('T')[0],
  shft:         '',
  gr_f_opr:     '',
  die:          '',
  furnace_opr:  '',
  sic:          '',
  maint:        '',
  towers: [1, 2, 3, 4].map(makeTower),
};

/* ── Per-DT derived values ── */
const calcPlan = (speed) => (((parseFloat(speed) || 0) * 480) / 1000);
const calcDrawn = (preforms) =>
  preforms.reduce((s, p) => s + (parseFloat(p.act_length) || 0), 0);
const calcEfficiency = (drawn, plan) => (plan > 0 ? (drawn / plan) * 100 : 0);

/* ══════════════════════════════════════════════════════════ */
const DrawShiftReport = () => {
  const [drawUsers, setDrawUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const uRes = await getDrawUsers();
        setDrawUsers(uRes?.data || []);
      } catch {
        showError('Failed to load draw users');
      }
    })();
  }, []);

  const userOptions = drawUsers.map(u => ({ label: u.draw_user_name, value: u.draw_user_name }));

  return (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          // ── Validation ──
          if (!values.date) {
            showError('Date is required');
            setSubmitting(false);
            return;
          }
          if (!values.shft || values.shft === 'Select') {
            showError('Shift is required');
            setSubmitting(false);
            return;
          }
          if (values.towers.length !== 4) {
            showError('Exactly 4 draw towers are required');
            setSubmitting(false);
            return;
          }

          // ── Build payload (numbers coerced, derived values recomputed) ──
          const payload = {
            date: values.date,
            shft: values.shft,
            gr_f_opr: values.gr_f_opr,
            die: values.die,
            furnace_opr: values.furnace_opr,
            sic: values.sic,
            maint: values.maint,
            towers: values.towers.map((t) => {
              const plan = calcPlan(t.speed);
              const drawn = calcDrawn(t.preforms);
              const efficiency = calcEfficiency(drawn, plan);
              return {
                dt: Number(t.dt),
                speed: Number.parseFloat(t.speed) || 0,
                plan: Number(plan.toFixed(3)),
                drawn_length: Number(drawn.toFixed(3)),
                efficiency: Number(efficiency.toFixed(2)),
                preforms: t.preforms.map((p) => ({
                  preform_id: p.preform_id || '',
                  spool_id: p.spool_id || '',
                  act_length: Number.parseFloat(p.act_length) || 0,
                  c_o: Number.parseFloat(p.c_o) || 0,
                  f_c: Number.parseFloat(p.f_c) || 0,
                  d_c: Number.parseFloat(p.d_c) || 0,
                  furnace_e_seq: p.furnace_e_seq || '',
                  breaks: Number.parseFloat(p.breaks) || 0,
                  activities: p.activities || '',
                })),
              };
            }),
          };

          try {
            const res = await submitDrawShiftReport(payload);
            if (res?.success) {
              showSuccess(res.message || 'Draw shift report saved for 4 towers.');
            } else {
              showError(res?.message || 'Failed to save report');
            }
          } catch (e) {
            const status = e?.response?.status;
            const serverMsg = e?.response?.data?.message;
            if (status === 401) showError('Session expired or unauthorized. Please log in again.');
            else if (status === 400) showError(serverMsg || 'Validation failed. Check the entry.');
            else showError(serverMsg || 'Server error. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, resetForm, isSubmitting }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Shift Report</span>
              <div className="flex gap-1.5">
                <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Submit'}</SubmitButton>
                <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
              </div>
            </div>

            {/* ── Default Parameters ── */}
            <ModuleCard compact title="Default Parameters" icon={<FileBarChart2 size={13} className="text-blue-600" />}>
              <div className="grid grid-cols-7 gap-2">
                <FormikInput  compact label="Date"        name="date"        type="date" />
                <FormikSelect compact label="Shift"       name="shft"        options={['A', 'B', 'C', { label: 'G', value: 'General' }]} />
                <FormikSelect compact label="Ground Oper" name="gr_f_opr"    options={userOptions} />
                <FormikSelect compact label="Die"         name="die"         options={userOptions} />
                <FormikSelect compact label="Furnace"     name="furnace_opr" options={userOptions} />
                <FormikSelect compact label="SIC"         name="sic"         options={userOptions} />
                <FormikSelect compact label="Maint"       name="maint"       options={['Select', 'Maint A', 'Maint B']} />
              </div>
            </ModuleCard>

            {/* ── Grouped DT / Preform table ── */}
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                  <thead className="sticky top-0 bg-slate-700 z-10">
                    <tr>
                      <th className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 text-center w-10">DT</th>
                      <th className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 text-center w-16">Speed</th>
                      <th className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 text-center w-16">Plan</th>
                      {PREFORM_COLS.map(c => (
                        <th key={c.key} className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 text-center">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 text-center w-20">Drawn Length</th>
                      <th className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap text-center w-16">Efficiency</th>
                    </tr>
                  </thead>

                  <FieldArray name="towers">
                    {() => (
                      <tbody>
                        {values.towers.map((tower, tIdx) => {
                          const plan = calcPlan(tower.speed);
                          const drawn = calcDrawn(tower.preforms);
                          const eff = calcEfficiency(drawn, plan);
                          const span = tower.preforms.length;

                          return (
                            <FieldArray key={tower.dt} name={`towers.${tIdx}.preforms`}>
                              {({ push, remove }) => (
                                <>
                                  {tower.preforms.map((pf, pIdx) => (
                                    <tr key={pIdx} className={`border-t ${pIdx === 0 ? 'border-slate-300' : 'border-slate-100'} hover:bg-blue-50/20 transition-colors`}>
                                      {/* ── Per-DT cells: only on first preform row, rowSpan over the group ── */}
                                      {pIdx === 0 && (
                                        <>
                                          <td rowSpan={span} className="px-2 py-1 text-center border-r border-slate-200 bg-slate-50/60 align-middle">
                                            <span className="text-xs font-bold text-blue-700">{tower.dt}</span>
                                          </td>
                                          <td rowSpan={span} className="px-1 py-1 border-r border-slate-200 bg-amber-50/40 align-middle">
                                            <TInput name={`towers.${tIdx}.speed`} type="number" />
                                          </td>
                                          <td rowSpan={span} className="px-1 py-1 border-r border-slate-200 bg-slate-50/60 align-middle text-center">
                                            <span className="text-[10px] font-mono font-semibold text-slate-600">{plan.toFixed(2)}</span>
                                          </td>
                                        </>
                                      )}

                                      {/* ── Per-preform editable cells ── */}
                                      {PREFORM_COLS.map(c => (
                                        <td key={c.key} className="px-1 py-1 border-r border-slate-100">
                                          <TInput name={`towers.${tIdx}.preforms.${pIdx}.${c.key}`} type={c.type} />
                                        </td>
                                      ))}

                                      {/* ── Per-DT derived cells: only on first preform row ── */}
                                      {pIdx === 0 && (
                                        <>
                                          <td rowSpan={span} className="px-1 py-1 border-r border-slate-200 bg-slate-50/60 align-middle text-center">
                                            <span className="text-[10px] font-mono font-semibold text-slate-700">{drawn.toFixed(2)}</span>
                                          </td>
                                          <td rowSpan={span} className="px-1 py-1 align-middle text-center bg-emerald-50/40">
                                            <span className="text-[10px] font-mono font-bold text-emerald-700">{eff.toFixed(2)}%</span>
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  ))}

                                  {/* ── Add / Remove preform row controls for this DT ── */}
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={3 + PREFORM_COLS.length + 2} className="px-2 py-1 border-t border-slate-200">
                                      <div className="flex gap-2">
                                        <button type="button"
                                          onClick={() => push(makePreform())}
                                          className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                                          <Plus size={10} /> Add Preform (DT {tower.dt})
                                        </button>
                                        <button type="button"
                                          onClick={() => tower.preforms.length > 1 && remove(tower.preforms.length - 1)}
                                          disabled={tower.preforms.length <= 1}
                                          className="flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                          <Minus size={10} /> Remove
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              )}
                            </FieldArray>
                          );
                        })}
                      </tbody>
                    )}
                  </FieldArray>
                </table>
              </div>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
  );
};

export default DrawShiftReport;
