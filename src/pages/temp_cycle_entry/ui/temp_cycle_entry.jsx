import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Wind, Scan } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { saveCycleEntry, fetchCycleByBarcode } from '../services/temp_cycle_entry.api';

/* ── Compact table cell ── */
const TC = ({ name, type = 'text', placeholder = '', w = 'w-16' }) => (
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

const TEMPS = [23, -60, 85, -60, -85, 23];

/* Build initial values */
const buildInit = () => {
  const v = { barcode_id: '', result: '', phys_obs: '', prepared_by: '', checked_by: '' };
  TEMPS.forEach((_, i) => {
    const k = `r${i + 1}`;
    v[`${k}_date`]    = '';
    v[`${k}_time`]    = '';
    v[`${k}_a1550`]   = '';
    v[`${k}_a1625`]   = '';
    v[`${k}_ch1550`]  = '';
    v[`${k}_ch1625`]  = '';
    v[`${k}_opr`]     = '';
    v[`${k}_remark`]  = '';
  });
  return v;
};

const validationSchema = Yup.object().shape({
  barcode_id: Yup.string().required('Barcode ID is required'),
  result: Yup.string().required('Result is required'),
});

const CycleWiseEntry = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);

  /* ── Fetch existing cycle data for barcode ── */
  const handleBarcodeFetch = async (barcode, setValues) => {
    const val = barcode.trim();
    if (!val) return;
    setLoading(true);
    try {
      const res = await fetchCycleByBarcode(val);
      if (res?.exists && res.data?.length > 0) {
        // Fill form with existing cycle entries
        const newVals = buildInit();
        newVals.barcode_id = val;
        newVals.result = res.result || '';
        newVals.phys_obs = res.physical_obs || '';
        newVals.prepared_by = res.prepared_by || '';
        newVals.checked_by = res.checked_by || '';
        res.data.forEach((row, i) => {
          const k = `r${i + 1}`;
          newVals[`${k}_date`]   = row.date ? row.date.split('T')[0] : '';
          newVals[`${k}_time`]   = row.time || '';
          newVals[`${k}_a1550`]  = row.nm_1550 ?? '';
          newVals[`${k}_a1625`]  = row.nm_1625 ?? '';
          newVals[`${k}_ch1550`] = row.ch_nm_1550 ?? '';
          newVals[`${k}_ch1625`] = row.ch_nm_1625 ?? '';
          newVals[`${k}_opr`]    = row.operator || '';
          newVals[`${k}_remark`] = row.remark || '';
        });
        setValues(newVals);
        setFetched(true);
        showSuccess('Existing cycle data loaded');
      } else {
        // No existing data, just set barcode
        const newVals = buildInit();
        newVals.barcode_id = val;
        setValues(newVals);
        setFetched(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        // No existing entry — fresh form
        const newVals = buildInit();
        newVals.barcode_id = val;
        setValues(newVals);
        setFetched(true);
      } else {
        showError(err?.response?.data?.message || 'Failed to fetch cycle data');
        setFetched(false);
      }
    }
    setLoading(false);
  };

  /* ── Submit: insert each temp row + update temp_entry ── */
  const handleSubmit = async (values, { resetForm }) => {
    console.log("Values:", values)
    if (!values.barcode_id.trim()) { showError('Enter Barcode ID first'); return; }
    setSubmitting(true);
    try {
      // Build cycle rows
      const cycles = TEMPS.map((temp, i) => {
        const k = `r${i + 1}`;
        return {
          temperature: temp,
          date: values[`${k}_date`] || null,
          time: values[`${k}_time`] || null,
          nm_1550: values[`${k}_a1550`] ? Number(values[`${k}_a1550`]) : null,
          nm_1625: values[`${k}_a1625`] ? Number(values[`${k}_a1625`]) : null,
          ch_nm_1550: values[`${k}_ch1550`] ? Number(values[`${k}_ch1550`]) : null,
          ch_nm_1625: values[`${k}_ch1625`] ? Number(values[`${k}_ch1625`]) : null,
          operator: values[`${k}_opr`] || null,
          remark: values[`${k}_remark`] || null,
        };
      });

      const payload = {
        bobbin_no: values.barcode_id,
        result: values.result,
        physical_obs: values.phys_obs,
        prepared_by: values.prepared_by,
        checked_by: values.checked_by,
        cycles,
      };

      const res = await saveCycleEntry(payload);
      if (res?.success) {
        showSuccess('Cycle entry saved & temp_entry updated successfully');
        resetForm({ values: buildInit() });
        setFetched(false);
      } else {
        showError(res?.message || 'Save failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to save cycle entry');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Formik
          initialValues={buildInit()}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm, values, setValues, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <Wind size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Cycle Wise Attenuation Log</span>
                </div>

                <div className="overflow-auto flex-1">
                  <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                    <thead className="sticky top-0 z-20">
                      {/* Header row with barcode + meta fields */}
                      <tr className="bg-slate-100 border-t-2 border-slate-300">
                        <td colSpan={2} className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Barcode ID</span>
                            <div className="flex items-center border border-slate-200 rounded bg-white overflow-hidden">
                              <input
                                value={values.barcode_id}
                                onChange={(e) => setFieldValue('barcode_id', e.target.value)}
                                onBlur={() => handleBarcodeFetch(values.barcode_id, setValues)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeFetch(values.barcode_id, setValues); } }}
                                className="w-28 px-2 py-0.5 text-[10px] outline-none font-semibold"
                                placeholder="Scan..."
                              />
                              <button type="button" onClick={() => handleBarcodeFetch(values.barcode_id, setValues)}
                                disabled={loading}
                                className="px-1.5 py-0.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                                <Scan size={10} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td colSpan={2} className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-600 uppercase">Result</span>
                            <div className="relative">
                              <Field as="select" name="result"
                                className="appearance-none bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none pr-5 cursor-pointer w-24">
                                {['pass', 'fail'].map(o => <option key={o} value={o === 'Select' ? '' : o}>{o.toUpperCase()}</option>)}
                              </Field>
                              <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
                            </div>
                          </div>
                        </td>
                        <td colSpan={2} className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">PHY/D. Obs</span>
                            <Field name="phys_obs" placeholder=""
                              className="w-28 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none" />
                          </div>
                        </td>
                        <td colSpan={2} className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Prepared By</span>
                            <Field name="prepared_by" placeholder=""
                              className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none" />
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Checked By</span>
                            <Field name="checked_by" placeholder=""
                              className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none" />
                          </div>
                        </td>
                      </tr>
                      {/* Column headers */}
                      <tr className="bg-slate-800 text-white">
                        <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-14 align-middle">Temp (°C)</th>
                        <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Date</th>
                        <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Time</th>
                        <th colSpan={2} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800">Attenuation (dB)</th>
                        <th colSpan={2} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-amber-700">Change in Attenuation (dB)</th>
                        <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Operator</th>
                        <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase text-center align-middle">Remarks</th>
                      </tr>
                      <tr className="bg-slate-700 text-slate-200">
                        <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">1550 nm</th>
                        <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">1625 nm</th>
                        <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-amber-700/60">1550 nm</th>
                        <th className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-amber-700/60">1625 nm</th>
                      </tr>
                    </thead>

                    <tbody>
                      {TEMPS.map((temp, ti) => {
                        const k = `r${ti + 1}`;
                        return (
                          <tr key={ti}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${ti === 0 ? 'border-t-2 border-t-slate-300' : ''}`}>
                            <td className="px-2 py-2 text-xs font-bold text-center border-r border-slate-200 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                temp === 23  ? 'bg-blue-100 text-blue-700' :
                                temp === -60 ? 'bg-indigo-100 text-indigo-700' :
                                temp === -85 ? 'bg-purple-100 text-purple-700' :
                                               'bg-rose-100 text-rose-700'
                              }`}>{temp}°C</span>
                            </td>
                            <td className="px-1 py-1 border-r border-slate-100"><TC name={`${k}_date`} type="date" w="w-28" /></td>
                            <td className="px-1 py-1 border-r border-slate-100"><TC name={`${k}_time`} type="time" w="w-24" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`${k}_a1550`} placeholder="—" w="w-20" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`${k}_a1625`} placeholder="—" w="w-20" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/20"><TC name={`${k}_ch1550`} placeholder="—" w="w-20" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/20"><TC name={`${k}_ch1625`} placeholder="—" w="w-20" /></td>
                            <td className="px-1 py-1 border-r border-slate-100">
                              <TS name={`${k}_opr`} options={['Select', 'Op A', 'Op B', 'Op C']} />
                            </td>
                            <td className="px-1 py-1">
                              <TC name={`${k}_remark`} placeholder="Remark" w="w-28" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => { resetForm(); setFetched(false); }}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting || !fetched}>
                  {submitting ? 'Saving...' : 'Submit'}
                </SubmitButton>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CycleWiseEntry;
