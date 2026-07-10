import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FlaskConical, Gauge, User, Activity, Loader2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import {
  getD2ChambersInUse,
  getRunningBatch,
  getQCUsers,
  getAllShifts,
  submitD2GasEntry,
} from '../services/d2_gas_cone.api';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

const validationSchema = Yup.object().shape({
  d2_chamber: Yup.string().required('Chamber is required'),
  gas_concentration: Yup.number().typeError('Must be a number').required('Gas concentration is required'),
  fresh_gas: Yup.number().typeError('Must be a number').required('Fresh gas is required'),
  used_gas: Yup.number().typeError('Must be a number').required('Used gas is required'),
  n2_gas: Yup.number().typeError('Must be a number').required('N2 gas is required'),
  tank_pressure: Yup.number().typeError('Must be a number').required('Tank pressure is required'),
  cycle_time_min: Yup.number().typeError('Must be a number').required('Cycle time is required'),
  shift: Yup.string().required('Shift is required'),
  d2_gas_operator: Yup.string().required('Operator is required'),
});

const initialValues = {
  d2_chamber: '',
  d2_batch_id: '',
  total_bobbins: '',
  gas_concentration: '',
  fresh_gas: '',
  used_gas: '',
  n2_gas: '',
  tank_pressure: '',
  cycle_time_min: '',
  shift: '',
  d2_gas_operator: '',
  gas_issue_date: today(),
  gas_issue_time: nowTime(),
};

/* ══════════════════════════════════════════════════════════ */
const D2GasConeEntry = () => {
  const [chambers, setChambers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [qcUsers, setQcUsers] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Load master data ── */
  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes, uRes] = await Promise.all([
          getD2ChambersInUse(),
          getAllShifts(),
          getQCUsers(),
        ]);
        if (cRes?.success) setChambers(cRes.data || []);
        setShifts(sRes?.data || []);
        setQcUsers(uRes?.data || []);
      } catch (e) {
        console.error('Master data load error:', e);
      }
    })();
  }, []);

  const shiftOptions = shifts.map(s => ({ label: s.shift_name, value: s.shift_name }));
  const qcUserOptions = qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }));
  const chamberOptions = chambers.map(c => ({ label: `Chamber ${c.d2_chamber_no}`, value: String(c.d2_chamber_no) }));

  /* ── Fetch running batch on chamber select ── */
  const handleChamberChange = async (chamberNo, setFieldValue) => {
    setFieldValue('d2_chamber', chamberNo);
    setFieldValue('d2_batch_id', '');
    setFieldValue('total_bobbins', '');
    setBatchError('');

    if (!chamberNo) return;

    setBatchLoading(true);
    try {
      const res = await getRunningBatch(chamberNo);
      if (res?.success && res.data) {
        setFieldValue('d2_batch_id', res.data.d2_batch_id);
        setFieldValue('total_bobbins', res.data.total_bobbins);
        setBatchError('');
      } else {
        setBatchError(res?.message || 'No active D2 batch is currently running in the selected chamber.');
      }
    } catch (e) {
      setBatchError(e?.response?.data?.message || 'Failed to fetch running batch.');
    }
    setBatchLoading(false);
  };

  /* ── Submit ── */
  const handleSubmit = async (values, { resetForm }) => {
    if (!values.d2_batch_id) {
      showError('No running batch found. Cannot save.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        d2_batch_id: values.d2_batch_id,
        d2_chamber: Number(values.d2_chamber),
        gas_concentration: Number(values.gas_concentration),
        fresh_gas: Number(values.fresh_gas),
        used_gas: Number(values.used_gas),
        n2_gas: Number(values.n2_gas),
        tank_pressure: Number(values.tank_pressure),
        gas_issue_date: values.gas_issue_date,
        gas_issue_time: values.gas_issue_time,
        cycle_time_min: Number(values.cycle_time_min),
        shift: values.shift,
        d2_gas_operator: values.d2_gas_operator,
        total_bobbins: Number(values.total_bobbins),
      };

      const res = await submitD2GasEntry(payload);
      if (res?.success) {
        showSuccess('D2 Gas Entry saved successfully!');
        resetForm({ values: { ...initialValues, gas_issue_date: today(), gas_issue_time: nowTime() } });
        setBatchError('');
      } else {
        showError(res?.message || 'Save failed');
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
          {({ values, setFieldValue, resetForm, isValid }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Action bar ── */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FlaskConical size={16} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-slate-800 leading-none">D2 Gas Entry</h1>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Gas Monitoring for Active D2 Chambers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setBatchError(''); }}>Reset</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting || !values.d2_batch_id}>
                    {submitting ? 'Saving...' : 'Save'}
                  </SubmitButton>
                </div>
              </div>

              {/* ── Form Content ── */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="grid grid-cols-3 gap-3 h-full">

                  {/* ── Column 1: Chamber Info ── */}
                  <div className="flex flex-col gap-3">
                    <ModuleCard compact title="Chamber Information" icon={<Activity size={13} className="text-blue-600" />}>
                      <div className="flex flex-col gap-3">
                        <FormikSelect
                          compact
                          label="D2 Chamber"
                          name="d2_chamber"
                          options={chamberOptions}
                          onChange={(e) => handleChamberChange(e.target.value, setFieldValue)}
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

                        <FormikInput
                          compact
                          label="Total Bobbins"
                          name="total_bobbins"
                          readOnly
                          placeholder="Auto-calculated..."
                        />
                      </div>
                    </ModuleCard>

                    {/* ── Operator Details ── */}
                    <ModuleCard compact title="Operator Details" icon={<User size={13} className="text-orange-500" />}>
                      <div className="flex flex-col gap-3">
                        <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />
                        <FormikSelect compact label="QC Operator" name="d2_gas_operator" options={qcUserOptions} />
                        <div className="grid grid-cols-2 gap-2">
                          <FormikInput compact label="Gas Issue Date" name="gas_issue_date" type="date" readOnly />
                          <FormikInput compact label="Gas Issue Time" name="gas_issue_time" type="time" readOnly />
                        </div>
                      </div>
                    </ModuleCard>
                  </div>

                  {/* ── Column 2: Gas Details ── */}
                  <div className="col-span-2">
                    <ModuleCard compact title="Gas Details" icon={<Gauge size={13} className="text-emerald-600" />}>
                      <div className="flex flex-col gap-3">

                        <div className="grid grid-cols-2 gap-3">
                          <FormikInput compact label="Gas Concentration" name="gas_concentration" type="number" step="0.01" placeholder="0.00" />
                          <FormikInput compact label="Tank Pressure" name="tank_pressure" type="number" step="0.01" placeholder="0.00" />
                        </div>

                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gas Consumption</p>
                          <div className="grid grid-cols-3 gap-3">
                            <FormikInput compact label="Fresh Gas" name="fresh_gas" type="number" step="0.001" placeholder="0.000" />
                            <FormikInput compact label="Used Gas" name="used_gas" type="number" step="0.001" placeholder="0.000" />
                            <FormikInput compact label="N2 Gas" name="n2_gas" type="number" step="0.001" placeholder="0.000" />
                          </div>
                        </div>

                        <FormikInput compact label="Cycle Time (Minutes)" name="cycle_time_min" type="number" placeholder="0" />

                        {/* Summary Card */}
                        {values.d2_batch_id && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-3 mt-2">
                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-2">Entry Summary</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <p className="text-[9px] text-slate-500 font-medium">Chamber</p>
                                <p className="text-sm font-bold text-blue-700">{values.d2_chamber}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] text-slate-500 font-medium">Batch</p>
                                <p className="text-sm font-bold text-blue-700 font-mono">{values.d2_batch_id}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] text-slate-500 font-medium">Bobbins</p>
                                <p className="text-sm font-bold text-emerald-700">{values.total_bobbins}</p>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </ModuleCard>
                  </div>

                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default D2GasConeEntry;
