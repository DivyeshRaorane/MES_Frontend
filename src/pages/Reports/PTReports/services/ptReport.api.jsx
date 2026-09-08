import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getPtAllocationReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/allocation?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getPtEntryReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getPtFlawsReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/flaws?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getFiberEntryReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/fiber-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getColoringReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/coloring?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getRewindingReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/pt-reports/rewinding?${params}`, { headers: authHeaders() });
  return res.data;
};

export const exportPtReport = async (reportType, filters = {}) => {
  const params = new URLSearchParams({ ...filters, report: reportType }).toString();
  const res = await axios.get(`${API}/pt-reports/export?${params}`, { headers: authHeaders(), responseType: 'blob' });
  return res.data;
};
