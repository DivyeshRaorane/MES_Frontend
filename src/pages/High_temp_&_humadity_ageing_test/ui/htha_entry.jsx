import { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Flame, Activity, Plus, Minus, Scan } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../utils/toastService';
import { fetchHthaByBarcode, saveHthaEntry } from '../services/htha.api';

/* ── Compact table cell ── */
const TC = ({ name, type = 'text', placeholder = '', w = 'w-20' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className={`${w} bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-center transition-all`} />
);

const makeRow = () => ({ htha_date: '', day: '', at_1550: '', at_1625: '' });

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
  tested_by: '',
  checked_by: '',
  remark: '',
  at_1310: '',
  at_1550: '',
  at_1625: '',
  rows: [makeRow(), makeRow(), makeRow(), makeRow()],
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
const HighTempHumidityAgeing = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState(null);

  /* ── Fetch bobbin info + existing HTHA data ── */
  const handleBarcodeFetch = async (barcode, setValues) => {
    const val = barcode.trim();
    if (!val) return;
    setLoading(true);
    setExistingEntryId(null);
    try {
      const res = await fetchHthaByBarcode(val);

      let newVals = buildInitialValues();
      newVals.barcode_id = val;

      if (res?.bobbin) {
        newVals.preform_id = res.bobbin.preform_id || '';
        newVals.tower_no = res.bobbin.tower_no || '';
        newVals.spool_id = res.bobbin.spool_id || '';
        newVals.total_length = res.bobbin.total_length || res.bobbin.fiber_length || '';
      }

      if (res?.htha_entry) {
        const te = res.htha_entry;
        setExistingEntryId(te.htha_entry_id);
        newVals.testing_standard = te.testing_standard || '';
        newVals.start_date = te.start_date ? te.start_date.split('T')[0] : today;
        newVals.start_time = te.start_time || nowTime;
        newVals.end_date = te.end_date ? te.end_date.split('T')[0] : '';
        newVals.end_time = te.end_time || '';
        newVals.remark = te.remark || '';
        newVals.at_1310 = te.at_1310 ?? '';
        newVals.at_1550 = te.at_1550 ?? '';
        newVals.at_1625 = te.at_1625 ?? '';
        newVals.tested_by = te.tested_by || '';
        newVals.checked_by = te.checked_by || '';
        showWarning('Existing HTHA entry found. Data loaded.');
      }

      if (res?.cycles && res.cycles.length > 0) {
        newVals.rows = res.cycles.map(r => ({
          htha_date: r.htha_date ? r.htha_date.split('T')[0] : '',
          day: r.day ?? '',
          at_1550: r.at_1550 ?? '',
          at_1625: r.at_1625 ?? '',
        }));
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
      const rows = values.rows.map(row => ({
        htha_date: row.htha_date || null,
        day: row.day ? Number(row.day) : null,
        at_1550: row.at_1550 ? Number(row.at_1550) : null,
        at_1625: row.at_1625 ? Number(row.at_1625) : null,
      }));

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
        tested_by: values.tested_by || null,
        checked_by: values.checked_by || null,
        remark: values.remark || null,
        at_1310: Number(values.at_1310),
        at_1550: Number(values.at_1550),
        at_1625: Number(values.at_1625),
        existing_id: existingEntryId,
        rows,
      };

      const res = await saveHthaEntry(payload);
      if (res?.success) {
        showSuccess(existingEntryId ? 'HTHA entry updated successfully' : 'HTHA entry saved successfully');
        resetForm({ values: buildInitialValues() });
        setFetched(false);
        setExistingEntryId(null);
      } else {
        showError(res?.message || 'Save failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to save HTHA entry');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik
          initialValues={buildInitialValues()}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm, values, setValues, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-1.5 gap-1.5">

              {/* ── Header fields (compact) ── */}
              <div className="flex-shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Flame size={12} className="text-orange-600" />
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">High Temp & Humidity Ageing Test</span>
                  {existingEntryId && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 ml-auto">
                      Update Mode
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-7 gap-x-2 gap-y-1">
                  {/* Barcode ID */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold text-slate-800 uppercase ml-0.5">Barcode ID</label>
                    <div className="flex items-center border border-slate-200 rounded bg-slate-100 overflow-hidden">
                      <input
                        value={values.barcode_id}
                        onChange={(e) => setFieldValue('barcode_id', e.target.value)}
                        onBlur={() => handleBarcodeFetch(values.barcode_id, setValues)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeFetch(values.barcode_id, setValues); } }}
                        className="flex-1 px-1.5 py-1 text-[10px] outline-none bg-transparent font-semibold"
                        placeholder="Scan..."
                      />
                      <button type="button" onClick={() => handleBarcodeFetch(values.barcode_id, setValues)}
                        disabled={loading}
                        className="px-1.5 py-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                        <Scan size={10} />
                      </button>
                    </div>
                  </div>
                  <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                  <FormikInput compact label="Tower No" name="tower_no" readOnly />
                  <FormikInput compact label="Spool ID" name="spool_id" readOnly />
                  <FormikInput compact label="Length (km)" name="total_length" readOnly />
                  <FormikSelect compact label="Test Standard" name="testing_standard"
                    options={['IEC 60793', 'ITU-T G.652', 'ITU-T G.657', 'Other']} />
                  <FormikInput compact label="Tested By" name="tested_by" placeholder="Name" />
                  <FormikInput compact label="Start Date" name="start_date" type="date" />
                  <FormikInput compact label="Start Time" name="start_time" type="time" />
                  <FormikInput compact label="End Date" name="end_date" type="date" />
                  <FormikInput compact label="End Time" name="end_time" type="time" />
                  <FormikInput compact label="Checked By" name="checked_by" placeholder="Name" />
                  <FormikInput compact label="Remark" name="remark" placeholder="Remark..." />
                </div>
                {/* Initial Attenuation - inline */}
                <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Activity size={10} className="text-orange-600" />
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Init. Attn:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <FormikInput compact label="1310 (dB)" name="at_1310" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="1550 (dB)" name="at_1550" type="number" step="0.001" placeholder="0.000" />
                    <FormikInput compact label="1625 (dB)" name="at_1625" type="number" step="0.001" placeholder="0.000" />
                  </div>
                </div>
              </div>

              {/* ── Data Table with Add/Remove Row ── */}
              <FieldArray name="rows">
                {({ push, remove, form }) => (
                  <div className="flex flex-col flex-1 min-h-0 gap-1">

                    {/* Add / Remove buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button type="button" onClick={() => push(makeRow())}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                        <Plus size={10} /> Add Row
                      </button>
                      <button type="button"
                        onClick={() => form.values.rows.length > 1 && remove(form.values.rows.length - 1)}
                        className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                        <Minus size={10} /> Remove Row
                      </button>
                      <span className="text-[9px] text-slate-400 font-medium self-center">
                        {form.values.rows.length} row{form.values.rows.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Scrollable table */}
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-800 text-white">
                              <th className="px-3 py-2 text-[9px] font-bold uppercase border-r border-slate-600 text-center w-14">Sr. No</th>
                              <th className="px-3 py-2 text-[9px] font-bold uppercase border-r border-slate-600 text-center">Date</th>
                              <th className="px-3 py-2 text-[9px] font-bold uppercase border-r border-slate-600 text-center w-16">Day</th>
                              <th className="px-3 py-2 text-[9px] font-bold uppercase border-r border-slate-600 text-center bg-orange-700">AT 1550 (dB)</th>
                              <th className="px-3 py-2 text-[9px] font-bold uppercase text-center bg-orange-700">AT 1625 (dB)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.values.rows.map((_, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-1.5 text-xs font-bold text-slate-500 text-center border-r border-slate-100 bg-slate-50/50">
                                  {idx + 1}
                                </td>
                                <td className="px-1 py-1 border-r border-slate-100">
                                  <TC name={`rows.${idx}.htha_date`} type="date" w="w-full" />
                                </td>
                                <td className="px-1 py-1 border-r border-slate-100">
                                  <TC name={`rows.${idx}.day`} type="number" placeholder="1" w="w-full" />
                                </td>
                                <td className="px-1 py-1 border-r border-slate-100 bg-orange-50/20">
                                  <TC name={`rows.${idx}.at_1550`} placeholder="0.000" w="w-full" />
                                </td>
                                <td className="px-1 py-1 bg-orange-50/20">
                                  <TC name={`rows.${idx}.at_1625`} placeholder="0.000" w="w-full" />
                                </td>
                              </tr>
                            ))}
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

export default HighTempHumidityAgeing;
