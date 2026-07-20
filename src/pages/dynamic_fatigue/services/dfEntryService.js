import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });
export const getDfEntries = async (filters = {}) => { const params = new URLSearchParams(filters).toString(); const res = await axios.get(`${API}/api/dynamic-fatigue?${params}`, { headers: authHeaders() }); return res.data; };
export const getDfEntryById = async (id) => { const res = await axios.get(`${API}/api/dynamic-fatigue/${id}`, { headers: authHeaders() }); return res.data; };
export const createDfEntry = async (payload) => { const res = await axios.post(`${API}/api/dynamic-fatigue`, payload, { headers: authHeaders() }); return res.data; };
export const updateDfEntry = async (id, payload) => { const res = await axios.put(`${API}/api/dynamic-fatigue/${id}`, payload, { headers: authHeaders() }); return res.data; };
