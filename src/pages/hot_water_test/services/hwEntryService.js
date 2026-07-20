import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });
export const getHwEntries = async (filters = {}) => { const params = new URLSearchParams(filters).toString(); const res = await axios.get(`${API}/api/hot-water-entry?${params}`, { headers: authHeaders() }); return res.data; };
export const getHwEntryById = async (id) => { const res = await axios.get(`${API}/api/hot-water-entry/${id}`, { headers: authHeaders() }); return res.data; };
export const createHwEntry = async (payload) => { const res = await axios.post(`${API}/api/hot-water-entry`, payload, { headers: authHeaders() }); return res.data; };
export const updateHwEntry = async (id, payload) => { const res = await axios.put(`${API}/api/hot-water-entry/${id}`, payload, { headers: authHeaders() }); return res.data; };
