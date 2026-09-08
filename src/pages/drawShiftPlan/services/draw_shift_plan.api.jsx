import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get shifts ── */
export const getShifts = async () => {
  const res = await axios.get(`${API}/getshifts`);
  return res.data;
};

/* ── Get draw users ── */
export const getDrawUsers = async () => {
  const res = await axios.get(`${API}/getdrawusers`);
  return res.data;
};

/* ── Submit shift plan (4 rows) ── */
export const submitShiftPlan = async (payload) => {
  const res = await axios.post(`${API}/drawshiftplan`, payload, { headers: authHeaders() });
  return res.data;
};
