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
