import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getSpecList = async () => {
  const res = await axios.get(`${API}/api/spec`, { headers: authHeaders() });
  return res.data;
};

export const getSpecById = async (id) => {
  const res = await axios.get(`${API}/api/spec/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createSpec = async (payload) => {
  const res = await axios.post(`${API}/api/spec`, payload, { headers: authHeaders() });
  return res.data;
};

export const updateSpec = async (id, payload) => {
  const res = await axios.put(`${API}/api/spec/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

export const deactivateSpec = async (id) => {
  const res = await axios.patch(`${API}/api/spec/${id}/deactivate`, {}, { headers: authHeaders() });
  return res.data;
};

/* ── Get grade list for dropdown ── */
export const getGradeList = async () => {
  const res = await axios.get(`${API}/api/qcgrade/list`, { headers: authHeaders() });
  return res.data;
};

/* ── Get grade by ID to auto-fill values ── */
export const getGradeById = async (gradeId) => {
  const res = await axios.get(`${API}/api/qcgrade/${gradeId}`, { headers: authHeaders() });
  return res.data;
};

/* ── Get preform vendors for dropdown ── */
export const getPreformVendors = async () => {
  const res = await axios.get(`${API}/api/preform-vendor`, { headers: authHeaders() });
  return res.data;
};

/* ── Get bobbin colors for fiber color dropdown ── */
export const getBobbinColors = async () => {
  const res = await axios.get(`${API}/api/bobbin-color`, { headers: authHeaders() });
  return res.data;
};
