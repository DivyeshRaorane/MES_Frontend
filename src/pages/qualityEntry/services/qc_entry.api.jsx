import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin QC data ── */
export const fetchBobbinQC = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/fetch/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Check bobbin in PT Entry (fallback when not in QC) ── */
export const checkBobbinInPtEntry = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/pt-check/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Grade bobbin ── */
export const gradeBobbin = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/grade/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Check process status ── */
export const checkProcessStatus = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/process-check/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Submit QC entry ── */
export const submitQCEntry = async (payload) => {
  const res = await axios.post(`${API}/qcentry/submit`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Submit final QC ──
   body: { bobbin_no }
   success: { success: true, message, grade }
   failure: { success: false, message } */
export const submitFinalQC = async (bobbin_no) => {
  const res = await axios.post(`${API}/qcentry/submit-final`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Submit final QC (bulk) ──
   body: { bobbin_nos: string[] }
   returns: { success, summary: { total, success, failed, error },
              results: [{ bobbin_no, status: 'SUCCESS'|'FAILED'|'ERROR', message, grade? }] } */
export const submitFinalQCBulk = async (bobbin_nos) => {
  const res = await axios.post(`${API}/qcentry/submit-final-bulk`, { bobbin_nos }, { headers: authHeaders() });
  return res.data;
};

/* ── Final Grade (promote temp_grade → final_grade) — single bobbin ──
   body: { bobbin_no }
   success: { success: true, bobbin_no, status: 'success', message, final_grade }
   failure (400): { success: false, bobbin_no, status: 'error', message }
   message may be: "Bobbin not found" | "First submit Grade on QC entry page" | "QC grading already done" */
export const submitFinalGrade = async (bobbin_no) => {
  const res = await axios.post(`${API}/qcentry/final-grade`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Final Grade (promote temp_grade → final_grade) — bulk ──
   body: { bobbin_nos: string[] }
   returns (always 200): { success, summary: { total, success, error },
     results: [{ bobbin_no, status: 'success'|'error', message, final_grade? }] } */
export const submitFinalGradeBulk = async (bobbin_nos) => {
  const res = await axios.post(`${API}/qcentry/final-grade-bulk`, { bobbin_nos }, { headers: authHeaders() });
  return res.data;
};

/* ── Update missing QC values ── */
export const updateMissingValues = async (payload) => {
  const res = await axios.post(`${API}/qc/update-missing-values`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Copy MBEnd data from previous sample + Calculate MAC value ── */
export const copyMbendAndCalcMac = async (bobbin_no) => {
  const res = await axios.post(`${API}/qcentry/mbend-copy`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Update MBend cycle after a sample bobbin fails/reworks in QC ── */
export const updateMbendCycleAfterFailedSample = async (bobbin_no) => {
  const res = await axios.post(`${API}/qcentry/mbend-reassign`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Submit flaw rewind instruction entry ── */
export const submitFlawRewind = async (payload) => {
  // payload: { bobbin_no, bobbin_fid, p1, p2, instruction }
  const res = await axios.post(`${API}/qcentry/flaw-rewind`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Colored bobbin QC check ── */
export const checkAndCopyColoredBobbinQC = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/colored-bobbin-qc/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── MFD / Cable Cutoff auto-calculation ── */
export const checkMfdCableCutoff = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcentry/mfd-cable-cutoff/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Bulk temp-grade: grade many bobbins in one request ──
   payload: { bobbin_nos: string[] }
   returns: { summary, results: [{ bobbin_no, status, matched_grade?, failed_parameter?, failure_details?, missing_parameters?, message? }] } */
export const gradeBobbinBulk = async (bobbin_nos) => {
  const res = await axios.post(`${API}/qcentry/grade-bulk`, { bobbin_nos }, { headers: authHeaders() });
  return res.data;
};

/* ── Pending temp-grade list (Automatic mode) ──
   Returns bobbins present in bobbin_entries AND qc_entry_temp with NO temp_grade yet.
   returns: { success, data: [{ bobbin_no, product_type?, matcode? }] } */
export const getPendingTempGrade = async () => {
  const res = await axios.get(`${API}/qcentry/pending-temp-grade`, { headers: authHeaders() });
  return res.data;
};

/* ── Pending final-submit list (Automatic Bulk Submit mode) ──
   Returns bobbins that are ready to be finalized: present in qc_entry_temp with a
   temp_grade set but no final_grade yet, AND not already present in qc_entry.
   returns: { success, data: [{ bobbin_no, temp_grade?, product_type?, matcode? }] } */
export const getPendingFinalSubmit = async () => {
  const res = await axios.get(`${API}/qcentry/pending-final-submit`, { headers: authHeaders() });
  return res.data;
};
