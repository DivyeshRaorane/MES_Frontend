import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { RefreshCcw } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getShifts, getDrawUsers, submitShiftPlan } from '../services/draw_shift_plan.api';

const today = new Date().toISOString().split('T')[0];

/* ── Editable table cell ── */
const TInput = ({ value, onChange, disabled = false, type = 'text' }) => (
  <input type={type} value={value ?? ''} onChange={onChange} disabled={disabled}
    className={`w-full px-1.5 py-1 text-xs text-center rounded outline-none transition-all border
      ${disabled ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
        : 'bg-transparent border-transparent focus:bg-white focus:border-blue-300 hover:bg-slate-50'}`} />
);

const TABLE_COLS = [
  { label: 'DT', key: 'tower_no' },
  { label: 'Theo Speed', key: 'theo_speed' },
  { label: 'Actual Speed', key: 'actu_speed' },
  { label: 'C/O Num', key: 'ch_ov_num' },
  { label: 'C/O Time', key: 'ch_ov_time' },
  { label: 'C/O TL', key: 'ch_ov_tl' },
  { label: 'Fur CL Time', key: 'fur_cl_time' },
  { label: 'PM TL', key: 'pm_tl' },
  { label: 'Downtime', key: 'downtime' },
  { label: 'Draw Plan', key: 'draw_plan' },
  { label: 'Shift Time', key: 'shift_time' },
];

const makeRows = () =>
  [1, 2, 3, 4].map(dt => ({
    tower_no: dt,
    theo_speed: '',
    actu_speed: '',
    ch_ov_num: '',
    ch_ov_time: '',
    ch_ov_tl: '',
    fur_cl_time: '',
    pm_tl: '',
    downtime: '',
    draw_plan: '',
    shift_time: '',
  }));

const validationSchema = Yup.object({
  plan_date: Yup.string().required('Date is required'),
  shift: Yup.string().required('Shift is required'),
  die_operator: Yup.string().required('Die Operator is required'),
  ground_operator: Yup.string().required('Ground Operator is required'),
  furnace_operator: Yup.string().required('Furnace Operator is required'),
  shift_incharge: Yup.string().required('Shift Incharge is required'),
});

const initialValues = {
  plan_date: today,
  shift: '',
  die_operator: '',
  ground_operator: '',
  furnace_operator: '',
  shift_incharge: '',
};

/* ══════════════════════════════════════════════════════════ */
const DrawShiftPlan = () => {
  const [rows, setRows] = useState(makeRows());
  const [shifts, setShifts] = useState([]);
  const [drawUsers, setDrawUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, uRes] = await Promise.all([getShifts(), getDrawUsers()]);
        setShifts(sRes?.data || []);
        setDrawUsers(uRes?.data || []);
      } catch (_) {}
    })();
  }, []);

  const shiftOptions = shifts.map(s => ({ label: s.shift_name, value: s.shift_name }));
  const userOptions = drawUsers.map(u => ({ label: u.draw_user_name, value: u.draw_user_name }));

  const updateRow = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: value };
      // Auto-calculate ch_ov_tl = ch_ov_num * ch_ov_time
      if (field === 'ch_ov_num' || field === 'ch_ov_time') {
        const num = parseFloat(updated.ch_ov_num) || 0;
        const time = parseFloat(updated.ch_ov_time) || 0;
        updated.ch_ov_tl = (num * time).toFixed(3);
      }
      // Auto-calculate draw_plan = shift_time - ch_ov_tl - fur_cl_time - pm_tl - downtime
      const st = parseFloat(updated.shift_time) || 0;
      const coTl = parseFloat(updated.ch_ov_tl) || 0;
      const fc = parseFloat(updated.fur_cl_time) || 0;
      const pm = parseFloat(updated.pm_tl) || 0;
      const dt = parseFloat(updated.downtime) || 0;
      updated.draw_plan = (st - coTl - fc - pm - dt).toFixed(3);
      return updated;
    }));
  };

  /* ── Totals ── */
  const totals = TABLE_COLS.slice(1).map(col => {
    if (col.key === 'tower_no') return '';
    const sum = rows.reduce((s, r) => s + (parseFloat(r[col.key]) || 0), 0);
    return sum.toFixed(1);
  });

  const handleSubmit = async (values) => {
    // Validate rows have data
    const hasEmpty = rows.some(r => !r.theo_speed && !r.actu_speed && !r.shift_time);
    if (hasEmpty) { showError('Fill tower data for all DTs'); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        towers: rows.map(r => ({
          tower_no: r.tower_no,
          theo_speed: parseFloat(r.theo_speed) || 0,
          actu_speed: parseFloat(r.actu_speed) || 0,
          ch_ov_num: parseInt(r.ch_ov_num) || 0,
          ch_ov_time: parseFloat(r.ch_ov_time) || 0,
          ch_ov_tl: parseFloat(r.ch_ov_tl) || 0,
          fur_cl_time: parseFloat(r.fur_cl_time) || 0,
          pm_tl: parseFloat(r.pm_tl) || 0,
          downtime: parseFloat(r.downtime) || 0,
          draw_plan: parseFloat(r.draw_plan) || 0,
          shift_time: parseFloat(r.shift_time) || 0,
        })),
      };
      const res = await submitShiftPlan(payload);
      if (res?.success) { showSuccess('Shift plan saved for all 4 towers!'); setRows(makeRows()); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={initialValues} validationSchema={validationSchema} validateOnChange={false} validateOnBlur={true}
          onSubmit={handleSubmit}>
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* Header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Shift Plan</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setRows(makeRows()); }}>Reset</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Submit Plan'}
                  </SubmitButton>
                </div>
              </div>

              {/* Form fields */}
              <ModuleCard compact title="Shift Details" icon={<RefreshCcw size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-6 gap-2">
                  <FormikInput compact label="Date" name="plan_date" type="date" />
                  <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />
                  <FormikSelect compact label="Die Operator" name="die_operator" options={userOptions} />
                  <FormikSelect compact label="Ground Operator" name="ground_operator" options={userOptions} />
                  <FormikSelect compact label="Furnace Operator" name="furnace_operator" options={userOptions} />
                  <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={userOptions} />
                </div>
              </ModuleCard>

              {/* Table */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr>
                        {TABLE_COLS.map(col => (
                          <th key={col.key} className="px-2 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, idx) => (
                        <tr key={row.tower_no} className="hover:bg-blue-50/30 transition-colors">
                          {/* DT (read-only) */}
                          <td className="px-2 py-1.5 text-center border-r border-slate-100">
                            <span className="text-xs font-bold text-blue-700">DT {row.tower_no}</span>
                          </td>
                          {/* Theo Speed */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.theo_speed} onChange={e => updateRow(idx, 'theo_speed', e.target.value)} />
                          </td>
                          {/* Actual Speed */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.actu_speed} onChange={e => updateRow(idx, 'actu_speed', e.target.value)} />
                          </td>
                          {/* C/O Num */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.ch_ov_num} onChange={e => updateRow(idx, 'ch_ov_num', e.target.value)} />
                          </td>
                          {/* C/O Time */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.ch_ov_time} onChange={e => updateRow(idx, 'ch_ov_time', e.target.value)} />
                          </td>
                          {/* C/O TL (auto-calc) */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.ch_ov_tl} disabled />
                          </td>
                          {/* Fur CL Time */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.fur_cl_time} onChange={e => updateRow(idx, 'fur_cl_time', e.target.value)} />
                          </td>
                          {/* PM TL */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.pm_tl} onChange={e => updateRow(idx, 'pm_tl', e.target.value)} />
                          </td>
                          {/* Downtime */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput type="number" value={row.downtime} onChange={e => updateRow(idx, 'downtime', e.target.value)} />
                          </td>
                          {/* Draw Plan (auto-calc) */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.draw_plan} disabled />
                          </td>
                          {/* Shift Time */}
                          <td className="px-1 py-1">
                            <TInput type="number" value={row.shift_time} onChange={e => updateRow(idx, 'shift_time', e.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-slate-800 text-white z-10">
                      <tr>
                        <td className="px-2 py-2 text-[9px] font-black uppercase text-center border-r border-slate-600">Total</td>
                        {totals.map((val, i) => (
                          <td key={i} className="px-2 py-2 border-r border-slate-600 last:border-0">
                            <div className="w-full h-6 bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold">{val}</div>
                          </td>
                        ))}
                      </tr>
                    </tfoot>
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

export default DrawShiftPlan;
