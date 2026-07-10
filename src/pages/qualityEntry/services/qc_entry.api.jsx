import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin QC data ── */
export const fetchBobbinQC = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/fetch/${bobbin_no}`);
  return res.data;
};

/* ── Grade bobbin ── */
export const gradeBobbin = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/grade/${bobbin_no}`);
  return res.data;
};

/* ── Check process status ── */
export const checkProcessStatus = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcentry/process-check/${bobbin_no}`);
  return res.data;
};

/* ── Submit QC entry ── */
export const submitQCEntry = async (payload) => {
  const res = await axios.post(`${API}/api/qcentry/submit`, payload, { headers: authHeaders() });
  return res.data;
};
