import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── H2 Chambers (is_active=true for available chambers) ── */
export const getH2ChambersInUse = async () => {
  const res = await axios.get(`${API}/geth2chambers?is_active=true`, { headers: authHeaders() });
  return res.data;
};

/* ── Batches pending H2 issue (no chamber param needed) ── */
export const getBatchesForH2Issue = async () => {
  const res = await axios.get(`${API}/h2ageing/batches-for-issue`, { headers: authHeaders() });
  return res.data;
};

/* ── Validate bobbin for H2 Issue (d2_batch_id is optional filter) ── */
export const validateBobbinForH2 = async (bobbin_no, d2_batch_id) => {
  const params = d2_batch_id ? `?d2_batch_id=${d2_batch_id}` : '';
  const res = await axios.get(`${API}/h2ageing/validate-bobbin/${bobbin_no}${params}`);
  return res.data;
};

/* ── Submit H2 Issue ── */
export const submitH2Issue = async (payload) => {
  const res = await axios.post(`${API}/h2ageing/issue`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const res = await axios.get(`${API}/getqcusers`);
  return res.data;
};

/* ── Pending batches for Before Entry ── */
export const getPendingBeforeBatches = async () => {
  const res = await axios.get(`${API}/h2ageing/pending-before`);
  return res.data;
};

/* ── Pending batches for After Entry ── */
export const getPendingAfterBatches = async () => {
  const res = await axios.get(`${API}/h2ageing/pending-after`);
  return res.data;
};

/* ── Pending batches for 14 Days Entry ── */
export const getPending14DayBatches = async () => {
  const res = await axios.get(`${API}/h2ageing/pending-14day`);
  return res.data;
};

/* ── Get bobbins for a specific H2 batch ── */
export const getBobbinsForBatch = async (h2_batch_id) => {
  const res = await axios.get(`${API}/h2ageing/bobbins/${h2_batch_id}`);
  return res.data;
};

/* ── Save Before Entry ── */
export const saveBeforeEntry = async (payload) => {
  const res = await axios.put(`${API}/h2ageing/before-entry`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Save After Entry ── */
export const saveAfterEntry = async (payload) => {
  const res = await axios.put(`${API}/h2ageing/after-entry`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Save 14 Day Entry ── */
export const save14DayEntry = async (payload) => {
  const res = await axios.put(`${API}/h2ageing/14day-entry`, payload, { headers: authHeaders() });
  return res.data;
};
