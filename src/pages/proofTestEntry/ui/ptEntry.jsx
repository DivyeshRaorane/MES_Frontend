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
import { checkPTLength, computeFlawStatuses, findBookableFlaw, validateFlawBooking, getMissedFlaws } from './pt_helper';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import { clearPtFlaws } from '../controller/get_pt_flaws.slice.jsx';
import { clearPtLogs } from '../controller/get_pt_logs.slice.jsx';
import axios from 'axios';

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

const GOOD_LENGTH = 2.1; // km — configurable good length threshold

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
  pt_length: '', pt_break: false, pt_scrap: false, status: 'PENDING', payoff_vibration: 'No', dancer_vibration: 'No',
  active_rejection_type: '', // radio token architecture: 'rejection', 'bal_draw_rejection', etc.
  rejection_reason: '', bal_draw_rejection_reason: '', ztmd_id: '', doc_id: '',product_type: "", pt_strain: "",pt_break_count: "",
  multiple_end_weight: '', drawn_remark: '', pt_logs: [], pt_flaws: []
};

/* ══════════════════════════════════════════════════════════ */
const PTEntry = () => {
  const [lastPTID, setLastPTID] = useState('PT-00000');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showSpoolEndPopup, setShowSpoolEndPopup] = useState(false);
  const [showFlawConfirm, setShowFlawConfirm] = useState(false);
  const [showBreakScrapAlert, setShowBreakScrapAlert] = useState(false);
  const [pendingPtSubmit, setPendingPtSubmit] = useState(null);
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
  console.log("What is the ptAlert:", ptAlert)

  /* ── Reusable FID generation logic ── */
  const genFid = async (spool_id, setFieldValue) => {
    if (!spool_id) return;
    try {
      const res = await getFidBySpool(spool_id);
      const lastFid = res?.data?.last_fid || '';
      const pCount = Number(res?.data?.p_count) || 0;
      if (!lastFid) {
        showError("No FID data found for this spool");
        return;
      }
      let generatedFid = '';
      if (pCount === 0) {
        generatedFid = `${lastFid}A`;
      } else {
        const suffix = String.fromCharCode(65 + pCount);
        generatedFid = `${lastFid.slice(0, -1)}${suffix}`;
      }
      setFieldValue('fid', generatedFid);
    } catch (error) {
      console.error("Gen FID error:", error);
      showError(error?.response?.data?.message || "Failed to generate FID");
    }
  };

  /* ── Bobbin No onBlur: fetch PT machine log data ── */
  const handleBobbinBlur = async (bobbin_no, setFieldValue) => {
    if (!bobbin_no) return;
    console.log('Fetching PT machine log for:', bobbin_no);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ptmachinelog/${bobbin_no}`);
      console.log('PT machine log response:', res.data);
      const data = res.data;
      if (data?.success && data.data) {
        const log = data.data;
        const realLength = parseFloat(log.real_length) || 0;
        const setLength = parseFloat(log.set_length) || 0;
        const realLengthKm = (realLength / 1000).toFixed(3);
        console.log('Setting pt_length to:', realLengthKm, 'km');

        // Set pt_length as real_length converted to km
        setFieldValue('pt_length', String(realLengthKm));

        let isRejection = false;

        if(parseFloat(realLengthKm) < GOOD_LENGTH) {
          setFieldValue("pt_scrap", true);
          isRejection = true;
        }

        const stopReason = log?.machine_stop_reason_t;

        if (
          stopReason === "STOP -> Fiber Break at TU Fiber Sensor" ||
          stopReason === "STOP -> Fiber Break at TakeUp" ||
          stopReason === "STOP -> Fiberbreak at Sensor" ||
          stopReason === "STOP -> Fiber Break at PayOff"
        ) {
          setFieldValue("pt_break", true);
          // pt_break is informational only — does NOT count as a rejection
        }

        // Auto-generate FID if no rejection condition detected
        const formik = formikRef.current;
        const currentRejType = formik?.values?.active_rejection_type || '';
        if (!isRejection && !currentRejType && formik?.values?.spool_id) {
          await genFid(formik.values.spool_id, setFieldValue);
        }
      } else {
        console.log('No machine log data found in response');
        // Even if no machine log, attempt auto FID if spool loaded and no rejection
        const formik = formikRef.current;
        const currentRejType = formik?.values?.active_rejection_type || '';
        if (!currentRejType && formik?.values?.spool_id) {
          await genFid(formik.values.spool_id, setFieldValue);
        }
      }
    } catch (e) {
      console.log('PT machine log error:', e?.response?.status, e?.message);
      // Even on error, attempt auto FID if spool loaded and no rejection
      const formik = formikRef.current;
      const currentRejType = formik?.values?.active_rejection_type || '';
      if (!currentRejType && formik?.values?.spool_id) {
        await genFid(formik.values.spool_id, setFieldValue);
      }
    }
  };

  const handleScan = async (spool_id, setFieldValue) => {
    if (!spool_id) return;
    try {
      const response = await getSpoolDetailsForPT(spool_id);
console.log("Pt data:,", response)
      const data = response.data;
      setFieldValue("preform_id", data.preform_id);
      setFieldValue("drawn_length", data.drawn_length);
      setFieldValue("tower_no", data.tower_no || '');
      setFieldValue("drawn_date", data.created_at?.split("T")[0]);
      setFieldValue("pt_entry", data.allocation_date?.split("T")[0] || new Date().toISOString().split('T')[0]);
      setFieldValue("pt_machine_no", data.pt_machine_no || '');
      setFieldValue("drawn_remark", data.remark);
      setFieldValue(
  "product_type",
  `${data.product_type?.trim()}-${data.process_type?.trim()}`
);
      setFieldValue("pt_strain", data.pt_strain)
      setFieldValue("pt_break_count", data?.pt_break_count)
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
      // Clear all auto-filled fields on error
      setFieldValue("preform_id", '');
      setFieldValue("drawn_length", '');
      setFieldValue("tower_no", '');
      setFieldValue("drawn_date", '');
      setFieldValue("pt_machine_no", '');
      setFieldValue("drawn_remark", '');
      setFieldValue("pt_done_so_far", '');
      setFieldValue("pt_length", '');
      setFieldValue("fid", '');
      setFieldValue("bobbin_no", '');
      setFieldValue("spool_status", '');
      setFieldValue("pt_logs", []);
      setFieldValue("pt_flaws", []);
      setBalanceLength(0);
      setActiveFlaw(null);
      setPtAlert({ message: '', nextFlawMessage: '' });
    }
  };

  // Clear stale Redux state on mount & unmount
  useEffect(() => {
    dispatch(clearPtFlaws());
    dispatch(clearPtLogs());
    return () => {
      dispatch(clearPtFlaws());
      dispatch(clearPtLogs());
    };
  }, []);

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

    console.log("result:", result)
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

  /* ── Actual PT submit logic (extracted for reuse with confirmation) ── */
  const doPtSubmit = async (values, setFieldValue) => {
    // Validate: PT length should not exceed balance
    const ptLen = parseFloat(values.pt_length) || 0;
    const remaining = balanceLength - ptLen;
    if (remaining < 0) {
      showError(`PT Length (${ptLen} km) exceeds available balance (${balanceLength} km). Entry not allowed.`);
      return;
    }

    // Compute missed flaws based on new PT progress
    const currentPtDone = parseFloat(values.pt_done_so_far) || 0;
    const newPtDone = currentPtDone + ptLen;
    const flawsList = Array.isArray(ptFlawsData) ? ptFlawsData : [];
    const missedFlaws = getMissedFlaws(flawsList, newPtDone);

    // Build pt_flaw_remark — only when:
    // 1. There are missed flaws that fall WITHIN this specific PT entry range
    // 2. FID is generated (good entry, not a rejection)
    let ptFlawRemark = '';
    let aFlawCut = '';
    if (missedFlaws.length > 0 && !values.active_rejection_type && values.fid) {
      // Only include flaws whose position falls within this entry's range (currentPtDone to newPtDone)
      const flawsInThisEntry = missedFlaws.filter(f => {
        const pos1 = parseFloat(f.pos1) || 0;
        return pos1 >= currentPtDone && pos1 <= newPtDone;
      });

      if (flawsInThisEntry.length > 0) {
        ptFlawRemark = flawsInThisEntry
          .map(f => {
            const relPos1 = (parseFloat(f.pos1) - currentPtDone).toFixed(3);
            const relPos2 = (parseFloat(f.pos2) - currentPtDone).toFixed(3);
            return `Cut from  ${relPos1} km to ${relPos2} ("Flaw Missed")`;
          })
          .join('; ');

        // Reverse remark: measured from end of PT length (takeup side)
        aFlawCut = flawsInThisEntry
          .map(f => {
            const relPos1 = (parseFloat(f.pos1) - currentPtDone).toFixed(3);
            const relPos2 = (parseFloat(f.pos2) - currentPtDone).toFixed(3);
            const revPos1 = (ptLen - parseFloat(relPos2)).toFixed(3);
            const revPos2 = (ptLen - parseFloat(relPos1)).toFixed(3);
            return `Flaw missed from ${revPos1} km to ${revPos2} km`;
          })
          .join('; ');
      }
    }

    // Build payload with missed flaw info + booked flaw (only for "rejection" type)
    const ptLogsCount = Array.isArray(formikRef.current?.values?.pt_logs) ? formikRef.current.values.pt_logs.length : 0;

    // Full Check Logic: ok_length threshold
    const OK_LENGTH = 50.4;
    const SAMPLE_CYCLE_KM = 200;
    let fullCheck = true;
    const ptLogs = Array.isArray(formikRef.current?.values?.pt_logs) ? formikRef.current.values.pt_logs : [];
    // Check if any previous good bobbin (with FID) already met ok_length
    let foundOkLengthInPrevious = false;
    for (const log of ptLogs) {
      const logHasFid = log.fid && log.fid.trim() !== '';
      const logLen = parseFloat(log.pt_length) || 0;
      if (logHasFid && logLen >= OK_LENGTH) {
        foundOkLengthInPrevious = true;
        break;
      }
    }
    if (foundOkLengthInPrevious) {
      // A previous bobbin already met ok_length, so this one is false
      fullCheck = false;
    } else {
      // No previous bobbin met ok_length yet, so this one is true
      fullCheck = true;
    }

    // ── Sample & Full MBend Logic ──
    // Determine is_sample and full_mbend for the current entry
    let isSample = false;
    let fullMbend = false;
    const currentHasFid = !!values.fid && values.fid.trim() !== '';
    const currentIsOk = currentHasFid && !values.active_rejection_type;

    if (currentIsOk) {
      // Only OK bobbins with valid FID participate in this logic
      // Rebuild state by scanning all previous OK bobbins (with FID)
      const prevOkBobbins = ptLogs.filter(log => {
        const hasFid = log.fid && log.fid.trim() !== '';
        const isOk = !log.active_rejection_type;
        return hasFid && isOk;
      });

      // Find if first sample has been identified yet (first OK bobbin with length >= OK_LENGTH)
      let firstSampleFound = false;
      let lastSampleIndex = -1;

      for (let i = 0; i < prevOkBobbins.length; i++) {
        const logLen = parseFloat(prevOkBobbins[i].pt_length) || 0;
        if (logLen >= OK_LENGTH) {
          firstSampleFound = true;
          lastSampleIndex = i;
          break;
        }
      }

      if (!firstSampleFound) {
        // No previous bobbin reached OK_LENGTH yet
        // Current bobbin gets full_mbend = true
        fullMbend = true;
        // Check if THIS bobbin is the first to reach OK_LENGTH
        if (ptLen >= OK_LENGTH) {
          isSample = true;
        }
      } else {
        // First sample was already found in previous logs
        // Now find ALL sample positions by replaying the cycle logic
        let sampleIndices = [];
        // Pass 1: find first sample
        let firstSampleIdx = -1;
        for (let i = 0; i < prevOkBobbins.length; i++) {
          const logLen = parseFloat(prevOkBobbins[i].pt_length) || 0;
          if (logLen >= OK_LENGTH) {
            firstSampleIdx = i;
            sampleIndices.push(i);
            break;
          }
        }

        // Pass 2: find subsequent samples using 200km cycle
        if (firstSampleIdx >= 0) {
          let cumulativeLength = 0;
          let reached200 = false;
          for (let i = firstSampleIdx + 1; i < prevOkBobbins.length; i++) {
            const logLen = parseFloat(prevOkBobbins[i].pt_length) || 0;
            cumulativeLength += logLen;
            if (cumulativeLength >= SAMPLE_CYCLE_KM) {
              reached200 = true;
            }
            if (reached200 && logLen >= OK_LENGTH) {
              sampleIndices.push(i);
              cumulativeLength = 0;
              reached200 = false;
            }
          }
        }

        // Determine state for current bobbin
        // Find the last sample index in previous logs
        const lastSamplePos = sampleIndices.length > 0 ? sampleIndices[sampleIndices.length - 1] : firstSampleIdx;

        // Calculate cumulative OK length since last sample (not including last sample itself)
        let cumulativeSinceLastSample = 0;
        let reached200ForCurrent = false;
        for (let i = lastSamplePos + 1; i < prevOkBobbins.length; i++) {
          const logLen = parseFloat(prevOkBobbins[i].pt_length) || 0;
          cumulativeSinceLastSample += logLen;
        }

        if (cumulativeSinceLastSample >= SAMPLE_CYCLE_KM) {
          reached200ForCurrent = true;
        }

        if (reached200ForCurrent) {
          // We've passed 200km since last sample, looking for next sample
          fullMbend = true;
          if (ptLen >= OK_LENGTH) {
            isSample = true;
          }
        } else {
          // Still accumulating towards 200km — check if adding current pushes over
          const newCumulative = cumulativeSinceLastSample + ptLen;
          if (newCumulative >= SAMPLE_CYCLE_KM) {
            // Current bobbin pushes cumulative past 200km
            // But it only becomes sample if its own length >= OK_LENGTH
            // For now it gets full_mbend = true (in the "scanning for sample" phase)
            fullMbend = true;
            if (ptLen >= OK_LENGTH) {
              isSample = true;
            }
          } else {
            // Still under 200km, normal OK bobbin
            fullMbend = false;
          }
        }
      }
    }
    // Non-OK bobbins (rejections, no FID) get is_sample=false, full_mbend=false by default

    const payload = {
      ...values,
      // Sequential entry number for this spool
      no: ptLogsCount + 1,
      // Full check flag
      full_check: fullCheck,
      // Sample and Full MBend flags
      is_sample: isSample,
      full_mbend: fullMbend,
      // Do not send bobbin_no when it's a rejection entry
      bobbin_no: values.active_rejection_type ? '' : values.bobbin_no,
      pt_flaw_remark: ptFlawRemark || null,
      a_cut_flaw: aFlawCut || null,
      missed_flaws: missedFlaws.map(f => ({
        pt_flaw_id: f.pt_flaw_id,
        pos1: f.pos1,
        pos2: f.pos2,
        reason: f.reason,
      })),
      booked_flaw: (values.active_rejection_type === 'rejection' && activeFlaw)
        ? { pt_flaw_id: activeFlaw.pt_flaw_id, pos1: activeFlaw.pos1, pos2: activeFlaw.pos2, reason: activeFlaw.reason }
        : null
    };

    try {
      const response = await dispatch(ptEntryApi(payload));

      if (response.payload?.success) {
        showSuccess(response.payload.message || "PT Entry saved successfully");

        // Show break scrap alert if pt_break was true
        if (values.pt_break) {
          setShowBreakScrapAlert(true);
        }

        setFieldValue("pt_length", "");
        setFieldValue("active_rejection_type", "");
        setFieldValue("fid", "");
        setFieldValue("bobbin_no", "");

        const spoolResponse = await getSpoolDetailsForPT(values.spool_id);
        await handleScan(values.spool_id, setFieldValue);
        setBalanceLength(spoolResponse.data.balance_qty);

        if (Number(spoolResponse.data.balance_qty) <= 0) {
          setShowSpoolEndPopup(true);
        }
      } else {
        showError(response.payload?.message || "Failed to save PT Entry");
      }
    } catch (error) {
      console.error(error);
      showError("Something went wrong");
    }
  };

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

            // Validation: bobbin_no must be exactly 10 characters if provided (only for non-rejection entries)
            if (!values.active_rejection_type && values.bobbin_no && values.bobbin_no.length !== 10) {
              showError("PT Bobbin No must be exactly 10 characters.");
              return;
            }

            // Validation: if rejection is checked, reason must be selected
            if (values.active_rejection_type === 'rejection' && (!values.rejection_reason || values.rejection_reason === 'Select')) {
              showError("Please select a Rejection Reason");
              return;
            }

            // FID validation: if no rejection type selected, FID is mandatory
            if (!values.active_rejection_type && !values.fid) {
              showError("FID not generated. Cannot submit without FID. Please scan the PT Barcode.");
              return;
            }

            // Check if PT length range overlaps with a pending flaw and no rejection selected
            if (!values.active_rejection_type && ptFlawsData?.length > 0) {
              const ptDone = parseFloat(values.pt_done_so_far) || 0;
              const ptLen = parseFloat(values.pt_length) || 0;
              const entryStart = ptDone;
              const entryEnd = ptDone + ptLen;

              // Only consider PENDING flaws (skip BOOKED and MISSED)
              const flawsWithStatus = computeFlawStatuses(ptFlawsData, ptDone);
              const pendingFlaws = flawsWithStatus.filter(f => f.status === 'PENDING');
              const overlapping = pendingFlaws.filter(flaw => {
                const p1 = parseFloat(flaw.pos1) || 0;
                const p2 = parseFloat(flaw.pos2) || 0;
                return entryStart < p2 && entryEnd > p1;
              });

              if (overlapping.length > 0) {
                // PT length overlaps with a flaw but no rejection selected — show confirmation
                setPendingPtSubmit({ values, setFieldValue });
                setShowFlawConfirm(true);
                return;
              }
            }

            await doPtSubmit(values, setFieldValue);
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

                // ── CASE 1: Only "Rejection" (B-BFD, L-Lumps, etc.) uses flaw booking logic ──
                // Other types (multiple_end, scratch, pt_scrap, ztmd, doc, bal_draw_rejection) do NOT book flaws
                if (typeKey === 'rejection') {
                  const ptDone = parseFloat(values.pt_done_so_far) || 0;
                  const validation = validateFlawBooking(flaws, ptDone);

                  if (!validation.allowed) {
                    showError(validation.message);
                    // Revert — don't allow rejection selection
                    setFieldValue('active_rejection_type', '');
                    setFieldValue('rejection_reason', '');
                    return;
                  }

                  const bookableFlaw = validation.flaw || findBookableFlaw(flaws, ptDone);

                  if (bookableFlaw) {
                    const pos1 = parseFloat(bookableFlaw.pos1) || 0;
                    const pos2 = parseFloat(bookableFlaw.pos2) || 0;
                    const flawCutOffLength = pos2 - pos1;

                    if (flawCutOffLength > 0) {
                      setFieldValue('pt_length', flawCutOffLength.toFixed(3));
                      setActiveFlaw(bookableFlaw); // Ties to state tracking
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

                <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 flex-1 min-h-0">
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
                        <FormikInput compact label="Product Type" name="product_type" readOnly/>
                        <FormikInput compact label="Drawn Date" name="drawn_date" type="date" />
                        <FormikInput compact label="PT Entry Date" name="pt_entry" type="date" />
                        <FormikInput compact label="PT Bobbin No" name="bobbin_no" placeholder="Scan bobbin..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setFieldValue('bobbin_no', val);
                            // Only call API when exactly 10 characters (scanner or manual entry)
                            if (val && val.length === 10) {
                              clearTimeout(window._ptBobbinTimer);
                              window._ptBobbinTimer = setTimeout(() => { handleBobbinBlur(val, setFieldValue); }, 500);
                            }
                          }} />
                        <FormikInput compact label="Spool Status" name="spool_status" placeholder="Spool Status" />
                      </div>
                      <FormikTextarea compact label="Drawn Remark" name="drawn_remark" rows={2} placeholder="Auto-fetched..." readOnly />


{/* PT Break Count */}
{values.pt_break_count >= 0 && (
  <div className="mt-2 flex items-center gap-1">
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
    </span>

    <span className="text-sm font-semibold text-red-600">
      PT Break Count: {values.pt_break_count}
    </span>
  </div>
)}



                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">FID</label>
                        <div className="flex gap-1">
                          <input
                            readOnly
                            value={values.fid}
                            placeholder="Click Generate..."
                            className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 outline-none"
                          />
                         
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
                        <FormikInput compact label="PT Strain" name="pt_strain" readOnly/>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 bg-slate-50/50 p-1.5 rounded">
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Std Length</label>
                          <div className="text-[11px] font-mono font-bold text-slate-600">50.600 km</div>
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

                  {/* COL 3: Rejections + Draw Flaw + PT Process Log */}
                  <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
                    {/* Top Row: Rejections + Draw Flaw side by side */}
                    <div className="flex gap-2 min-h-0">
                      {/* Rejections */}
                      <div className="flex flex-col min-h-0 w-[38%] flex-shrink-0">
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
                          <FormikInput
                            compact
                            name="multiple_end_weight"
                            type="number"
                            step="0.001"
                            placeholder="Enter weight (kg)"
                            className="!bg-white !text-slate-800 !font-semibold !border-slate-300"
                            onChange={(e) => {
                              const val = e.target.value;
                              setFieldValue('multiple_end_weight', val);
                              const weightNum = parseFloat(val) || 0;
                              const computedLength = weightNum * 37;
                              setFieldValue('pt_length', computedLength > 0 ? computedLength.toFixed(3) : '');
                            }}
                          />
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

                          </div>
                        </ModuleCard>
                      </div>

                      {/* Draw Flaw Log */}
                      <div className="flex-1 min-h-0 max-h-[200px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                          <ClipboardCheck size={12} className="text-indigo-600" />
                          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">
                            Draw Flaw Log
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[8px]">
                          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Booked</span>
                          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Missed</span>
                          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Pending</span>
                        </div>
                      </div>

                      <FieldArray name="pt_flaws">
                        {() => {
                          const ptDone = parseFloat(values.pt_done_so_far) || 0;
                          const flawsWithStatus = computeFlawStatuses(values.pt_flaws, ptDone);
                          return (
                          <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Status</th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Flaw</th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Pos 1</th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Pos 2</th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Defect L</th>
                                  <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Actual Cut</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-slate-100">
                                {flawsWithStatus.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="px-3 py-4 text-center text-[9px] text-slate-400">
                                      No entries found
                                    </td>
                                  </tr>
                                ) : (
                                  flawsWithStatus.map((flaw, index) => {
                                    const rowBg = flaw.status === 'BOOKED'
                                      ? 'bg-emerald-50/70'
                                      : flaw.status === 'MISSED'
                                        ? 'bg-rose-50/70'
                                        : '';
                                    const statusBadge = flaw.status === 'BOOKED'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : flaw.status === 'MISSED'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-slate-100 text-slate-600';
                                    return (
                                    <tr key={index} className={`${rowBg} transition-colors`}>
                                      <td className="px-2 py-1">
                                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${statusBadge}`}>
                                          {flaw.status}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1 text-xs font-bold text-slate-700">{flaw.reason}</td>
                                      <td className="px-2 py-1 text-xs font-mono">{flaw.pos1}</td>
                                      <td className="px-2 py-1 text-xs font-mono">{flaw.pos2}</td>
                                      <td className="px-2 py-1 text-xs font-mono">{flaw.defect_length}</td>
                                      <td className="px-2 py-1 text-xs font-mono">{flaw.actual_cutting}</td>
                                    </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          );
                        }}
                      </FieldArray>
                      </div>
                    </div>
                    {/* End of top row (Rejections + Draw Flaw) */}

                    {/* PT Process Log - full width below */}
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
                          {({ form }) => (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Bobbin No', 'Fid', 'Length','Status', ''].map(h => (
                                    <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.values.pt_logs?.map((log, idx) => {
                                  const hasFid = log.fid && log.fid.trim() !== '';
                                  const rejType = log.active_rejection_type;
                                  const status = hasFid && log.pt_flaw_remark
                                  ? "Flaw Not Cut"
                                  : hasFid
                                    ? 'OK'
                                    : rejType === 'rejection' ? (log.rejection_reason || 'Rejection')
                                    : rejType === 'multiple_end' ? 'Multiple End'
                                    : rejType === 'scratch' ? 'Scratch'
                                    : rejType === 'pt_scrap' ? 'PT Scrap'
                                    : rejType === 'ztmd' ? 'ZTMD'
                                    : rejType === 'doc' ? 'DOC'
                                    : rejType === 'bal_draw_rejection' ? 'Bal Draw Rej'
                                    : rejType ? rejType
                                    : log.rejection === true ? (log.rejection_reason || 'Rejection')
                                    : log.pt_scrap === true ? 'PT Scrap'
                                    : log.scratch === true ? 'Scratch'
                                    : log.multiple_end === true ? 'Multiple End'
                                    : log.ztmd === true ? 'ZTMD'
                                    : log.doc === true ? 'DOC'
                                    : 'Scrap';
                                  const isOk = status === 'OK';
                                  return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px-1 py-1 text-xs font-mono text-slate-700">{log.bobbin_no || '—'}</td>
                                    <td className="px-1 py-1 text-xs font-mono text-slate-600">{log.fid || '—'}</td>
                                    <td className="px-1 py-1 text-xs font-mono text-slate-600">{log.pt_length || '—'}</td>
                                    <td className="px-1 py-1">
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{status}</span>
                                    </td>
                                    
                                  </tr>
                                  );
                                })}
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

        {/* Flaw Overlap Confirmation Popup */}
        {showFlawConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-5 w-96">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Pending Flaw Instruction</h3>
              <p className="text-xs text-slate-600 mb-4 whitespace-pre-line">
                {"Your PT length falls within a flaw instruction range, but you have not selected the rejection for this flaw.\n\nIt is recommended to cancel, select the appropriate rejection type, and submit.\n\nDo you still want to continue without addressing this flaw?"}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowFlawConfirm(false); setPendingPtSubmit(null); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
                <button type="button" onClick={async () => {
                  setShowFlawConfirm(false);
                  if (pendingPtSubmit) {
                    await doPtSubmit(pendingPtSubmit.values, pendingPtSubmit.setFieldValue);
                  }
                  setPendingPtSubmit(null);
                }}
                  className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700">Continue Anyway</button>
              </div>
            </div>
          </div>
        )}

        {/* Spool End Popup */}
        {showSpoolEndPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Spool Complete</h3>
              <p className="text-xs text-slate-500 mb-1">
                Balance length is <strong className="text-emerald-600">0 KM</strong>. This spool is fully processed.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Would you like to mark this spool as <strong>PT Complete</strong> and <strong>free the PT machine</strong>?
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSpoolEndPopup(false)}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                  Skip
                </button>
                <button type="button" onClick={async () => {
                  setShowSpoolEndPopup(false);
                  try {
                    const token = localStorage.getItem('token');
                    const spool_id = formikRef.current?.values?.spool_id;
                    const pt_machine_no = formikRef.current?.values?.pt_machine_no;
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/ptentry/spool-complete`, {
                      spool_id,
                      pt_machine_no,
                    }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
                    showSuccess('Spool marked as PT Complete. Machine freed.');
                  } catch (e) {
                    showError(e?.response?.data?.message || 'Failed to mark spool complete');
                  }
                }}
                  className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">
                  Confirm Complete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Break Scrap Alert Popup */}
        {showBreakScrapAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 text-center">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-sm font-bold text-rose-700 mb-2">PT Break Detected</h3>
              <p className="text-xs text-slate-600 mb-4">
                This entry has a <strong className="text-rose-600">PT Break</strong>.<br/>
                Please book <strong className="text-rose-700 text-sm">180M</strong> scrap for this break.
              </p>
              <button type="button" onClick={() => setShowBreakScrapAlert(false)}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all">
                OK, Understood
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PTEntry;