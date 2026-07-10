import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin info + existing TRH entry + cycle data by barcode ── */
export const fetchTrhByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/trh-entry/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save or update TRH entry + cycle rows ── */
export const saveTrhEntry = async (payload) => {
  const res = await axios.post(`${API}/api/trh-entry`, payload, { headers: authHeaders() });
  return res.data;
};
