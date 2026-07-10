import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { PackageCheck, Activity, User, Clock, Loader2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import {
  getD2ChambersInUse,
  getRunningBatchForReceiving,
  getQCUsers,
  completeD2Receiving,
} from '../services/d2_receiving.api';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/* ── Calculate process hours between start date/time and end date/time ── */
const calcProcessHours = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return '';
  
  // Convert start date to local YYYY-MM-DD (handles UTC ISO strings like "2026-07-02T18:30:00.000Z")
  const sDateObj = new Date(startDate);
  const sDate = isNaN(sDateObj.getTime())
    ? String(startDate).substring(0, 10)
    : `${sDateObj.getFullYear()}-${String(sDateObj.getMonth() + 1).padStart(2, '0')}-${String(sDateObj.getDate()).padStart(2, '0')}`;
  
  // End date — could be plain "2026-07-03" or ISO
  const eDateObj = new Date(endDate);
  const eDate = isNaN(eDateObj.getTime())
    ? String(endDate).substring(0, 10)
    : `${eDateObj.getFullYear()}-${String(eDateObj.getMonth() + 1).padStart(2, '0')}-${String(eDateObj.getDate()).padStart(2, '0')}`;

  // Normalize time: ensure HH:mm format
  const sTime = String(startTime).substring(0, 5);
  const eTime = String(endTime).substring(0, 5);

  const start = new Date(`${sDate}T${sTime}:00`);
  const end = new Date(`${eDate}T${eTime}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  const diffMs = end - start;
  if (diffMs <= 0) return '0';
  const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
  return String(hours);
};

const validationSchema = Yup.object().shape({
  d2_chamber: Yup.string().required('Chamber is required'),
  d2_batch_id: Yup.string().required('No running batch detected'),
  d2_end_date: Yup.string().required('End date is required'),
  d2_end_time: Yup.string().required('End time is required'),
  end_operator: Yup.string().required('Operator is required'),
});

const initialValues = {
  d2_chamber: '',
  d2_batch_id: '',
  d2_end_date: today(),
  d2_end_time: nowTime(),
  process_hours: '',
  end_operator: '',
};

/* ══════════════════════════════════════════════════════════ */
const D2Recieving = () => {
  const [chambers, setChambers] = useState([]);
  const [qcUsers, setQcUsers] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [batchInfo, setBatchInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Load master data ── */
  useEffect(() => {
    (async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          getD2ChambersInUse(),
          getQCUsers(),
        ]);
        if (cRes?.success) setChambers(cRes.data || []);
        setQcUsers(uRes?.data || []);
      } catch (e) {
        console.error('Master data load error:', e);
      }
    })();
  }, []);

  const qcUserOptions = qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }));
  const chamberOptions = chambers.map(c => ({ label: `Chamber ${c.d2_chamber_no}`, value: String(c.d2_chamber_no) }));

  /* ── Fetch running batch on chamber select ── */
  const handleChamberChange = async (chamberNo, setFieldValue, values) => {
    setFieldValue('d2_chamber', chamberNo);
    setFieldValue('d2_batch_id', '');
    setFieldValue('process_hours', '');
    setBatchError('');
    setBatchInfo(null);

    if (!chamberNo) return;

    setBatchLoading(true);
    try {
      const res = await getRunningBatchForReceiving(chamberNo);
      if (res?.success && res.data) {
        const { d2_batch_id, d2_start_date, d2_start_time, total_bobbins } = res.data;
        setFieldValue('d2_batch_id', d2_batch_id);
        setBatchInfo({ d2_batch_id, d2_start_date, d2_start_time, total_bobbins });
        // Calculate process hours using current end date/time from form (or fallback to now)
        const endDate = values.d2_end_date || today();
        const endTime = values.d2_end_time || nowTime();
        const hours = calcProcessHours(d2_start_date, d2_start_time, endDate, endTime);
        setFieldValue('process_hours', hours);
        setBatchError('');
      } else {
        setBatchError(res?.message || 'No active D2 batch is running in the selected chamber.');
      }
    } catch (e) {
      setBatchError(e?.response?.data?.message || 'Failed to fetch running batch.');
    }
    setBatchLoading(false);
  };

  /* ── Recalculate process hours when end date/time changes ── */
  const recalcHours = (endDate, endTime, setFieldValue) => {
    if (!batchInfo) return;
    const hours = calcProcessHours(batchInfo.d2_start_date, batchInfo.d2_start_time, endDate, endTime);
    setFieldValue('process_hours', hours);
  };

  /* ── Submit ── */
  const handleSubmit = async (values, { resetForm }) => {
    if (!values.d2_batch_id) {
      showError('No running batch found. Cannot complete receiving.');
      return;
    }
    if (!values.process_hours || Number(values.process_hours) <= 0) {
      showError('Process hours calculation invalid. Check end date/time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        d2_batch_id: values.d2_batch_id,
        d2_chamber: Number(values.d2_chamber),
        d2_end_date: values.d2_end_date,
        d2_end_time: values.d2_end_time,
        process_hours: Number(values.process_hours),
        end_operator: values.end_operator,
      };

      const res = await completeD2Receiving(payload);
      if (res?.success) {
        showSuccess(`D2 Receiving completed! ${batchInfo?.total_bobbins || ''} bobbin(s) in batch ${values.d2_batch_id} marked as D2 completed.`);
        resetForm({ values: { ...initialValues, d2_end_date: today(), d2_end_time: nowTime() } });
        setBatchInfo(null);
        setBatchError('');
        // Refresh chambers list (chamber may become active again)
        try {
          const cRes = await getD2ChambersInUse();
          if (cRes?.success) setChambers(cRes.data || []);
        } catch (_) {}
      } else {
        showError(res?.message || 'Receiving failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Action bar ── */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <PackageCheck size={16} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-slate-800 leading-none">D2 Receiving</h1>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Complete D2 Process &amp; Release Bobbins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setBatchError(''); setBatchInfo(null); }}>Reset</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting || !values.d2_batch_id}>
                    {submitting ? 'Processing...' : 'Complete Receiving'}
                  </SubmitButton>
                </div>
              </div>

              {/* ── Form Content ── */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="grid grid-cols-3 gap-3">

                  {/* ── Column 1: Chamber Info ── */}
                  <ModuleCard compact title="Chamber Information" icon={<Activity size={13} className="text-blue-600" />}>
                    <div className="flex flex-col gap-3">
                      <FormikSelect
                        compact
                        label="D2 Chamber"
                        name="d2_chamber"
                        options={chamberOptions}
                        onChange={(e) => handleChamberChange(e.target.value, setFieldValue, values)}
                      />

                      {/* Loading indicator */}
                      {batchLoading && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                          <Loader2 size={12} className="text-blue-500 animate-spin" />
                          <span className="text-[10px] text-blue-600 font-medium">Fetching batch...</span>
                        </div>
                      )}

                      {/* Batch error */}
                      {batchError && !batchLoading && (
                        <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-[10px] text-amber-700 font-medium">{batchError}</p>
                        </div>
                      )}

                      <FormikInput
                        compact
                        label="Running Batch ID"
                        name="d2_batch_id"
                        readOnly
                        placeholder="Auto-detected..."
                      />

                      {/* Total bobbins info */}
                      {batchInfo && (
                        <div className="bg-blue-50 rounded-lg border border-blue-100 px-3 py-2">
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Total Bobbins in Batch</p>
                          <p className="text-lg font-bold text-blue-800 mt-0.5">{batchInfo.total_bobbins}</p>
                        </div>
                      )}
                    </div>
                  </ModuleCard>

                  {/* ── Column 2: Receiving Info ── */}
                  <ModuleCard compact title="Receiving Information" icon={<Clock size={13} className="text-purple-600" />}>
                    <div className="flex flex-col gap-3">
                      <FormikInput
                        compact
                        label="End Date"
                        name="d2_end_date"
                        type="date"
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue('d2_end_date', val);
                          recalcHours(val, values.d2_end_time, setFieldValue);
                        }}
                      />
                      <FormikInput
                        compact
                        label="End Time"
                        name="d2_end_time"
                        type="time"
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue('d2_end_time', val);
                          recalcHours(values.d2_end_date, val, setFieldValue);
                        }}
                      />
                      <FormikInput
                        compact
                        label="Process Hours (Auto Calculated)"
                        name="process_hours"
                        readOnly
                        placeholder="Auto-calculated..."
                      />

                      {/* Visual process hours indicator */}
                      {values.process_hours && Number(values.process_hours) > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 px-3 py-2 text-center">
                          <p className="text-[9px] text-slate-500 font-medium">Processing Duration</p>
                          <p className="text-xl font-bold text-purple-700">{values.process_hours} <span className="text-xs font-medium text-purple-400">hours</span></p>
                        </div>
                      )}
                    </div>
                  </ModuleCard>

                  {/* ── Column 3: Operator Info ── */}
                  <ModuleCard compact title="Operator Details" icon={<User size={13} className="text-orange-500" />}>
                    <div className="flex flex-col gap-3">
                      <FormikSelect compact label="QC Operator" name="end_operator" options={qcUserOptions} />

                      {/* Summary when batch is loaded */}
                      {batchInfo && values.d2_batch_id && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 p-3 mt-2">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Receiving Summary</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-500">Chamber</span>
                              <span className="text-[10px] font-bold text-slate-700">{values.d2_chamber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-500">Batch</span>
                              <span className="text-[10px] font-bold text-slate-700 font-mono">{values.d2_batch_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-500">Bobbins</span>
                              <span className="text-[10px] font-bold text-emerald-700">{batchInfo.total_bobbins}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-slate-500">Duration</span>
                              <span className="text-[10px] font-bold text-purple-700">{values.process_hours || '—'} hrs</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ModuleCard>

                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default D2Recieving;
