import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get all active trays ── */
export const getTrays = async () => {
  const res = await axios.get(`${API}/api/modula/trays`);
  return res.data;
};

/* ── Get positions for a tray ── */
export const getTrayPositions = async (tray_id) => {
  const res = await axios.get(`${API}/api/modula/trays/${tray_id}/positions`);
  return res.data;
};

/* ── Assign bobbin to a position ── */
export const assignBobbin = async (tray_id, position_no, bobbin_no) => {
  const res = await axios.put(`${API}/api/modula/assign`, { tray_id, position_no, bobbin_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Remove bobbin from a position ── */
export const removeBobbin = async (tray_id, position_no) => {
  const res = await axios.put(`${API}/api/modula/remove`, { tray_id, position_no }, { headers: authHeaders() });
  return res.data;
};

/* ── Search bobbin across all trays ── */
export const searchBobbin = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/modula/search/${bobbin_no}`);
  return res.data;
};
