import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Fetch bobbin info + existing AAT entry + day rows ── */
export const fetchAatByBarcode = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/accelerated-ageing/${bobbin_no}`, { headers: authHeaders() });
  return res.data;
};

/* ── Save or update AAT entry + day rows ── */
export const saveAatEntry = async (payload) => {
  const res = await axios.post(`${API}/api/accelerated-ageing`, payload, { headers: authHeaders() });
  return res.data;
};
