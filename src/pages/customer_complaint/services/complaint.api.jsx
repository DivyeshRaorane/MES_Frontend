import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get all complaints (with optional status filter) ── */
export const getComplaints = async (status) => {
  const params = status ? `?status=${status}` : '';
  const res = await axios.get(`${API}/complaints${params}`);
  return res.data;
};

/* ── Get single complaint by ID ── */
export const getComplaintById = async (complaint_id) => {
  const res = await axios.get(`${API}/complaints/${complaint_id}`);
  return res.data;
};

/* ── Raise new complaint ── */
export const raiseComplaint = async (payload) => {
  const res = await axios.post(`${API}/complaints`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update complaint (change status / add feedback) ── */
export const updateComplaint = async (complaint_id, payload) => {
  const res = await axios.put(`${API}/complaints/${complaint_id}`, payload, { headers: authHeaders() });
  return res.data;
};
