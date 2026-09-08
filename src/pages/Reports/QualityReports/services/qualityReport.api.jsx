import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getQualityEntryReport = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/quality-reports/quality-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const exportQualityReport = async (reportType, filters = {}) => {
  const params = new URLSearchParams({ ...filters, report: reportType }).toString();
  const res = await axios.get(`${API}/quality-reports/export?${params}`, { headers: authHeaders(), responseType: 'blob' });
  return res.data;
};
