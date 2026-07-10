import { useState, useRef } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Thermometer, Activity, Scan } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../utils/toastService';
import { fetchBobbinByBarcode, checkExistingTempEntry, saveTempEntry, updateTempEntry } from '../services/temp_entry.api';

const today = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const initialValues = {
  barcode_id: '',
  bobbin_fid: '',
  preform_id: '',
  spool_id: '',
  tower_no: '',
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
};

const validationSchema = Yup.object().shape({
  barcode_id: Yup.string().required('Barcode ID is required'),
  testing_standard: Yup.string().required('Testing Standard is required'),
  start_date: Yup.string().required('Start Date is required'),
  start_time: Yup.string().required('Start Time is required'),
  at_1310: Yup.number().typeError('Must be a number').required('AT 1310 is required'),
  at_1550: Yup.number().typeError('Must be a number').required('AT 1550 is required'),
  at_1625: Yup.number().typeError('Must be a number').required('AT 1625 is required'),
});

const TempEntry = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState(null); // temp_entry_id if exists
  const [entryCompleted, setEntryCompleted] = useState(false); // true if end_date & end_time exist
  const formRef = useRef(null);

  /* ── Fetch bobbin info + check existing temp_entry ── */
  const handleBarcodeFetch = async (barcode, setValues, currentValues) => {
    const val = barcode.trim();
    if (!val) return;
    setLoading(true);
    setExistingEntryId(null);
    setEntryCompleted(false);

    try {
      // Step 1: Fetch bobbin info
      const bobbinRes = await fetchBobbinByBarcode(val);
      if (!bobbinRes?.success || !bobbinRes.data) {
        showError(bobbinRes?.message || 'Bobbin not found for this Barcode ID');
        setFetched(false);
        setLoading(false);
        return;
      }

      const d = bobbinRes.data;
      let newVals = {
        ...initialValues,
        barcode_id: val,
        bobbin_fid: d.bobbin_fid || d.fid || '',
        preform_id: d.preform_id || '',
        spool_id: d.spool_id || '',
        tower_no: d.tower_no || '',
        total_length: d.total_length || d.fiber_length || '',
      };

      // Step 2: Check if temp_entry already exists for this bobbin_no
      try {
        const existRes = await checkExistingTempEntry(val);
        if (existRes?.exists && existRes.data) {
          const ex = existRes.data;
          setExistingEntryId(ex.temp_entry_id);

          // Fill form with existing values
          newVals = {
            ...newVals,
            testing_standard: ex.testing_standard || '',
            start_date: ex.start_date ? ex.start_date.split('T')[0] : '',
            start_time: ex.start_time || '',
            end_date: ex.end_date ? ex.end_date.split('T')[0] : '',
            end_time: ex.end_time || '',
            remark: ex.remark || '',
            at_1310: ex.at_1310 ?? '',
            at_1550: ex.at_1550 ?? '',
            at_1625: ex.at_1625 ?? '',
          };

          // Check if entry is already completed (has end_date and end_time)
          if (ex.end_date && ex.end_time) {
            setEntryCompleted(true);
            showError('This entry is already completed.');
          } else {
            showWarning('Existing entry found. You can update end date/time and submit.');
          }
        }
      } catch {
        // No existing entry — that's fine, it's a new entry
      }

      setValues(newVals);
      setFetched(true);
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to fetch bobbin info');
      setFetched(false);
    }
    setLoading(false);
  };

  /* ── Submit (Create or Update) ── */
  const handleSubmit = async (values, { resetForm }) => {
    // If entry already completed, block
    if (entryCompleted) {
      showError('This entry is already completed. No further changes allowed.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bobbin_no: values.barcode_id,
        bobbin_fid: values.bobbin_fid,
        preform_id: values.preform_id,
        spool_id: values.spool_id,
        tower_no: values.tower_no ? Number(values.tower_no) : null,
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
      };

      let res;
      if (existingEntryId) {
        // Update existing record
        res = await updateTempEntry(existingEntryId, payload);
      } else {
        // Create new record
        res = await saveTempEntry(payload);
      }

      if (res?.success) {
        showSuccess(existingEntryId ? 'Temp Entry updated successfully' : 'Temp Entry saved successfully');
        resetForm({ values: { ...initialValues, start_date: today, start_time: nowTime } });
        setFetched(false);
        setExistingEntryId(null);
        setEntryCompleted(false);
      } else {
        showError(res?.message || 'Save failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to save temp entry');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Formik
          innerRef={formRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm, values, setFieldValue, setValues }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Main fields ── */}
              <ModuleCard compact title="Temp Entry" icon={<Thermometer size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-4 gap-2">
                  {/* Barcode ID with fetch on blur/enter */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-bold text-slate-800 uppercase ml-0.5">Barcode ID</label>
                    <div className="flex items-center border border-slate-200 rounded bg-slate-100 overflow-hidden">
                      <input
                        value={values.barcode_id}
                        onChange={(e) => setFieldValue('barcode_id', e.target.value)}
                        onBlur={() => handleBarcodeFetch(values.barcode_id, setValues, values)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeFetch(values.barcode_id, setValues, values); } }}
                        className="flex-1 px-2 py-1.5 text-xs outline-none bg-transparent font-semibold"
                        placeholder="Scan barcode..."
                      />
                      <button type="button" onClick={() => handleBarcodeFetch(values.barcode_id, setValues, values)}
                        disabled={loading}
                        className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                        <Scan size={12} />
                      </button>
                    </div>
                  </div>
                  <FormikInput compact label="Bobbin FID" name="bobbin_fid" readOnly />
                  <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                  <FormikInput compact label="Tower No" name="tower_no" readOnly />
                  <FormikInput compact label="Spool ID" name="spool_id" readOnly />
                  <FormikInput compact label="Total Length (km)" name="total_length" readOnly />
                  <FormikSelect compact label="Testing Standard" name="testing_standard"
                    options={['IEC 60793', 'ITU-T G.652', 'ITU-T G.657', 'Other']} />
                  {/* Status badge */}
                  <div className="flex flex-col gap-0.5 justify-end">
                    {existingEntryId && (
                      <span className={`text-[9px] font-bold px-2 py-1.5 rounded text-center ${
                        entryCompleted
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}>
                        {entryCompleted ? 'Entry Completed' : 'Existing — Update Mode'}
                      </span>
                    )}
                  </div>
                  <FormikInput compact label="Start Date" name="start_date" type="date" />
                  <FormikInput compact label="Start Time" name="start_time" type="time" />
                  <FormikInput compact label="End Date" name="end_date" type="date" />
                  <FormikInput compact label="End Time" name="end_time" type="time" />
                  <div className="col-span-4">
                    <FormikTextarea compact label="Remark" name="remark" rows={2} placeholder="Enter remarks..." />
                  </div>
                </div>
              </ModuleCard>

              {/* ── Initial Attenuation ── */}
              <ModuleCard compact title="Initial Attenuation" icon={<Activity size={13} className="text-indigo-600" />}>
                <div className="grid grid-cols-3 gap-2">
                  <FormikInput compact label="At 1310 (dB)" name="at_1310" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="At 1550 (dB)" name="at_1550" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="At 1625 (dB)" name="at_1625" type="number" step="0.001" placeholder="0.000" />
                </div>
              </ModuleCard>

              {/* ── Actions ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => {
                  resetForm();
                  setFetched(false);
                  setExistingEntryId(null);
                  setEntryCompleted(false);
                }}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting || !fetched || entryCompleted}>
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

export default TempEntry;
