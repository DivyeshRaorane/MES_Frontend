import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Submit Draw Shift Report (4 towers, each with 1+ preforms) ── */
export const submitDrawShiftReport = async (payload) => {
  const res = await axios.post(`${API}/drawshiftreport`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};
