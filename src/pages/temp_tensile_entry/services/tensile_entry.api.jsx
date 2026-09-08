import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch existing tensile entry by barcode (bobbin_no) ── */
export const fetchTensileByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/tensile-entry/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save or update tensile entry ── */
export const saveTensileEntry = async (payload) => {
  const res = await axios.post(`${API}/tensile-entry`, payload, { headers: authHeaders() });
  return res.data;
};
