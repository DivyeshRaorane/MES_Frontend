import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin info by barcode (bobbin_no) ── */
export const fetchBobbinByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/temp-entry/bobbin/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Check if temp_entry already exists for this bobbin_no ── */
export const checkExistingTempEntry = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/temp-entry/check/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save temp entry (create) ── */
export const saveTempEntry = async (payload) => {
  const res = await axios.post(`${API}/api/temp-entry`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update temp entry (existing record) ── */
export const updateTempEntry = async (id, payload) => {
  const res = await axios.put(`${API}/api/temp-entry/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
