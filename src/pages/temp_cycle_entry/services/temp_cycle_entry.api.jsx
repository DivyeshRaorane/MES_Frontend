import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch existing cycle entries by barcode (bobbin_no) ── */
export const fetchCycleByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/temp-cycle-entry/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save cycle entries (insert all 6 rows + update temp_entry) ── */
export const saveCycleEntry = async (payload) => {
  const res = await axios.post(`${API}/api/temp-cycle-entry`, payload, { headers: authHeaders() });
  return res.data;
};
