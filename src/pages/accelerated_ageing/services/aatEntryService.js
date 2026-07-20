import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });
export const getAatEntries = async (filters = {}) => { const params = new URLSearchParams(filters).toString(); const res = await axios.get(`${API}/api/aat-entry?${params}`, { headers: authHeaders() }); return res.data; };
export const getAatEntryById = async (id) => { const res = await axios.get(`${API}/api/aat-entry/${id}`, { headers: authHeaders() }); return res.data; };
export const createAatEntry = async (payload) => { const res = await axios.post(`${API}/api/aat-entry`, payload, { headers: authHeaders() }); return res.data; };
export const updateAatEntry = async (id, payload) => { const res = await axios.put(`${API}/api/aat-entry/${id}`, payload, { headers: authHeaders() }); return res.data; };
