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

/* ── Production Summary (daily) ── */
export const getProductionSummary = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/production-summary?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Preform Wise Report ── */
export const getPreformReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/preform-report?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Spool Wise Report ── */
export const getSpoolReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/spool-report?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Flaw Report ── */
export const getFlawReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/flaw-report?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Break Analysis Report ── */
export const getBreakReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/break-report?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Tower Performance ── */
export const getTowerPerformance = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/tower-performance?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Shift Performance ── */
export const getShiftPerformance = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/shift-performance?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Operator Performance ── */
export const getOperatorPerformance = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/operator-performance?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Traceability ── */
export const getTraceability = async (searchId) => {
  const res = await axios.get(`${API}/api/draw-reports/traceability/${searchId}`, { headers: authHeaders() });
  return res.data;
};

/* ── Draw Parameters ── */
export const getDrawParameters = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/draw-parameters?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Scrap Analysis ── */
export const getScrapAnalysis = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/api/draw-reports/scrap-analysis?${params}`, { headers: authHeaders() });
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
