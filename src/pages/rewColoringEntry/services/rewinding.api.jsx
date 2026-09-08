import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Scan bobbin for rewinding ── */
export const scanBobbinForRewinding = async (bobbin_no) => {
  const res = await axios.get(`${API}/rewinding/scan/${bobbin_no}`);
  return res.data;
};

/* ── Save rewinding entry ── */
export const saveRewindingEntry = async (payload) => {
  const res = await axios.post(`${API}/rewinding`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Get PT Users ── */
export const getPTUsers = async () => {
  const res = await axios.get(`${API}/getptusers`);
  return res.data;
};

/* ── Get Rewinding Machines (active) ── */
export const getRewMachines = async () => {
  const res = await axios.get(`${API}/admin/rewmachines`);
  return res.data;
};
