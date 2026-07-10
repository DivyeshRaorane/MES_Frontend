import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get pending break IDs (draw + pt) ── */
export const getPendingBreaks = async () => {
  const res = await axios.get(`${API}/api/break-analysis/pending`, { headers: authHeaders() });
  return res.data;
};

/* ── Get bobbin details by FID ── */
export const getBobbinByFid = async (fid) => {
  const res = await axios.get(`${API}/api/break-analysis/${fid}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save break analysis ── */
export const saveBreakAnalysis = async (payload) => {
  const res = await axios.post(`${API}/api/break-analysis`, payload, { headers: authHeaders() });
  return res.data;
};
