import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get all users with departments ── */
export const getAllUsers = async () => {
  const res = await axios.get(`${API}/admin/users`, { headers: authHeaders() });
  return res.data;
};

/* ── Get all departments ── */
export const getDepartments = async () => {
  const res = await axios.get(`${API}/admin/departments`);
  return res.data;
};

/* ── Create user ── */
export const createUser = async (payload) => {
  const res = await axios.post(`${API}/admin/users`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update user ── */
export const updateUser = async (emp_id, payload) => {
  const res = await axios.put(`${API}/admin/users/${emp_id}`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Change user status (activate/deactivate) ── */
export const changeUserStatus = async (emp_id, is_active) => {
  const res = await axios.patch(`${API}/admin/users/${emp_id}/status`, { is_active }, { headers: authHeaders() });
  return res.data;
};
