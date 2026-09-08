import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── List all entries (with search, date filter, pagination) ── */
export const getTempEntries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/temp-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

/* ── Get single entry with cycle rows ── */
export const getTempEntryById = async (id) => {
  const res = await axios.get(`${API}/temp-entry/${id}`, { headers: authHeaders() });
  return res.data;
};

/* ── Create new entry (master + 6 cycle rows) ── */
export const createTempEntry = async (payload) => {
  const res = await axios.post(`${API}/temp-entry`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update entry (master + 6 cycle rows) ── */
export const updateTempEntry = async (id, payload) => {
  const res = await axios.put(`${API}/temp-entry/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
