import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Scan, ClipboardCheck, AlertTriangle, Users, Database, Trash2, Plus, Zap, Lock } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getPTUsers } from '../../Admin_Folder/proof_testing/pt_users/service/pt_users.api';
import { useDispatch, useSelector } from 'react-redux';
import { getBobbinColors } from '../../Admin_Folder/proof_testing/bobbin_color/service/bobbin_color.api';
import { getBobbinTypes } from '../../Admin_Folder/proof_testing/bobbin_type/service/bobbin_type.api';
import { getSpoolDetailsForPT, ptEntryApi, getPTFlaws, getPTLogs, getFidBySpool } from '../services/pt_entry.api';
import { checkPTLength } from './pt_helper';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';

/* ── Password Modal ─────────────────────────────────────── */
const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pwd === '12345') {
      onSuccess();
      setPwd('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-72">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={14} className="text-amber-500" />
          <h3 className="text-xs font-bold text-slate-700 uppercase">Enter Password to Unlock</h3>
        </div>
        <input
          type="password" value={pwd} autoFocus
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20"
          placeholder="Password"
        />
        {error && <p className="text-[9px] text-rose-600 mt-1">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onClose} className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200">Cancel</button>
          <button type="button" onClick={submit} className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">Submit</button>
        </div>
      </div>
    </div>
  );
};

/* ── Reusable Row Layout (Keeps Checkbox UI) ────────── */
const RejRowLayout = ({ label, checked, onChange, children }) => (
  <div className="flex items-center gap-2 py-1 border-b border-slate-50 last:border-0">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 flex-shrink-0 cursor-pointer"
    />
    <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap w-28 flex-shrink-0">{label}</span>
    <div className="flex-1 min-w-0">{checked && children}</div>
  </div>
);

const genPTID = (last) => `PT-${String((parseInt(last.replace(/\D/g, '')) || 0) + 1).padStart(5, '0')}`;

const validationSchema = Yup.object({
  spool_id: Yup.string().required('Spool ID is required'),
  preform_id: Yup.string().required('Preform ID is required'),
  drawn_date: Yup.string().required('Drawn Date is required'),
  pt_entry: Yup.string().required('PT Entry Date is required'),
  operator_name: Yup.string().required('Operator is required'),
  shift_incharge: Yup.string().required('Shift Incharge is required'),
  pt_length: Yup.string().required('PT Length is required'),
});

const initialValues = {
  spool_id: '', preform_id: '', drawn_length: '', tower_no: '', drawn_date: '',
  pt_entry: new Date().toISOString().split('T')[0], fid: '', bobbin_no: '', spool_status: '',
  pt_machine_no: '', operator_name: '', shift_incharge: '', shift: '', bobbin_color: '', bobbin_type: '',
  pt_length: '', status: 'PENDING', payoff_vibration: 'No', dancer_vibration: 'No',
  active_rejection_type: '', // radio token architecture: 'rejection', 'bal_draw_rejection', etc.
  rejection_reason: '', bal_draw_rejection_reason: '', ztmd_id: '', doc_id: '',
  multiple_end_weight: '', drawn_remark: '', pt_logs: [], pt_flaws: []
};

/* ══════════════════════════════════════════════════════════ */
const PTEntry = () => {
  const [lastPTID, setLastPTID] = useState('PT-00000');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [ptUsers, setPTUsers] = useState([]);
  const [bobbinColors, setBobbinColors] = useState([]);
  const [bobbinTypes, setBobbinTypes] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [balanceLength, setBalanceLength] = useState(0);
  const [activeFlaw, setActiveFlaw] = useState(null);
  const [lastFidInfo, setLastFidInfo] = useState({ last_fid: '', p_count: 0 });
  const [ptAlert, setPtAlert] = useState({
    message: "",
    nextFlawMessage: ""
  });

  const formikRef = useRef(null);
  const dispatch = useDispatch();
  const { ptFlawsData } = useSelector((state) => state.ptFlaws);
  const { ptLogsData, ptLLoading, ptLError } = useSelector((state) => state.ptLogs);
  console.log("What is the ptlogdata:", ptLogsData)
  const handleScan = async (spool_id, setFieldValue) => {
    if (!spool_id) return;
    try {
      const response = await getSpoolDetailsForPT(spool_id);

      const data = response.data;
      setFieldValue("preform_id", data.preform_id);
      setFieldValue("drawn_length", data.drawn_length);
      setFieldValue("tower_no", data.tower_no || '');
      setFieldValue("drawn_date", data.created_at?.split("T")[0]);
      setFieldValue("pt_entry", data.allocation_date?.split("T")[0] || new Date().toISOString().split('T')[0]);
      setFieldValue("pt_machine_no", data.pt_machine_no || '');
      setFieldValue("drawn_remark", data.remark);

      const calcPtDone = data.qty - data.balance_qty || 0;
      setFieldValue("pt_done_so_far", calcPtDone.toFixed(3));
      setBalanceLength(data.balance_qty);

      // Dispatch flaws AFTER balanceLength is set
      await dispatch(getPTFlaws(spool_id));
      await dispatch(getPTLogs(spool_id));

      setActiveFlaw(null);
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Spool not found");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, colorsRes, typesRes, shiftsRes] = await Promise.all([
          getPTUsers(), getBobbinColors(), getBobbinTypes(), getAllShifts()
        ]);
        setPTUsers(usersRes.data);
        setBobbinColors(colorsRes.data);
        setBobbinTypes(typesRes.data);
        setShifts(shiftsRes.data);
      } catch (error) {
        console.error("Error loading master configurations", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const formik = formikRef.current;
    if (!formik || !formik.values.spool_id) return; // Only run when spool is loaded
    if (!ptFlawsData || ptFlawsData.length === 0) return;

    const result = checkPTLength({
      ptDoneLength: formik.values.pt_done_so_far,
      standardLength: 50.400,
      balanceLength,
      ptFlaws: ptFlawsData
    });
    if (result?.hit) {
      showError(result.message);
    }

    setPtAlert({
      message: result.message || "",
      nextFlawMessage: result.nextFlawMessage || ""
    });
  }, [ptFlawsData, balanceLength]);

  console.log("alert:,", ptAlert.message, ptAlert.nextFlawMessage)

  useEffect(() => {
    if (
      formikRef.current &&
      Array.isArray(ptLogsData)
    ) {
      formikRef.current.setFieldValue("pt_logs", ptLogsData);
      formikRef.current.setFieldValue("pt_flaws", ptFlawsData)
    }
  }, [ptLogsData]);

  const ptUsersOptions = ptUsers.map(user => ({ label: user.pt_user_name, value: user.pt_user_id }));
  const bobbinColorsOption = Array.isArray(bobbinColors) ? bobbinColors.map(c => ({ label: c.bobbin_color_name, value: c.bobbin_color_name })) : [];
  const bobbinTypesOption = Array.isArray(bobbinTypes) ? bobbinTypes.map(t => ({ label: t.bobbin_type_name, value: t.bobbin_type_name })) : [];
  const shiftOptions = Array.isArray(shifts) ? shifts.map(s => ({ label: s.shift_name, value: s.shift_name })) : [];

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          innerRef={formikRef}
          onSubmit={async (values, { setFieldValue }) => {
            console.log("payload:", values)

            // Validation: if rejection is checked, reason must be selected
            if (values.active_rejection_type === 'rejection' && (!values.rejection_reason || values.rejection_reason === 'Select')) {
              showError("Please select a Rejection Reason");
              return;
            }

            try {
              const response = await dispatch(ptEntryApi(values));

              if (response.payload?.success) {
                showSuccess(response.payload.message || "PT Entry saved successfully");

                // Reset fields if needed
                setFieldValue("pt_length", "");
                setFieldValue("active_rejection_type", "");
                setFieldValue("pt_length", "");
                setFieldValue("fid", "");
                setFieldValue("bobbin_no", "");

                const spoolResponse = await getSpoolDetailsForPT(values.spool_id);

  // Refresh spool details (same as Scan button)
  await handleScan(values.spool_id, setFieldValue);
                setBalanceLength(spoolResponse.data.balance_qty);
              } else {
                showError(response.payload?.message || "Failed to save PT Entry");
              }
            } catch (error) {
              console.error(error);
              showError("Something went wrong");
            }



          }}
        >
          {({ values, setFieldValue, resetForm }) => {
            const me = (parseFloat(values.multiple_end_weight) || 0) * 37;
            const flaws = Array.isArray(ptFlawsData) ? ptFlawsData : [];

            // True Centralized Radio Controller (Resets alternate fields cleanly)
            const handleRadioSelection = (typeKey, isChecked) => {
              if (!isChecked) {
                // ── CLEAR VALUES ON UNCHECK ──
                setFieldValue('active_rejection_type', '');
                setFieldValue('pt_length', ''); // Now sets pt_length to empty string
                setActiveFlaw(null);            // Unlocks the readOnly constraint
              } else {
                setFieldValue('active_rejection_type', typeKey);
                setFieldValue('fid', ''); // Clear FID when any rejection is checked

                // ── CASE 1: Rejection Checked (Flaw Delta Calculation) ──
                if (typeKey === 'rejection') {
                  const firstActiveFlaw = flaws.find(f => !f.is_complete);

                  if (firstActiveFlaw) {
                    const pos1 = parseFloat(firstActiveFlaw.pos1) || 0;
                    const pos2 = parseFloat(firstActiveFlaw.pos2) || 0;
                    const flawCutOffLength = pos2 - pos1;

                    if (flawCutOffLength > 0) {
                      setFieldValue('pt_length', flawCutOffLength.toFixed(3));
                      setActiveFlaw(firstActiveFlaw); // Ties to state tracking
                    }
                  }
                }

              }

              // Reset sub-input data rules cleanly
              setFieldValue('rejection_reason', '');
              setFieldValue('bal_draw_rejection_reason', '');
              setFieldValue('multiple_end_weight', '');
              setFieldValue('ztmd_id', '');
              setFieldValue('doc_id', '');
            };

            return (
              <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    PT Entry {activeFlaw && <span className="text-rose-600 animate-pulse font-mono ml-2">(FLAW INTERCEPTED)</span>}
                  </span>
                  <div className="flex gap-1.5">
                    <ResetButton compact type="button" onClick={() => { resetForm(); setActiveFlaw(null); }}>Reset</ResetButton>
                    <SubmitButton compact type="submit">Submit</SubmitButton>
                    <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_1fr_1.1fr_1.2fr] gap-2 flex-1 min-h-0">
                  {/* COL 1: Spool Info */}
                  <ModuleCard compact title="Spool Info" icon={<Database size={12} className="text-blue-600" />}>
                    <div className="flex flex-col gap-1.5 overflow-y-auto h-full">
                      <div className="flex items-end gap-1.5">
                        <div className="flex-1">
                          <FormikInput compact label="Drawn Spool ID" name="spool_id" placeholder="Scan..." />
                        </div>
                        <button type="button" onClick={() => handleScan(values.spool_id, setFieldValue)}
                          className="flex items-center gap-0.5 px-2 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase hover:bg-indigo-700 h-[28px]">
                          <Scan size={9} /> Scan
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                        <FormikInput compact label="Drawn Length (km)" name="drawn_length" readOnly />
                        <FormikInput compact label="DT No" name="tower_no" readOnly />
                        <FormikInput compact label="Drawn Date" name="drawn_date" type="date" />
                        <FormikInput compact label="PT Entry Date" name="pt_entry" type="date" />
                        <FormikInput compact label="PT Bobbin No" name="bobbin_no" placeholder="Scan bobbin..." />
                        <FormikInput compact label="Spool Status" name="spool_status" placeholder="Spool Status" />
                      </div>
                      <FormikTextarea compact label="Drawn Remark" name="drawn_remark" rows={2} placeholder="Auto-fetched..." readOnly />

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">FID</label>
                        <div className="flex gap-1">
                          <input
                            readOnly
                            value={values.fid}
                            placeholder="Click Generate..."
                            className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 outline-none"
                          />
                          <button
                            type="button"
                            disabled={!!values.active_rejection_type}
                            onClick={async () => {
                              if (!values.spool_id) {
                                showError("Please scan a spool first");
                                return;
                              }
                              try {
                                const res = await getFidBySpool(values.spool_id);
                                const lastFid = res?.data?.last_fid || '';
                                const pCount = Number(res?.data?.p_count) || 0;
                                if (!lastFid) {
                                  showError("No FID data found for this spool");
                                  return;
                                }
                                let generatedFid = '';
                                if (pCount === 0) {
                                  // First time — append A
                                  generatedFid = `${lastFid}A`;
                                } else {
                                  // Replace the last character with next letter
                                  const suffix = String.fromCharCode(65 + pCount); // 1=B, 2=C, 3=D...
                                  generatedFid = `${lastFid.slice(0, -1)}${suffix}`;
                                }
                                setFieldValue('fid', generatedFid);
                              } catch (error) {
                                console.error("Gen FID error:", error);
                                showError(error?.response?.data?.message || "Failed to generate FID");
                              }
                            }}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase whitespace-nowrap transition-all ${
                              !!values.active_rejection_type
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                            }`}
                          >
                            <Zap size={9} className="inline mr-0.5" />Gen FID
                          </button>
                        </div>
                      </div>
                    </div>
                  </ModuleCard>

                  {/* COL 2: Personnel & Metrics */}
                  <ModuleCard compact title="Personnel & Metrics" icon={<Users size={12} className="text-emerald-600" />}>
                    <div className="flex flex-col gap-1.5 overflow-y-auto h-full">
                      <div className="grid grid-cols-2 gap-1.5">
                        <FormikInput compact label="PT Machine No" name="pt_machine_no" readOnly />
                        <FormikSelect compact label="Operator Name" name="operator_name" options={ptUsersOptions} />
                        <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={ptUsersOptions} />
                        <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />
                        <FormikSelect compact label="Bobbin Color" name="bobbin_color" options={bobbinColorsOption} />
                        <FormikSelect compact label="Bobbin Type" name="bobbin_type" options={bobbinTypesOption} />
                        <FormikInput compact label="PT Length (km)" name="pt_length" type="number" step="0.001" placeholder="0.000" />
                        <FormikSelect compact label="Payoff Vibration" name="payoff_vibration" options={['Yes', 'No']} />
                        <FormikSelect compact label="Dancer Vibration" name="dancer_vibration" options={['Yes', 'No']} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 bg-slate-50/50 p-1.5 rounded">
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Std Length</label>
                          <div className="text-[11px] font-mono font-bold text-slate-600">50.400 km</div>
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase">PT Done So Far</label>
                          <div className="text-[11px] font-mono font-bold text-blue-600">{values.pt_done_so_far} km</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Balance (km)</label>
                        <div className="w-full bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-xs font-bold text-indigo-700 font-mono">{balanceLength}</div>
                      </div>
                      {(ptAlert.message || ptAlert.nextFlawMessage) && (
                        <div className="mx-3 mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
                          {ptAlert.message && (
                            <div className="text-sm font-semibold text-red-700">
                              ⚠ {ptAlert.message}
                            </div>
                          )}

                          {ptAlert.nextFlawMessage && (
                            <div className="mt-2 text-sm font-semibold text-blue-700">
                              ➜ {ptAlert.nextFlawMessage}
                            </div>
                          )}
                        </div>
                      )}
                    </div>


                  </ModuleCard>

                  {/* COL 3: Rejections & PT Log */}
                  <div className="flex flex-col gap-2 min-h-0">
                    <ModuleCard compact title="Rejections" icon={<AlertTriangle size={12} className="text-rose-500" />}>
                      <div className="flex flex-col overflow-y-auto h-full">

                        <RejRowLayout label="Rejection" checked={values.active_rejection_type === 'rejection'} onChange={e => handleRadioSelection('rejection', e.target.checked)}>
                          <FormikSelect compact name="rejection_reason" options={['Select', 'B-BFD', 'L-Lumps', 'C-SCD', 'S-Bot End', 'M-Multiple End', 'D-Scratch']} />
                        </RejRowLayout>

                        <div className="flex items-center gap-2 py-1 border-b border-slate-50">
                          <input
                            type="checkbox"
                            checked={values.active_rejection_type === 'bal_draw_rejection'}
                            onChange={e => {
                              if (!e.target.checked) {
                                handleRadioSelection('bal_draw_rejection', false);
                              } else {
                                setShowPwdModal(true);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 flex-shrink-0 cursor-pointer"
                          />
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap w-28 flex-shrink-0">Bal. Draw Rej.</span>
                          <div className="flex-1 min-w-0 flex items-center gap-1">
                            {values.active_rejection_type !== 'bal_draw_rejection' ? (
                              <button type="button" onClick={() => setShowPwdModal(true)}
                                className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded hover:bg-amber-200 whitespace-nowrap">
                                <Lock size={8} className="inline mr-0.5" />Unlock
                              </button>
                            ) : (
                              <FormikInput compact name="bal_draw_rejection_reason" placeholder="Remark..." />
                            )}
                          </div>
                        </div>

                        <RejRowLayout label="Multiple End" checked={values.active_rejection_type === 'multiple_end'} onChange={e => handleRadioSelection('multiple_end', e.target.checked)}>
                          <div className="flex items-center gap-1">
                            <FormikInput
                              compact
                              name="multiple_end_weight"
                              type="number"
                              step="0.001"
                              placeholder="kg"
                              onChange={(e) => {
                                const val = e.target.value;
                                setFieldValue('multiple_end_weight', val); // Updates weight in Formik state

                                // Compute and send length directly to pt_length field in real-time
                                const weightNum = parseFloat(val) || 0;
                                const computedLength = weightNum * 37;
                                setFieldValue('pt_length', computedLength > 0 ? computedLength.toFixed(3) : '');
                              }}
                            />
                            <div className="bg-emerald-50 border border-emerald-200 rounded px-1.5 py-1 text-[9px] font-bold text-emerald-700 font-mono whitespace-nowrap">={me.toFixed(2)} km</div>
                          </div>
                        </RejRowLayout>

                        <RejRowLayout label="Scratch" checked={values.active_rejection_type === 'scratch'} onChange={e => handleRadioSelection('scratch', e.target.checked)} />

                        <RejRowLayout label="PT Scrap" checked={values.active_rejection_type === 'pt_scrap'} onChange={e => handleRadioSelection('pt_scrap', e.target.checked)} />

                        <RejRowLayout label="ZTMD" checked={values.active_rejection_type === 'ztmd'} onChange={(e) => {
                          const isChecked = e.target.checked;

                          if (isChecked) {
                            setFieldValue('active_rejection_type', 'ztmd');
                            setFieldValue('pt_length', '0.200'); // Sets 200m instantly on click
                            setActiveFlaw(null);                 // Unlocks the input box restriction
                          } else {
                            setFieldValue('active_rejection_type', '');
                            setFieldValue('pt_length', '');      // Clears it out when unchecked
                          }

                          // Clean up other unrelated row inputs
                          setFieldValue('rejection_reason', '');
                          setFieldValue('bal_draw_rejection_reason', '');
                          setFieldValue('multiple_end_weight', '');
                          setFieldValue('doc_id', '');
                        }}>
                          <FormikInput compact name="ztmd_id" placeholder="Enter ZTMD ID..." />
                        </RejRowLayout>

                        <RejRowLayout label="DOC" checked={values.active_rejection_type === 'doc'} onChange={(e) => {
                          const isChecked = e.target.checked;

                          if (isChecked) {
                            setFieldValue('active_rejection_type', 'doc');
                            setFieldValue('pt_length', '0.200'); // Sets 200m instantly on click
                            setActiveFlaw(null);                 // Unlocks the input box restriction
                          } else {
                            setFieldValue('active_rejection_type', '');
                            setFieldValue('pt_length', '');      // Clears it out when unchecked
                          }

                          // Clean up other unrelated row inputs
                          setFieldValue('rejection_reason', '');
                          setFieldValue('bal_draw_rejection_reason', '');
                          setFieldValue('multiple_end_weight', '');
                          setFieldValue('ztmd_id', '');
                        }}>
                          <FormikInput compact name="doc_id" placeholder="Enter DOC ID..." />
                        </RejRowLayout>

                        <RejRowLayout label="Is Break" checked={values.active_rejection_type === 'is_break'} onChange={e => handleRadioSelection('is_break', e.target.checked)} />

                      </div>
                    </ModuleCard>

                    {/* Process Log Table */}
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={12} className="text-purple-600" />
                          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">PT Process Log</span>
                        </div>
                        <FieldArray name="pt_logs">
                          {({ push }) => (
                            <button type="button" onClick={() => push({ identifier: '', length: '', reason: 'OK' })}
                              className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all">
                              <Plus size={10} />
                            </button>
                          )}
                        </FieldArray>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        <FieldArray name="pt_logs">
                          {({ remove, form }) => (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Barcode / ID / Flaw', 'Length', 'Reason', ''].map(h => (
                                    <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.values.pt_logs?.map((_, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-1 py-1"><Field name={`pt_logs.${idx}.spool_id`} className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded" /></td>
                                    <td className="px-1 py-1"><Field name={`pt_logs.${idx}.pt_length`} className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded" /></td>
                                    <td className="px-1 py-1"><Field name={`pt_logs.${idx}.fid`} className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded" /></td>

                                    <td className="px-1 py-1 text-center">
                                      <button type="button" onClick={() => remove(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={11} /></button>
                                    </td>
                                  </tr>
                                ))}
                                {form.values.pt_logs?.length === 0 && (
                                  <tr><td colSpan="4" className="px-3 py-4 text-center text-[9px] text-slate-400">No entries — click + to add</td></tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  </div>

                  {/* COL 4: Draw Flaw Table */}


                  <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={12} className="text-indigo-600" />
                          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">
                            Draw Flaw Log
                          </span>
                        </div>
                      </div>

                      <FieldArray name="pt_flaws">
                        {() => (
                          <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                    PT Flaw
                                  </th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                    Pos 1
                                  </th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                    Pos 2
                                  </th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                    Defect Length
                                  </th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                    Actual Cutting
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-slate-100">
                                {!Array.isArray(values?.pt_flaws) || values.pt_flaws.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-3 py-4 text-center text-[9px] text-slate-400"
                                    >
                                      No entries found
                                    </td>
                                  </tr>
                                ) : (
                                  values.pt_flaws.map((flaw, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50">
                                      <td className="px-2 py-1 text-xs font-bold text-slate-700">
                                        {flaw.reason}
                                      </td>

                                      <td className="px-2 py-1 text-xs font-mono">
                                        {flaw.pos1}
                                      </td>

                                      <td className="px-2 py-1 text-xs font-mono">
                                        {flaw.pos2}
                                      </td>

                                      <td className="px-2 py-1 text-xs font-mono">
                                        {flaw.defect_length}
                                      </td>

                                      <td className="px-2 py-1 text-xs font-mono">
                                        {flaw.actual_cutting}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </div>

                </div>
              </Form>
            );
          }}
        </Formik>

        <PasswordModal
          isOpen={showPwdModal}
          onClose={() => setShowPwdModal(false)}
          onSuccess={() => {
            if (formikRef.current) {
              formikRef.current.setFieldValue('rejection_reason', '');
              formikRef.current.setFieldValue('multiple_end_weight', '');
              formikRef.current.setFieldValue('ztmd_id', '');
              formikRef.current.setFieldValue('doc_id', '');

              formikRef.current.setFieldValue('active_rejection_type', 'bal_draw_rejection');
            }
          }}
        />
      </div>
    </div>
  );
};

export default PTEntry;