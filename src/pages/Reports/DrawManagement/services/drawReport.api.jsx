import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Dashboard Summary ── */
export const getDashboardSummary = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/dashboard?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Excel Export ── */
export const exportDrawReport = async (reportType, filters = {}) => {
  const params = new URLSearchParams({ ...filters, report: reportType }).toString();
  const res = await axios.get(`${API}/api/draw-reports/export?${params}`, {
    headers: authHeaders(),
    responseType: 'blob',
  });
  return res.data;
};

/* ── Preform Accept Report ── */
export const getPreformAcceptReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/preform-accept?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Handle Join Report ── */
export const getHandleJoinReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/handle-join?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Preform Allocation Report ── */
export const getPreformAllocReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/preform-allocation?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Draw Entry Report ── */
export const getDrawEntryReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/draw-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Flaw Report ── */
export const getFlawReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/flaw-report?${params}`, { headers: authHeaders() });
  return res.data;
};
