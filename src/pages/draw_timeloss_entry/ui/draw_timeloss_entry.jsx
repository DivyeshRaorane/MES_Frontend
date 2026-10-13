import { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Clock } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { submitDrawTimeloss, getDrawUsers } from '../services/draw_timeloss_entry.api';

const FIXED_SPEED = 2700;

/* ── Compact table-cell input ── */
const TInput = ({ name, type = 'text', placeholder = '', disabled = false }) => (
  <Field name={name} type={type} placeholder={placeholder} disabled={disabled}
    className={`w-full px-1 py-0.5 text-[10px] outline-none rounded border transition-all text-center min-w-[40px]
      ${disabled
        ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
        : 'bg-transparent border-transparent focus:bg-white focus:ring-1 focus:ring-blue-300 focus:border-blue-200'}`} />
);

/* ── Column definitions (label + key + whether auto-calculated) ── */
const COLUMNS = [
  { label: 'DT No',      key: 'dt_no',       auto: true },   // default, read-only
  { label: 'Speed',      key: 'speed',       auto: true },   // fixed 2700
  { label: 'Plan',       key: 'plan',        auto: true },
  { label: 'Total Time', key: 'total_time',  auto: true },
  { label: 'Draw Length',key: 'draw_length', auto: false },
  { label: 'Gap',        key: 'gap',         auto: true },
  { label: 'PM',         key: 'pm',          auto: false },
  { label: 'F/C',        key: 'f_c',         auto: false },
  { label: 'C/O',        key: 'c_o',         auto: false },
  { label: 'S/UP',       key: 's_up',        auto: false },
  { label: 'R/UP',       key: 'r_up',        auto: false },
  { label: 'BAD',        key: 'bad',         auto: false },
  { label: 'BBD',        key: 'bbd',         auto: false },
  { label: 'BAC',        key: 'bac',         auto: false },
  { label: 'Process',    key: 'process',     auto: false },
  { label: 'Maint',      key: 'maint',       auto: false },
  { label: 'Utility',    key: 'utility',     auto: false },
  { label: 'EOT',        key: 'eot',         auto: false },
  { label: 'MNA',        key: 'mna',         auto: false },
  { label: 'Speed Loss', key: 'speed_loss',  auto: false },
  { label: 'Trail',      key: 'trail',       auto: false },
  { label: 'No Plan',    key: 'no_plan',     auto: false },
  { label: 'Time Loss',  key: 'time_loss',   auto: true },
  { label: 'Diff',       key: 'diff',        auto: false },
];

const ALL_KEYS = COLUMNS.map(c => c.key);

/* ── Per-row auto-calculations ── */
const computeRow = (row) => {
  const speed = FIXED_SPEED;
  const plan = (speed * 480) / 1000;
  const totalTime = plan / 2.7;
  const drawLength = parseFloat(row.draw_length) || 0;
  const gap = plan - drawLength;
  const timeLoss = (gap / speed) * 1000;
  return {
    ...row,
    speed,
    plan: plan.toFixed(3),
    total_time: totalTime.toFixed(3),
    gap: gap.toFixed(3),
    time_loss: timeLoss.toFixed(3),
  };
};

const makeRow = (dt) =>
  computeRow({
    ...ALL_KEYS.reduce((a, k) => ({ ...a, [k]: '' }), {}),
    dt_no: dt,
  });

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  floor_type:    '',          // 'furnace' | 'ground'
  date:          today,
  shift:         '',
  operator:      '',
  shift_incharge:'',
  rows:          [1, 2, 3, 4].map(makeRow),
};

/* ══════════════════════════════════════════════════════════ */
const DrawTimelossEntry = () => {
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
          // ── Client-side validation (mirrors backend hard rules) ──
          if (values.floor_type !== 'furnace' && values.floor_type !== 'ground') {
            showError('Select a floor type (Furnace or Ground)');
            setSubmitting(false);
            return;
          }
          if (!values.date) {
            showError('Date is required');
            setSubmitting(false);
            return;
          }
          if (!values.shift || values.shift === 'Select') {
            showError('Shift is required');
            setSubmitting(false);
            return;
          }
          if (values.rows.length !== 4) {
            showError('Exactly 4 tower rows are required');
            setSubmitting(false);
            return;
          }

          // ── Build payload: all row fields as numbers, no logged_in_user / created_at ──
          const payload = {
            floor_type: values.floor_type,
            date: values.date,
            shift: values.shift,
            operator: values.operator,
            shift_incharge: values.shift_incharge,
            rows: values.rows.map((r, i) => {
              const out = {};
              ALL_KEYS.forEach((k) => {
                if (k === 'dt_no') out[k] = Number(r.dt_no) || i + 1;
                else if (k === 'speed') out[k] = FIXED_SPEED;
                else out[k] = Number.parseFloat(r[k]) || 0;
              });
              return out;
            }),
          };

          try {
            const res = await submitDrawTimeloss(payload);
            if (res?.success) {
              showSuccess(res.message || 'Draw timeloss entry saved for 4 towers.');
            } else {
              showError(res?.message || 'Failed to save entry');
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
        {({ values, setFieldValue, resetForm, isSubmitting }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
<div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw TimeLoss Entry</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Submit'}</SubmitButton>                  
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
            {/* ── Header fields ── */}
            <ModuleCard compact title="Default Entry" icon={<Clock size={13} className="text-blue-600" />}>
              <div className="flex flex-col gap-2">

                
                <div className="flex items-center gap-6 pb-2 border-b border-slate-100">

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

                {/* Row 2: Date, Shift, Operator, Shift Incharge */}
                <div className="grid grid-cols-4 gap-2">
                  <FormikInput  compact label="Date"           name="date"           type="date" />
                  <FormikSelect compact label="Shift"          name="shift"          options={['A','B','C',{ label: 'G', value: 'General' }]} />
                  <FormikSelect compact label="Operator"       name="operator"       options={userOptions} />
                  <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={userOptions} />
                </div>
              </div>
            </ModuleCard>

            {/* ── FieldArray table ── */}
            <FieldArray name="rows">
              {() => (
                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                  {/* Scrollable table */}
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                        <thead className="sticky top-0 z-20">
                          <tr className="bg-slate-800 text-white">
                            {COLUMNS.map((col, i) => (
                              <th key={col.key}
                                className={`px-2 py-2 text-[8px] font-bold uppercase whitespace-nowrap text-center align-middle
                                  ${col.auto ? 'bg-slate-700' : 'bg-slate-800'}
                                  ${i < COLUMNS.length - 1 ? 'border-r border-slate-600' : ''}`}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {values.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {COLUMNS.map((col, i) => {
                                const borderCls = i < COLUMNS.length - 1 ? 'border-r border-slate-100' : '';
                                /* DT No — read-only default */
                                if (col.key === 'dt_no') {
                                  return (
                                    <td key={col.key} className={`px-1 py-1 bg-slate-50/60 text-center ${borderCls}`}>
                                      <span className="text-[10px] font-bold text-blue-700">DT-{row.dt_no}</span>
                                    </td>
                                  );
                                }
                                /* Auto-calculated — read-only */
                                if (col.auto) {
                                  return (
                                    <td key={col.key} className={`px-1 py-1 bg-slate-50/40 ${borderCls}`}>
                                      <TInput name={`rows.${idx}.${col.key}`} disabled />
                                    </td>
                                  );
                                }
                                /* Manual input — recompute row on change */
                                return (
                                  <td key={col.key} className={`px-1 py-1 ${borderCls}`}>
                                    <Field name={`rows.${idx}.${col.key}`}>
                                      {({ field }) => (
                                        <input
                                          {...field}
                                          type="number"
                                          value={field.value ?? ''}
                                          onChange={(e) => {
                                            const next = computeRow({ ...row, [col.key]: e.target.value });
                                            setFieldValue(`rows.${idx}`, next);
                                          }}
                                          className="w-full bg-transparent px-1 py-0.5 text-[10px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded border border-transparent focus:border-blue-200 transition-all text-center min-w-[40px]"
                                        />
                                      )}
                                    </Field>
                                  </td>
                                );
                              })}
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
};

export default DrawTimelossEntry;
