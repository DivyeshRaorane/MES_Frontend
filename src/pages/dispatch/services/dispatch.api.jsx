import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get TC details by TC number ── */
export const getTCByNumber = async (tc_number) => {
  const res = await axios.get(`${API}/api/dispatch/tc/${tc_number}`, { headers: authHeaders() });
  return res.data;
};

/* ── Mark all bobbins in a TC as dispatched ── */
export const markTCAsDispatched = async (tc_id) => {
  const res = await axios.post(`${API}/api/dispatch/mark-dispatched`, { tc_id }, { headers: authHeaders() });
  return res.data;
};
