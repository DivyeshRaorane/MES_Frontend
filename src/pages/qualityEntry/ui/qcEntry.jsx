import { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { ShieldCheck, Scan, Award, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { fetchBobbinQC, gradeBobbin, checkProcessStatus, submitQCEntry } from '../services/qc_entry.api';

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
    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">{children}</div>
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
  const formRef = useRef(null);
  const scanRef = useRef(null);

  const locked = source === 'final';

  /* ── Fetch ── */
  const handleFetch = async (setValues) => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) { showError('Enter bobbin number'); return; }
    setLoading(true);
    setGrade(''); setGraded(false); setFailedParam(''); setProcessStatus(null);
    try {
      const res = await fetchBobbinQC(bobbin_no);
      if (!res?.success) { showError(res?.message || 'Bobbin not found.'); setSource(null); setLoading(false); return; }
      setSource(res.source); // 'temp' or 'final'
      const data = res.data || {};
      const newVals = buildInitialValues();
      Object.keys(newVals).forEach(k => { if (data[k] !== undefined && data[k] !== null) newVals[k] = data[k]; });
      newVals.bobbin_no = bobbin_no;
      setValues(newVals);
      if (res.source === 'final') showError('Final QC has already been completed for this bobbin.');
    } catch (e) { showError(e?.response?.data?.message || 'Fetch failed'); setSource(null); }
    setLoading(false);
  };

  /* ── Grade ── */
  const handleGrade = async (values) => {
    if (!values.bobbin_no) { showError('Fetch a bobbin first'); return; }
    setLoading(true);
    try {
      const res = await gradeBobbin(values.bobbin_no);
      console.log('Grade response:', res);
      
      // Handle both direct response and nested .data response
      const data = res?.data || res;
      
      if (data?.status === 'PASSED') {
        setGrade(data.matched_grade);
        setGraded(true);
        setFailedParam('');
        showSuccess(`Grade: ${data.matched_grade}`);
      } else if (data?.status === 'FAILED') {
        setFailedParam(data.failure_details?.failed_parameter || '');
        setFailDialog({ open: true, details: data.failure_details });
      } else {
        showError(data?.message || 'Unexpected grading response');
      }
    } catch (e) { showError(e?.response?.data?.message || 'Grading failed'); }
    setLoading(false);
  };

  const handleFailAction = (action) => {
    setGrade(action === 'fail' ? 'FAIL' : 'REW');
    setGraded(true);
    setFailDialog({ open: false, details: null });
  };

  /* ── Submit ── */
  const handleSubmit = async (values) => {
    if (!graded) { showError('Click Grade first'); return; }
    setSubmitting(true);
    try {
      // Process check first
      const pRes = await checkProcessStatus(values.bobbin_no);
      setProcessStatus(pRes);

      // Build measurements
      const measurements = {};
      MEASUREMENT_FIELDS.forEach(f => { if (values[f] !== '' && values[f] !== null) measurements[f] = Number(values[f]); });

      const payload = {
        bobbin_no: values.bobbin_no,
        bobbin_fid: values.bobbin_fid,
        matcode: values.matcode,
        grade,
        measurements,
      };

      const res = await submitQCEntry(payload);
      if (res?.success) {
        if (res.type === 'temp') showSuccess(`Temporary QC saved. Pending: ${res.pending?.join(', ') || 'none'}`);
        else if (res.type === 'final') showSuccess(`Final QC submitted! Grade: ${grade}`);
      } else { showError(res?.message || 'Submit failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Submit failed'); }
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

                {/* Grade badge */}
                {grade && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${gradeColor}`}>
                    <Award size={10} className="inline mr-1" />{grade}
                  </span>
                )}

                {/* Process status */}
                {processStatus && (
                  <div className="flex items-center gap-1.5">
                    {[['PV', processStatus.is_pv], ['D2', processStatus.is_d2], ['H2', processStatus.is_h2]].map(([l, v]) => (
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
                    <Award size={10} /> Grade
                  </button>
                  <ResetButton compact type="button" onClick={() => {
                    setValues(buildInitialValues()); setScanInput(''); setSource(null); setGrade(''); setGraded(false); setFailedParam(''); setProcessStatus(null);
                  }}>Reset</ResetButton>
                  <SubmitButton compact type="button" disabled={submitting || !graded || locked} onClick={() => handleSubmit(values)}>
                    {submitting ? 'Saving...' : 'Submit'}
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
      </div>
    </div>
  );
};

export default QCEntryScreen;
