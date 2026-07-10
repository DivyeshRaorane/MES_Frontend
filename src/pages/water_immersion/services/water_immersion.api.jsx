import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin info + existing water immersion entry + day rows ── */
export const fetchWiByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/water-immersion/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save or update water immersion entry + day rows ── */
export const saveWiEntry = async (payload) => {
  const res = await axios.post(`${API}/api/water-immersion`, payload, { headers: authHeaders() });
  return res.data;
};
