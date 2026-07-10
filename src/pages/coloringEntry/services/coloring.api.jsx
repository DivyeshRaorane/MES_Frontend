import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Scan bobbin — get fg_color + parent details + history ── */
export const scanBobbinForColoring = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/colouring/scan/${bobbin_no}`);
  return res.data;
};

/* ── Save colour entry ── */
export const saveColourEntry = async (payload) => {
  const res = await axios.post(`${API}/api/colouring`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Get PT Users (for operator dropdown) ── */
export const getPTUsers = async () => {
  const res = await axios.get(`${API}/api/getptusers`);
  return res.data;
};
