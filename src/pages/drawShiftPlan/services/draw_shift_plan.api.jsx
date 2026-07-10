import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get shifts ── */
export const getShifts = async () => {
  const res = await axios.get(`${API}/api/getshifts`);
  return res.data;
};

/* ── Get draw users ── */
export const getDrawUsers = async () => {
  const res = await axios.get(`${API}/api/getdrawusers`);
  return res.data;
};

/* ── Submit shift plan (4 rows) ── */
export const submitShiftPlan = async (payload) => {
  const res = await axios.post(`${API}/api/drawshiftplan`, payload, { headers: authHeaders() });
  return res.data;
};
