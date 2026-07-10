import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin info + existing HTHA entry + cycle data by barcode ── */
export const fetchHthaByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/htha-entry/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save or update HTHA entry + cycle rows ── */
export const saveHthaEntry = async (payload) => {
  const res = await axios.post(`${API}/api/htha-entry`, payload, { headers: authHeaders() });
  return res.data;
};
