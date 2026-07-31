import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin QC data ── */
export const fetchBobbinQC = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/fetch/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Check bobbin in PT Entry (fallback when not in QC) ── */
export const checkBobbinInPtEntry = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/pt-check/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Grade bobbin ── */
export const gradeBobbin = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/grade/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Check process status ── */
export const checkProcessStatus = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/process-check/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Submit QC entry ── */
export const submitQCEntry = async (payload) => {
  const res = await axios.post(`${API}/api/qcentry/submit`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update missing QC values ── */
export const updateMissingValues = async (payload) => {
  const res = await axios.post(`${API}/api/qc/update-missing-values`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Copy MBEnd data from previous sample + Calculate MAC value ── */
export const copyMbendAndCalcMac = async (bobbin_no) => {
  const res = await axios.post(`${API}/api/qcentry/mbend-copy`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Update MBend cycle after a sample bobbin fails/reworks in QC ── */
export const updateMbendCycleAfterFailedSample = async (bobbin_no) => {
  const res = await axios.post(`${API}/api/qcentry/mbend-reassign`, { bobbin_no }, { headers: authHeaders() });
  return res.data;
};
