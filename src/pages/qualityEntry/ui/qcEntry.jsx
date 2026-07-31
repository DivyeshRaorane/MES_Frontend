import { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { ShieldCheck, Scan, Award, AlertTriangle, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
import { FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { fetchBobbinQC, checkBobbinInPtEntry, gradeBobbin, checkProcessStatus, submitQCEntry, updateMissingValues, copyMbendAndCalcMac, updateMbendCycleAfterFailedSample } from '../services/qc_entry.api';

/* ── Compact table-cell input ── */
const TCell = ({ name, disabled, highlight }) => (
  <Field name={name} disabled={disabled}
    className={`w-full h-full px-1 py-0 text-[9px] outline-none text-center transition-all
      ${highlight ? 'bg-red-100 border-red-400 ring-1 ring-red-300' : ''}
      ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-transparent focus:bg-blue-50'}`} />
);
const GridDivider = ({ label }) => (
  <div className="col-span-2 pt-0.5 border-t border-slate-100">
    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);
const Col = ({ children }) => (
  <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-white border border-slate-200 rounded-lg px-1.5 py-1">
    <div className="grid grid-cols-2 gap-x-1 text-slate-2000 text-bold gap-y-0.5">{children}</div>
  </div>
);

/* ── Microbend rows ── */
const MB_ROWS = [
  { label: '100T 50mm', s1550: 'm_100T_50mm_1550', s1310: 'm_100T_50mm_1310', s1625: 'm_100T_50mm_1625' },
  { label: '100T 60mm', s1550: 'm_100T_60mm_1550', s1310: 'm_100T_60mm_1310', s1625: 'm_100T_60mm_1625' },
  { label: '1T 32mm',   s1550: 'm_1T_32mm_1550',   s1310: 'm_1T_32mm_1310',   s1625: 'm_1T_32mm_1625' },
  { label: '10T 30mm',  s1550: 'm_10T_30mm_1550',  s1310: 'm_10T_30mm_1310',  s1625: 'm_10T_30mm_1625' },
  { label: '1T 20mm',   s1550: 'm_1T_20mm_1550',   s1310: 'm_1T_20mm_1310',   s1625: 'm_1T_20mm_1625' },
  { label: '1T 15mm',   s1550: 'm_1T_15mm_1550',   s1310: 'm_1T_15mm_1310',   s1625: 'm_1T_15mm_1625' },
  { label: '1T 10mm',   s1550: 'm_1T_10mm_1550',   s1310: 'm_1T_10mm_1310',   s1625: 'm_1T_10mm_1625' },
];

/* ── All measurement fields (DB columns) ── */
const MEASUREMENT_FIELDS = [
  'avg_lsa_atn_1310','avg_lsa_atn_1550','avg_lsa_atn_1625','avg_lsa_atn_1383',
  'max_lsa_atn_1310','max_lsa_atn_1550','max_lsa_atn_1625','max_lsa_atn_1383',
  'min_lsa_atn_1310','min_lsa_atn_1550','min_lsa_atn_1625','min_lsa_atn_1383',
  'atn_1310_top','atn_1550_top','atn_1625_top','atn_1383_top',
  'atn_1310_bottom','atn_1550_bottom','atn_1625_bottom','atn_1383_bottom',
  'max_atn_1310_top','max_atn_1550_top','max_atn_1625_top','max_atn_1383_top',
  'max_atn_1310_bottom','max_atn_1550_bottom','max_atn_1625_bottom','max_atn_1383_bottom',
  'max_tb_1310','max_tb_1550','max_tb_1625','max_tb_1383',
  'atn_1310_tb','atn_1550_tb','atn_1625_tb','atn_1383_tb',
  'atn_uniformity_1310','atn_uniformity_1550','atn_uniformity_1625','atn_uniformity_1383',
  'mfd_uniformity_1310','mfd_uniformity_1550','mfd_uniformity_1625','mfd_uniformity_1383',
  'step_1310_size','step_1550_size','step_1625_size','step_1383_size',
  'spike_1310_size','spike_1550_size','spike_1625_size','spike_1383_size',
  'spec_1310','spec_1550','spec_1285_1330',
  'mfd_1310_top','mfd_1310_bottom','mfd_1550_top','mfd_1550_bottom',
  'effective_area_1310','effective_area_1550',
  'cut_off_top','cut_off_bottom','cable_cut_off','mac_value',
  'clad_dia_top','clad_dia_bottom','core_clad_concentricity_top','core_clad_concentricity_bottom',
  'clad_ovality_top','clad_ovality_bottom','core_dia_top','core_dia_bottom',
  'core_ovality_top','core_ovality_bottom',
  'primary_coating_dia_top','primary_coating_dia_bottom',
  'secondary_coating_dia_top','secondary_coating_dia_bottom',
  'primary_coating_concentricity_top','primary_coating_concentricity_bottom',
  'secondary_coating_concentricity_top','secondary_coating_concentricity_bottom',
  'coating_ovality_top','coating_ovality_bottom',
  'fiber_curl_top','fiber_curl_bottom','curl_defection_top','curl_defection_bottom',
  'zero_disp_wave','slope_zero_disp','disp_1550','disp_1285_1330','disp_1270_1340',
  'disp_1575','cd_1460','disp_1625','disp_1570','disp_1260','disp_slope',
  'pmd_1310','pmd_1550',
  'm_100T_50mm_1550','m_100T_50mm_1310','m_100T_50mm_1625',
  'm_100T_60mm_1550','m_100T_60mm_1310','m_100T_60mm_1625',
  'm_1T_32mm_1550','m_1T_32mm_1310','m_1T_32mm_1625',
  'm_10T_30mm_1550','m_10T_30mm_1310','m_10T_30mm_1625',
  'm_1T_20mm_1550','m_1T_20mm_1310','m_1T_20mm_1625',
  'm_1T_15mm_1550','m_1T_15mm_1310','m_1T_15mm_1625',
  'm_1T_10mm_1550','m_1T_10mm_1310','m_1T_10mm_1625',
];

const buildInitialValues = () => {
  const vals = { bobbin_no: '', bobbin_fid: '', matcode: '' };
  MEASUREMENT_FIELDS.forEach(f => { vals[f] = ''; });
  return vals;
};

/* ── Failure Dialog ── */
const FailureDialog = ({ isOpen, details, onFail, onRew, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-[420px]">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-700">QC Evaluation Failed</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 space-y-1.5">
          <p className="text-xs text-slate-700"><span className="font-bold">Grade Checked:</span> {details?.grade_checked}</p>
          <p className="text-xs text-slate-700"><span className="font-bold">Failed Parameter:</span> <span className="text-red-600 font-mono">{details?.failed_parameter}</span></p>
          <p className="text-xs text-slate-700"><span className="font-bold">Measured Value:</span> {details?.measured_value}</p>
          <p className="text-xs text-slate-700"><span className="font-bold">Allowed Range:</span> [{details?.min} to {details?.max}]</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onFail} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all">FAIL</button>
          <button onClick={onRew} className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all">REWINDING</button>
          <button onClick={onCancel} className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Reusable: MBEnd Copy + MAC Calculation
   Called after a bobbin is successfully fetched via Scan.
   Delegates all logic to the backend endpoint.
   ══════════════════════════════════════════════════════════ */
const executeMbendCopyAndMac = async (bobbin_no) => {
  if (!bobbin_no) return null;
  try {
    console.log('[MBEnd] Triggering MBEnd copy + MAC calc for:', bobbin_no);
    const res = await copyMbendAndCalcMac(bobbin_no);
    if (res?.success) {
      if (res.mbend_copied) console.log('[MBEnd] MBEnd values copied from sample:', res.sample_fid);
      if (res.mac_calculated) console.log('[MBEnd] MAC value calculated:', res.mac_value);
      return res;
    } else {
      console.log('[MBEnd] Skipped:', res?.message || 'No action needed');
      return res;
    }
  } catch (e) {
    console.error('[MBEnd] Error:', e?.response?.data?.message || e.message);
    return null;
  }
};

/* ══════════════════════════════════════════════════════════ */
const QCEntryScreen = () => {
  const [scanInput, setScanInput] = useState('');
  const [source, setSource] = useState(null); // 'temp' | 'final' | null
  const [grade, setGrade] = useState('');
  const [graded, setGraded] = useState(false);
  const [failedParam, setFailedParam] = useState('');
  const [processStatus, setProcessStatus] = useState(null);
  const [failDialog, setFailDialog] = useState({ open: false, details: null });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingTempGrade, setExistingTempGrade] = useState('');
  const [existingFinalGrade, setExistingFinalGrade] = useState('');
  const [rewPopup, setRewPopup] = useState(false);
  const [rewCuts, setRewCuts] = useState([{ p1: '', p2: '', c_remark: '' }]);
  const [missingPopup, setMissingPopup] = useState(false);
  const [missingParams, setMissingParams] = useState([]);
  const [missingValues, setMissingValues] = useState({});
  const [missingBobbin, setMissingBobbin] = useState('');
  const [savingMissing, setSavingMissing] = useState(false);
  const [ptCheckPopup, setPtCheckPopup] = useState({ open: false, messages: [] });
  const formRef = useRef(null);
  const scanRef = useRef(null);

  const locked = source === 'final';

  /* ── Fetch ── */
  const handleFetch = async (setValues) => {
    console.log("What is the value:", setValues)
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) { showError('Enter bobbin number'); return; }
    setLoading(true);
    setGrade(''); setGraded(false); setFailedParam(''); setProcessStatus(null);
    setExistingTempGrade(''); setExistingFinalGrade('');
    try {
      const res = await fetchBobbinQC(bobbin_no);
      console.log("Response:", res)
      if (!res?.success) {
        // Bobbin not in QC — check PT Entry table for flags
        try {
          const ptRes = await checkBobbinInPtEntry(bobbin_no);
          console.log("Res:", ptRes)
          if (ptRes?.success && ptRes?.found) {
            const msgs = [];
            if (ptRes.full_check) msgs.push('This is mandatory for Full Check — please do full checking.');
            if (ptRes.is_sample) msgs.push('This is MBend sample bobbin — please do MBEND for this.');
            if (ptRes.full_mbend) msgs.push('MBend is mandatory for this bobbin.');
            if (msgs.length > 0) {
              setPtCheckPopup({ open: true, messages: msgs });
            } else {
              showError('Bobbin found in PT Entry but not yet available in QC.');
            }
          } else {
            showError(res?.message || 'Bobbin not found.');
          }
        } catch (ptErr) {
          showError(res?.message || 'Bobbin not found.');
        }
        setSource(null); setValues(buildInitialValues()); setLoading(false); return;
      }
      setSource(res.source); // 'temp' or 'final'
      const data = res.data || {};
      const newVals = buildInitialValues();
      Object.keys(newVals).forEach(k => { if (data[k] !== undefined && data[k] !== null) newVals[k] = data[k]; });
      newVals.bobbin_no = bobbin_no;
      setValues(newVals);
      // Show existing grades if available
      if (data.temp_grade) setExistingTempGrade(data.temp_grade);
      if (data.final_grade) setExistingFinalGrade(data.final_grade);
      if (res.source === 'final') showError('Final QC has already been completed for this bobbin.');

      // Execute MBEnd copy + MAC calculation (backend handles all logic)
      if (res.source !== 'final') {
        const mbRes = await executeMbendCopyAndMac(bobbin_no);
        if (mbRes?.success && (mbRes.mbend_copied || mbRes.mac_calculated)) {
          // Re-fetch to get updated values after MBEnd copy / MAC calc
          const refreshRes = await fetchBobbinQC(bobbin_no);
          if (refreshRes?.success) {
            const refreshData = refreshRes.data || {};
            const refreshVals = buildInitialValues();
            Object.keys(refreshVals).forEach(k => { if (refreshData[k] !== undefined && refreshData[k] !== null) refreshVals[k] = refreshData[k]; });
            refreshVals.bobbin_no = bobbin_no;
            setValues(refreshVals);
          }
        }
      }
    } catch (e) {
      // If 404 or bobbin not found in QC — fallback to PT Entry check
      const status = e?.response?.status;
      const errMsg = e?.response?.data?.message || 'Fetch failed';
      if (status === 404 || errMsg.toLowerCase().includes('not found')) {
        try {
          const ptRes = await checkBobbinInPtEntry(bobbin_no);
          if (ptRes?.success && ptRes?.found) {
            const msgs = [];
            if (ptRes.full_check) msgs.push('This is mandatory for Full Check — please do full checking.');
            if (ptRes.is_sample) msgs.push('This is MBend sample bobbin — please do MBEND for this.');
            if (ptRes.full_mbend) msgs.push('MBend is mandatory for this bobbin.');
            if (msgs.length > 0) {
              setPtCheckPopup({ open: true, messages: msgs });
            } else {
              showError('Bobbin found in PT Entry but not yet available in QC.');
            }
          } else {
            showError('Bobbin not found.');
          }
        } catch (ptErr) {
          showError('Bobbin not found.');
        }
      } else {
        showError(errMsg);
      }
      setSource(null); setValues(buildInitialValues());
    }
    setLoading(false);
  };

  /* ── Grade ── */
  const handleGrade = async (values) => {
    if (!values.bobbin_no) { showError('Fetch a bobbin first'); return; }
    setLoading(true);
    try {
      const res = await gradeBobbin(values.bobbin_no);
      console.log('Grade response:', res);
      
      // Handle response — res is already axios res.data, may have nested .data
      const data = res?.data?.status ? res.data : res;
      
      if (data?.status === 'PASSED') {
        const matchedGrade = data.matched_grade;
        setGrade(matchedGrade);
        setGraded(true);
        setFailedParam('');
        setExistingTempGrade(matchedGrade);
        showSuccess(`Temp Grade: ${matchedGrade}`);

        // Save temp_grade to qc_entry_temp and bobbin_entries
        try {
          const measurements = {};
          MEASUREMENT_FIELDS.forEach(f => { if (values[f] !== '' && values[f] !== null) measurements[f] = Number(values[f]); });
          await submitQCEntry({
            bobbin_no: values.bobbin_no,
            bobbin_fid: values.bobbin_fid,
            matcode: values.matcode,
            grade: matchedGrade,
            action: 'temp_grade',
            measurements,
          });
        } catch (err) { console.error('Temp grade save error:', err); }

      } else if (data?.status === 'FAILED') {
        setFailedParam(data.failure_details?.failed_parameter || '');
        setFailDialog({ open: true, details: data.failure_details });
      } else if (data?.status === 'MISSING_DATA') {
        // Open missing data popup
        const params = data.missing_parameters || [];
        setMissingParams(params);
        setMissingValues(params.reduce((acc, p) => ({ ...acc, [p]: '' }), {}));
        setMissingBobbin(values.bobbin_no);
        setMissingPopup(true);
      } else {
        showError(data?.message || 'Unexpected grading response');
      }
    } catch (e) { showError(e?.response?.data?.message || 'Grading failed'); }
    setLoading(false);
  };

  const handleFailAction = (action) => {
    if (action === 'fail') {
      setGrade('FAIL');
      setGraded(true);
      setFailDialog({ open: false, details: null });
    } else {
      // Show rewinding instruction popup
      setFailDialog({ open: false, details: null });
      setRewCuts([{ p1: '', p2: '', c_remark: '' }]);
      setRewPopup(true);
    }
  };

  /* ── Rewinding popup confirm ── */
  const handleRewConfirm = () => {
    // Validate at least one cut has p1 and p2
    const hasEmpty = rewCuts.some(c => !c.p1 || !c.p2);
    if (hasEmpty) { showError('Fill all P1 and P2 values'); return; }

    // Build remark string: "Cut from {p1} km to {p2}({c_remark}:)"
    const remarkParts = rewCuts.map(cut =>
      `Cut from ${cut.p1} km to ${cut.p2}(${cut.c_remark}:)`
    );
    const remarkStr = remarkParts.join(', ');

    setGrade('REW');
    setGraded(true);
    setRewPopup(false);
    // Store remark in a ref so submit can access it
    formRef.current = remarkStr;
  };

  /* ── Final Grade ── */
  const handleFinalGrade = async (values) => {
    if (!existingTempGrade) { showError('Temp Grade must be assigned first'); return; }
    setLoading(true);
    try {
      // Use existing temp_grade — do NOT recalculate
      // Execute existing Final Grade Validation via backend
      const pRes = await checkProcessStatus(values.bobbin_no);
      const processData = pRes?.data || pRes;
      setProcessStatus(processData);

      // Check if all validations pass
      if (processData?.is_final_eligible || (processData?.is_pv && processData?.is_d2 && processData?.is_h2_after)) {
        // Validation passed — set final_grade = temp_grade
        setGrade(existingTempGrade);
        setGraded(true);
        setExistingFinalGrade(existingTempGrade);
        showSuccess(`Final Grade assigned: ${existingTempGrade}`);

        // Submit immediately with action = 'final_grade'
        const measurements = {};
        MEASUREMENT_FIELDS.forEach(f => { if (values[f] !== '' && values[f] !== null) measurements[f] = Number(values[f]); });
        const payload = {
          bobbin_no: values.bobbin_no,
          bobbin_fid: values.bobbin_fid,
          matcode: values.matcode,
          grade: existingTempGrade,
          action: 'final_grade',
          measurements,
        };
        const res = await submitQCEntry(payload);
        if (res?.success) {
          showSuccess(`Final QC completed! Grade: ${existingTempGrade}`);
          setSource('final');
        } else { showError(res?.message || 'Final grade update failed'); }
      } else {
        // Validation failed — show what's pending
        const pending = processData?.pending || [];
        if (!pending.length) {
          if (!processData?.is_pv) pending.push('PV');
          if (!processData?.is_d2) pending.push('D2');
          if (!processData?.is_h2_after) pending.push('H2');
        }
        showError(`Final Grade cannot be assigned. Pending: ${pending.join(', ')}`);
      }
    } catch (e) { showError(e?.response?.data?.message || 'Final Grade validation failed'); }
    setLoading(false);
  };

  /* ── Submit (Update) ── */
  const handleSubmit = async (values) => {
    if (!graded) { showError('Click Temp Grade first'); return; }
    setSubmitting(true);
    try {
      // Build measurements
      const measurements = {};
      MEASUREMENT_FIELDS.forEach(f => { if (values[f] !== '' && values[f] !== null) measurements[f] = Number(values[f]); });

      const payload = {
        bobbin_no: values.bobbin_no,
        bobbin_fid: values.bobbin_fid,
        matcode: values.matcode,
        grade,
        action: (grade === 'FAIL' || grade === 'REW') ? 'immediate_final' : 'temp_grade',
        measurements,
        remark: grade === 'REW' ? (formRef.current || null) : null,
      };

      const res = await submitQCEntry(payload);
      if (res?.success) {
        if (grade === 'FAIL' || grade === 'REW') {
          showSuccess(`QC finalized as ${grade}. All tables updated.`);
          setExistingTempGrade(grade);
          setExistingFinalGrade(grade);
          setSource('final');

          // Trigger MBend cycle reassignment if this was a sample bobbin
          try {
            const mbendRes = await updateMbendCycleAfterFailedSample(values.bobbin_no);
            if (mbendRes?.success && mbendRes?.reassigned) {
              console.log('[MBend Reassign] New sample assigned:', mbendRes.new_sample_bobbin);
            }
          } catch (mbErr) {
            console.error('[MBend Reassign] Error:', mbErr?.response?.data?.message || mbErr.message);
          }
        } else {
          showSuccess(`Temp Grade saved: ${grade}`);
          setExistingTempGrade(grade);
        }
      } else { showError(res?.message || 'Update failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Update failed'); }
    setSubmitting(false);
  };

  /* ── Grade badge color ── */
  const gradeColor = grade === 'FAIL' ? 'bg-red-100 text-red-700 border-red-300'
    : grade === 'REW' ? 'bg-amber-100 text-amber-700 border-amber-300'
    : grade ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : '';

  /* ── Field helper ── */
  const fi = (label, name) => (
    <FormikInput compact label={label} name={name} disabled={locked}
      className={failedParam === name ? 'bg-red-50 border-red-400 ring-1 ring-red-300' : ''} />
  );

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={buildInitialValues()} onSubmit={() => {}}>
          {({ values, setValues }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Action Bar ── */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <div className="bg-slate-700 p-1.5 text-white rounded flex-shrink-0">
                  <ShieldCheck size={13} />
                </div>

                {/* Scan */}
                <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                  <span className="bg-blue-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">BOBBIN</span>
                  <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFetch(setValues); } }}
                    className="w-32 px-2 py-1 text-xs outline-none font-bold text-blue-700" placeholder="Scan..." />
                </div>
                <button type="button" onClick={() => handleFetch(setValues)} disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition-all">
                  <Scan size={10} /> {loading ? 'Loading...' : 'Fetch'}
                </button>

                {/* FID display */}
                {values.bobbin_fid && (
                  <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                    <span className="bg-orange-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">FID</span>
                    <span className="px-2 py-1 text-xs font-bold font-mono text-slate-700">{values.bobbin_fid}</span>
                  </div>
                )}

                {/* Source badge */}
                {source && (
                  <span className={`text-[9px] font-bold px-2 py-1 rounded border ${
                    source === 'final' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-blue-100 text-blue-700 border-blue-300'
                  }`}>{source === 'final' ? 'Final QC Done' : 'Temp QC'}</span>
                )}

                {/* Existing Temp Grade badge */}
                {existingTempGrade && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
                    Temp: {existingTempGrade}
                  </span>
                )}

                {/* Existing Final Grade badge */}
                {existingFinalGrade && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Final: {existingFinalGrade}
                  </span>
                )}

                {/* Grade badge */}
                {grade && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${gradeColor}`}>
                    <Award size={10} className="inline mr-1" />{grade}
                  </span>
                )}

                {/* Process status */}
                {processStatus && (
                  <div className="flex items-center gap-1.5">
                    {[['PV', processStatus.is_pv], ['D2', processStatus.is_d2], ['H2', processStatus.is_h2_after]].map(([l, v]) => (
                      <span key={l} className="flex items-center gap-0.5 text-[8px] font-bold">
                        {v ? <CheckCircle2 size={10} className="text-emerald-500" /> : <XCircle size={10} className="text-red-400" />}
                        {l}
                      </span>
                    ))}
                  </div>
                )}

                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => handleGrade(values)} disabled={locked || loading || !values.bobbin_no}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded hover:bg-amber-600 disabled:opacity-40 transition-all">
                    <Award size={10} /> Temp Grade
                  </button>
                  <button type="button" onClick={() => handleFinalGrade(values)} disabled={locked || loading || !values.bobbin_no}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 disabled:opacity-40 transition-all">
                    <CheckCircle2 size={10} /> Final Grade
                  </button>
                  <ResetButton compact type="button" onClick={() => {
                    setValues(buildInitialValues()); setScanInput(''); setSource(null); setGrade(''); setGraded(false); setFailedParam(''); setProcessStatus(null); setExistingTempGrade(''); setExistingFinalGrade('');
                  }}>Reset</ResetButton>
                  <SubmitButton compact type="button" disabled={submitting || !graded || locked || (!!existingTempGrade && !!existingFinalGrade)} onClick={() => handleSubmit(values)}>
                    {submitting ? 'Saving...' : 'Update'}
                  </SubmitButton>
                </div>
              </div>

              {/* ── 5-column data grid ── */}
              <div className="flex gap-1 flex-1 min-h-0 overflow-hidden px-1.5 py-1">

                {/* ── COL 1 ── */}
                <Col>
                  {fi('Avg LSA 1310', 'avg_lsa_atn_1310')}
                  {fi('Avg LSA 1550', 'avg_lsa_atn_1550')}
                  {fi('Avg LSA 1625', 'avg_lsa_atn_1625')}
                  {fi('Avg LSA 1383', 'avg_lsa_atn_1383')}
                  {fi('Max LSA 1310', 'max_lsa_atn_1310')}
                  {fi('Max LSA 1550', 'max_lsa_atn_1550')}
                  {fi('Max LSA 1625', 'max_lsa_atn_1625')}
                  {fi('Max LSA 1383', 'max_lsa_atn_1383')}
                  {fi('Min LSA 1310', 'min_lsa_atn_1310')}
                  {fi('Min LSA 1550', 'min_lsa_atn_1550')}
                  {fi('Min LSA 1625', 'min_lsa_atn_1625')}
                  {fi('Min LSA 1383', 'min_lsa_atn_1383')}
                  <GridDivider label="ATN Top/Bottom" />
                  {fi('ATN 1310 T', 'atn_1310_top')}
                  {fi('ATN 1550 T', 'atn_1550_top')}
                  {fi('ATN 1625 T', 'atn_1625_top')}
                  {fi('ATN 1383 T', 'atn_1383_top')}
                  {fi('ATN 1310 B', 'atn_1310_bottom')}
                  {fi('ATN 1550 B', 'atn_1550_bottom')}
                  {fi('ATN 1625 B', 'atn_1625_bottom')}
                  {fi('ATN 1383 B', 'atn_1383_bottom')}
                </Col>

                {/* ── COL 2 ── */}
                <Col>
                  {fi('Max ATN 1310 T', 'max_atn_1310_top')}
                  {fi('Max ATN 1550 T', 'max_atn_1550_top')}
                  {fi('Max ATN 1625 T', 'max_atn_1625_top')}
                  {fi('Max ATN 1383 T', 'max_atn_1383_top')}
                  {fi('Max ATN 1310 B', 'max_atn_1310_bottom')}
                  {fi('Max ATN 1550 B', 'max_atn_1550_bottom')}
                  {fi('Max ATN 1625 B', 'max_atn_1625_bottom')}
                  {fi('Max ATN 1383 B', 'max_atn_1383_bottom')}
                  <GridDivider label="TB / Uniformity" />
                  {fi('Max TB 1310', 'max_tb_1310')}
                  {fi('Max TB 1550', 'max_tb_1550')}
                  {fi('Max TB 1625', 'max_tb_1625')}
                  {fi('Max TB 1383', 'max_tb_1383')}
                  {fi('ATN TB 1310', 'atn_1310_tb')}
                  {fi('ATN TB 1550', 'atn_1550_tb')}
                  {fi('ATN TB 1625', 'atn_1625_tb')}
                  {fi('ATN TB 1383', 'atn_1383_tb')}
                  {fi('ATN Uni 1310', 'atn_uniformity_1310')}
                  {fi('ATN Uni 1550', 'atn_uniformity_1550')}
                  {fi('ATN Uni 1625', 'atn_uniformity_1625')}
                  {fi('ATN Uni 1383', 'atn_uniformity_1383')}
                </Col>

                {/* ── COL 3 ── */}
                <Col>
                  {fi('MFD 1310 T', 'mfd_1310_top')}
                  {fi('MFD 1310 B', 'mfd_1310_bottom')}
                  {fi('MFD 1550 T', 'mfd_1550_top')}
                  {fi('MFD 1550 B', 'mfd_1550_bottom')}
                  {fi('MFD Uni 1310', 'mfd_uniformity_1310')}
                  {fi('MFD Uni 1550', 'mfd_uniformity_1550')}
                  {fi('MFD Uni 1625', 'mfd_uniformity_1625')}
                  {fi('MFD Uni 1383', 'mfd_uniformity_1383')}
                  <GridDivider label="Geometry" />
                  {fi('Clad Dia T', 'clad_dia_top')}
                  {fi('Clad Dia B', 'clad_dia_bottom')}
                  {fi('Core Clad T', 'core_clad_concentricity_top')}
                  {fi('Core Clad B', 'core_clad_concentricity_bottom')}
                  {fi('Clad Oval T', 'clad_ovality_top')}
                  {fi('Clad Oval B', 'clad_ovality_bottom')}
                  {fi('Core Dia T', 'core_dia_top')}
                  {fi('Core Dia B', 'core_dia_bottom')}
                  {fi('Core Oval T', 'core_ovality_top')}
                  {fi('Core Oval B', 'core_ovality_bottom')}
                  {fi('Cutoff T', 'cut_off_top')}
                  {fi('Cutoff B', 'cut_off_bottom')}
                  {fi('Cable Cut', 'cable_cut_off')}
                  {fi('MAC Value', 'mac_value')}
                  {fi('Eff Area 1310', 'effective_area_1310')}
                  {fi('Eff Area 1550', 'effective_area_1550')}
                </Col>

                {/* ── COL 4 ── */}
                <Col>
                  {fi('Pri Coat T', 'primary_coating_dia_top')}
                  {fi('Pri Coat B', 'primary_coating_dia_bottom')}
                  {fi('Sec Coat T', 'secondary_coating_dia_top')}
                  {fi('Sec Coat B', 'secondary_coating_dia_bottom')}
                  {fi('Pri Conc T', 'primary_coating_concentricity_top')}
                  {fi('Pri Conc B', 'primary_coating_concentricity_bottom')}
                  {fi('Sec Conc T', 'secondary_coating_concentricity_top')}
                  {fi('Sec Conc B', 'secondary_coating_concentricity_bottom')}
                  {fi('Coat Oval T', 'coating_ovality_top')}
                  {fi('Coat Oval B', 'coating_ovality_bottom')}
                  {fi('Fiber Curl T', 'fiber_curl_top')}
                  {fi('Fiber Curl B', 'fiber_curl_bottom')}
                  {fi('Curl Def T', 'curl_defection_top')}
                  {fi('Curl Def B', 'curl_defection_bottom')}
                  <GridDivider label="Dispersion / PMD" />
                  {fi('Zero Disp', 'zero_disp_wave')}
                  {fi('Slope Zero', 'slope_zero_disp')}
                  {fi('Disp 1550', 'disp_1550')}
                  {fi('Disp 1285', 'disp_1285_1330')}
                  {fi('Disp 1270', 'disp_1270_1340')}
                  {fi('Disp 1575', 'disp_1575')}
                  {fi('CD 1460', 'cd_1460')}
                  {fi('Disp 1625', 'disp_1625')}
                  {fi('Disp 1570', 'disp_1570')}
                  {fi('Disp 1260', 'disp_1260')}
                  {fi('Disp Slope', 'disp_slope')}
                  {fi('PMD 1310', 'pmd_1310')}
                  {fi('PMD 1550', 'pmd_1550')}
                </Col>

                {/* ── COL 5: Microbend + Step/Spike ── */}
                <Col>
                  <GridDivider label="Step / Spike" />
                  {fi('Step 1310', 'step_1310_size')}
                  {fi('Step 1550', 'step_1550_size')}
                  {fi('Step 1625', 'step_1625_size')}
                  {fi('Step 1383', 'step_1383_size')}
                  {fi('Spike 1310', 'spike_1310_size')}
                  {fi('Spike 1550', 'spike_1550_size')}
                  {fi('Spike 1625', 'spike_1625_size')}
                  {fi('Spike 1383', 'spike_1383_size')}
                  {fi('Spec 1310', 'spec_1310')}
                  {fi('Spec 1550', 'spec_1550')}
                  {fi('Spec 1285', 'spec_1285_1330')}
                  {/* Microbend table */}
                  <div className="col-span-2 mt-1">
                    <table className="w-full text-[8px] border-collapse border border-slate-200 rounded overflow-hidden">
                      <thead className="bg-slate-700 text-white">
                        <tr>
                          <th className="border border-slate-500 py-0.5 font-normal px-1 text-left">Spec</th>
                          <th className="border border-slate-500 py-0.5 font-normal">1550</th>
                          <th className="border border-slate-500 py-0.5 font-normal">1310</th>
                          <th className="border border-slate-500 py-0.5 font-normal">1625</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MB_ROWS.map(({ label, s1550, s1310, s1625 }) => (
                          <tr key={label} className="bg-white">
                            <td className="border border-slate-200 px-1 text-[7px] font-bold bg-slate-50 whitespace-nowrap">{label}</td>
                            <td className="border border-slate-200 h-5"><TCell name={s1550} disabled={locked} highlight={failedParam === s1550} /></td>
                            <td className="border border-slate-200 h-5"><TCell name={s1310} disabled={locked} highlight={failedParam === s1310} /></td>
                            <td className="border border-slate-200 h-5"><TCell name={s1625} disabled={locked} highlight={failedParam === s1625} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Col>

              </div>

            </Form>
          )}
        </Formik>

        <FailureDialog isOpen={failDialog.open} details={failDialog.details}
          onFail={() => handleFailAction('fail')} onRew={() => handleFailAction('rew')}
          onCancel={() => setFailDialog({ open: false, details: null })} />

        {/* ── Rewinding Instruction Popup ── */}
        {rewPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-5 w-[450px] max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Rewinding Instructions</h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">Enter cutting instructions for rewinding. These will be saved as the QC remark.</p>

              <div className="border border-slate-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Cutting Instructions</span>
                  <button type="button" onClick={() => setRewCuts(prev => [...prev, { p1: '', p2: '', c_remark: '' }])}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold rounded border border-blue-200 hover:bg-blue-100">
                    <Plus size={9} /> Add Row
                  </button>
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-500 font-bold">
                      <th className="text-left py-1">P1 (km)</th>
                      <th className="text-left py-1">P2 (km)</th>
                      <th className="text-left py-1">Remark</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewCuts.map((cut, ci) => (
                      <tr key={ci}>
                        <td className="py-1 pr-1">
                          <input type="number" step="0.001" value={cut.p1}
                            onChange={e => { const v = [...rewCuts]; v[ci].p1 = e.target.value; setRewCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="0.000" />
                        </td>
                        <td className="py-1 pr-1">
                          <input type="number" step="0.001" value={cut.p2}
                            onChange={e => { const v = [...rewCuts]; v[ci].p2 = e.target.value; setRewCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="0.000" />
                        </td>
                        <td className="py-1 pr-1">
                          <input type="text" value={cut.c_remark}
                            onChange={e => { const v = [...rewCuts]; v[ci].c_remark = e.target.value; setRewCuts(v); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="e.g. h1310" />
                        </td>
                        <td className="py-1 text-center">
                          {rewCuts.length > 1 && (
                            <button type="button" onClick={() => setRewCuts(prev => prev.filter((_, i) => i !== ci))}
                              className="text-slate-300 hover:text-rose-500"><Trash2 size={11} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setRewPopup(false); setRewCuts([{ p1: '', p2: '', c_remark: '' }]); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
                <button type="button" onClick={handleRewConfirm}
                  className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700">Confirm Rewinding</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Missing QC Parameters Popup ── */}
        {missingPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-5 w-[450px] max-h-[80vh] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Missing QC Parameters</h3>
              <p className="text-[10px] text-slate-500 mb-4">The following QC values are required before grading can continue.</p>
              <div className="space-y-2 mb-4">
                {missingParams.map(param => (
                  <div key={param} className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">{param.replace(/_/g, ' ')}</label>
                    <input
                      type="number" step="any"
                      value={missingValues[param] || ''}
                      onChange={e => setMissingValues(prev => ({ ...prev, [param]: e.target.value }))}
                      className="border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="Enter value..."
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setMissingPopup(false); setMissingParams([]); setMissingValues({}); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
                <button type="button" disabled={savingMissing} onClick={async () => {
                  // Only save fields that have values (not mandatory to fill all)
                  const filledValues = {};
                  missingParams.forEach(p => {
                    if (missingValues[p] && missingValues[p].trim() !== '') {
                      filledValues[p.toLowerCase()] = Number(missingValues[p]);
                    }
                  });

                  if (Object.keys(filledValues).length === 0) { showError('Please fill at least one value'); return; }

                  setSavingMissing(true);
                  try {
                    const res = await updateMissingValues({ bobbin_no: missingBobbin, values: filledValues });
                    if (res?.success) {
                      showSuccess('Values saved. Re-validating...');
                      setMissingPopup(false);
                      setMissingParams([]);
                      setMissingValues({});
                      // Auto re-run grade validation
                      setTimeout(() => handleGrade({ bobbin_no: missingBobbin, bobbin_fid: '', matcode: '' }), 500);
                    } else { showError(res?.message || 'Save failed'); }
                  } catch (e) { showError(e?.response?.data?.message || 'Failed to save missing values'); }
                  setSavingMissing(false);
                }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
                  {savingMissing ? 'Saving...' : 'Save & Re-validate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PT Entry Check Popup (Bobbin not in QC but found in PT) ── */}
        {ptCheckPopup.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-5 w-[450px]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-amber-700">Bobbin Not In QC — Action Required</h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 space-y-2">
                {ptCheckPopup.messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 font-medium">{msg}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setPtCheckPopup({ open: false, messages: [] })}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all">
                  OK, Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QCEntryScreen;
