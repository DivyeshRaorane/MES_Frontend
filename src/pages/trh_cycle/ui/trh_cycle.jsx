import { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Droplets, Activity, Plus, Minus, Scan } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../utils/toastService';
import { fetchTrhByBarcode, saveTrhEntry } from '../services/trh_cycle.api';

/* ── Compact table cell ── */
const TC = ({ name, type = 'text', placeholder = '', w = 'w-20' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className={`${w} bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-center transition-all`} />
);

/* ── Compact select ── */
const TS = ({ name, options }) => (
  <div className="relative">
    <Field as="select" name={name}
      className="w-24 appearance-none bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer pr-4">
      {options.map(o => <option key={o}>{o}</option>)}
    </Field>
    <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
  </div>
);

/* ── Fixed steps per cycle ── */
const STEPS = [
  { temp: 23, rh: '50%' },
  { temp: 85, rh: '95%' },
  { temp: 85, rh: '95%' },
  { temp: -10, rh: '0%' },
];

const makeStep = (temp, rh) => ({
  temp, rh,
  trh_date: '', trh_time: '',
  at_1550: '', at_1625: '',
  tested_by: '',
});

const makeCycle = () => ({ steps: STEPS.map(s => makeStep(s.temp, s.rh)) });

const today = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const buildInitialValues = () => ({
  barcode_id: '',
  preform_id: '',
  tower_no: '',
  spool_id: '',
  total_length: '',
  testing_standard: '',
  start_date: today,
  start_time: nowTime,
  end_date: '',
  end_time: '',
  remark: '',
  at_1310: '',
  at_1550: '',
  at_1625: '',
  cycles: [makeCycle()],
});

const validationSchema = Yup.object().shape({
  barcode_id: Yup.string().required('Barcode ID is required'),
  testing_standard: Yup.string().required('Testing Standard is required'),
  start_date: Yup.string().required('Start Date is required'),
  at_1310: Yup.number().typeError('Must be a number').required('Required'),
  at_1550: Yup.number().typeError('Must be a number').required('Required'),
  at_1625: Yup.number().typeError('Must be a number').required('Required'),
});

/* ══════════════════════════════════════════════════════════ */
const TRH_Cycle = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState(null);

  /* ── Fetch bobbin info + existing TRH data ── */
  const handleBarcodeFetch = async (barcode, setValues) => {
    const val = barcode.trim();
    if (!val) return;
    setLoading(true);
    setExistingEntryId(null);
    try {
      const res = await fetchTrhByBarcode(val);

      let newVals = buildInitialValues();
      newVals.barcode_id = val;

      // Fill bobbin info
      if (res?.bobbin) {
        newVals.preform_id = res.bobbin.preform_id || '';
        newVals.tower_no = res.bobbin.tower_no || '';
        newVals.spool_id = res.bobbin.spool_id || '';
        newVals.total_length = res.bobbin.total_length || res.bobbin.fiber_length || '';
      }

      // Fill existing trh_entry if exists
      if (res?.trh_entry) {
        const te = res.trh_entry;
        setExistingEntryId(te.trh_entry_id);
        newVals.testing_standard = te.testing_standard || '';
        newVals.start_date = te.start_date ? te.start_date.split('T')[0] : today;
        newVals.start_time = te.start_time || nowTime;
        newVals.end_date = te.end_date ? te.end_date.split('T')[0] : '';
        newVals.end_time = te.end_time || '';
        newVals.remark = te.remark || '';
        newVals.at_1310 = te.at_1310 ?? '';
        newVals.at_1550 = te.at_1550 ?? '';
        newVals.at_1625 = te.at_1625 ?? '';
        showWarning('Existing TRH entry found. Cycle data loaded.');
      }

      // Fill existing cycles if any
      if (res?.cycles && res.cycles.length > 0) {
        // Group cycles by cycle_no
        const grouped = {};
        res.cycles.forEach(row => {
          const cn = row.cycle_no;
          if (!grouped[cn]) grouped[cn] = [];
          grouped[cn].push(row);
        });

        const cycleKeys = Object.keys(grouped).sort((a, b) => a - b);
        newVals.cycles = cycleKeys.map(cn => {
          const rows = grouped[cn];
          // Map rows to steps
          const steps = rows.map(r => ({
            temp: r.temperature,
            rh: r.rh || '',
            trh_date: r.trh_date ? r.trh_date.split('T')[0] : '',
            trh_time: r.trh_time || '',
            at_1550: r.at_1550 ?? '',
            at_1625: r.at_1625 ?? '',
            tested_by: r.tested_by || '',
          }));
          return { steps };
        });
      }

      setValues(newVals);
      setFetched(true);
    } catch (err) {
      if (err?.response?.status === 404) {
        showError('Bobbin not found for this Barcode ID');
        setFetched(false);
      } else {
        showError(err?.response?.data?.message || 'Failed to fetch data');
        setFetched(false);
      }
    }
    setLoading(false);
  };

  /* ── Submit ── */
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      // Build cycle rows
      const cycles = [];
      values.cycles.forEach((cycle, ci) => {
        cycle.steps.forEach(step => {
          cycles.push({
            cycle_no: ci + 1,
            temperature: step.temp,
            rh: step.rh,
            trh_date: step.trh_date || null,
            trh_time: step.trh_time || null,
            at_1550: step.at_1550 ? Number(step.at_1550) : null,
            at_1625: step.at_1625 ? Number(step.at_1625) : null,
            tested_by: step.tested_by || null,
          });
        });
      });

      const payload = {
        bobbin_no: values.barcode_id,
        preform_id: values.preform_id,
        tower_no: values.tower_no ? Number(values.tower_no) : null,
        spool_id: values.spool_id,
        total_length: values.total_length ? Number(values.total_length) : null,
        testing_standard: values.testing_standard,
        start_date: values.start_date,
        start_time: values.start_time,
        end_date: values.end_date || null,
        end_time: values.end_time || null,
        remark: values.remark || null,
        at_1310: Number(values.at_1310),
        at_1550: Number(values.at_1550),
        at_1625: Number(values.at_1625),
        existing_id: existingEntryId,
        cycles,
      };

      const res = await saveTrhEntry(payload);
      if (res?.success) {
        showSuccess(existingEntryId ? 'TRH entry updated successfully' : 'TRH entry saved successfully');
        resetForm({ values: buildInitialValues() });
        setFetched(false);
        setExistingEntryId(null);
      } else {
        showError(res?.message || 'Save failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to save TRH entry');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Formik
          initialValues={buildInitialValues()}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm, values, setValues, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Header fields ── */}
              <ModuleCard compact title="TRH Cycle Entry" icon={<Droplets size={13} className="text-violet-600" />}>
                <div className="grid grid-cols-4 gap-2">
                  {/* Barcode ID */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-bold text-slate-800 uppercase ml-0.5">Barcode ID</label>
                    <div className="flex items-center border border-slate-200 rounded bg-slate-100 overflow-hidden">
                      <input
                        value={values.barcode_id}
                        onChange={(e) => setFieldValue('barcode_id', e.target.value)}
                        onBlur={() => handleBarcodeFetch(values.barcode_id, setValues)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeFetch(values.barcode_id, setValues); } }}
                        className="flex-1 px-2 py-1.5 text-xs outline-none bg-transparent font-semibold"
                        placeholder="Scan barcode..."
                      />
                      <button type="button" onClick={() => handleBarcodeFetch(values.barcode_id, setValues)}
                        disabled={loading}
                        className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                        <Scan size={12} />
                      </button>
                    </div>
                  </div>
                  <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                  <FormikInput compact label="Tower No" name="tower_no" readOnly />
                  <FormikInput compact label="Spool ID" name="spool_id" readOnly />
                  <FormikInput compact label="Total Length (km)" name="total_length" readOnly />
                  <FormikSelect compact label="Testing Standard" name="testing_standard"
                    options={['IEC 60793', 'ITU-T G.652', 'ITU-T G.657', 'Other']} />
                  <FormikInput compact label="Start Date" name="start_date" type="date" />
                  <FormikInput compact label="Start Time" name="start_time" type="time" />
                  <FormikInput compact label="End Date" name="end_date" type="date" />
                  <FormikInput compact label="End Time" name="end_time" type="time" />
                  <div className="col-span-2">
                    <FormikTextarea compact label="Remark" name="remark" rows={2} placeholder="General test notes..." />
                  </div>
                </div>

                {/* Initial Attenuation */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Activity size={12} className="text-violet-600" />
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Initial Attenuation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <FormikInput compact label="At 1310 (dB)" name="at_1310" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="At 1550 (dB)" name="at_1550" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="At 1625 (dB)" name="at_1625" type="number" step="0.001" placeholder="0.000" />
                  </div>
                </div>
              </ModuleCard>

              {/* ── Cycle Table with Add/Remove ── */}
              <FieldArray name="cycles">
                {({ push, remove, form }) => (
                  <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                    {/* Add / Remove cycle buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button type="button" onClick={() => push(makeCycle())}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                        <Plus size={11} /> Add Cycle
                      </button>
                      <button type="button"
                        onClick={() => form.values.cycles.length > 1 && remove(form.values.cycles.length - 1)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                        <Minus size={11} /> Remove Cycle
                      </button>
                      <span className="text-[9px] text-slate-400 font-medium self-center">
                        {form.values.cycles.length} cycle{form.values.cycles.length !== 1 ? 's' : ''}
                      </span>
                      {existingEntryId && (
                        <span className="text-[9px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-300 self-center ml-auto">
                          Existing — Update Mode
                        </span>
                      )}
                    </div>

                    {/* Scrollable table */}
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="overflow-auto flex-1">
                        <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                          <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-800 text-white">
                              <th rowSpan={2} className="px-3 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-16 align-middle">Cycle No</th>
                              <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Temp (°C)</th>
                              <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">RH</th>
                              <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Date</th>
                              <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Time</th>
                              <th colSpan={2} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-700">Attenuation (dB)</th>
                              <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase text-center align-middle">Tested By</th>
                            </tr>
                            <tr className="bg-slate-700 text-slate-200">
                              <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">1550 nm</th>
                              <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">1625 nm</th>
                            </tr>
                          </thead>

                          <tbody>
                            {form.values.cycles.map((cycle, ci) =>
                              cycle.steps.map((step, si) => (
                                <tr key={`${ci}-${si}`}
                                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${si === 0 ? 'border-t-2 border-t-slate-300' : ''}`}>
                                  {si === 0 && (
                                    <td rowSpan={cycle.steps.length}
                                      className="px-2 py-1 text-xs font-bold text-slate-600 text-center border-r border-slate-200 bg-slate-50/80 align-middle">
                                      {ci + 1}
                                    </td>
                                  )}
                                  <td className="px-2 py-1 text-center border-r border-slate-100">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      step.temp === 23 ? 'bg-blue-100 text-blue-700' :
                                      step.temp === 85 ? 'bg-rose-100 text-rose-700' :
                                      'bg-indigo-100 text-indigo-700'
                                    }`}>{step.temp}°C</span>
                                  </td>
                                  <td className="px-2 py-1 text-center border-r border-slate-100">
                                    <span className="text-[10px] font-bold text-blue-600">{step.rh}</span>
                                  </td>
                                  <td className="px-1 py-1 border-r border-slate-100">
                                    <TC name={`cycles.${ci}.steps.${si}.trh_date`} type="date" w="w-28" />
                                  </td>
                                  <td className="px-1 py-1 border-r border-slate-100">
                                    <TC name={`cycles.${ci}.steps.${si}.trh_time`} type="time" w="w-24" />
                                  </td>
                                  <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20">
                                    <TC name={`cycles.${ci}.steps.${si}.at_1550`} placeholder="—" />
                                  </td>
                                  <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20">
                                    <TC name={`cycles.${ci}.steps.${si}.at_1625`} placeholder="—" />
                                  </td>
                                  <td className="px-1 py-1">
                                    <TS name={`cycles.${ci}.steps.${si}.tested_by`}
                                      options={['Select', 'Op A', 'Op B', 'Op C', 'Manager']} />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </FieldArray>

              {/* ── Actions ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => { resetForm(); setFetched(false); setExistingEntryId(null); }}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting || !fetched}>
                  {submitting ? 'Saving...' : existingEntryId ? 'Update' : 'Submit'}
                </SubmitButton>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TRH_Cycle;
