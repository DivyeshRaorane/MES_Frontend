import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });
export const getSplicingEntries = async (filters = {}) => { const params = new URLSearchParams(filters).toString(); const res = await axios.get(`${API}/splicing?${params}`, { headers: authHeaders() }); return res.data; };
export const getSplicingById = async (id) => { const res = await axios.get(`${API}/splicing/${id}`, { headers: authHeaders() }); return res.data; };
export const createSplicing = async (payload) => { const res = await axios.post(`${API}/splicing`, payload, { headers: authHeaders() }); return res.data; };
export const updateSplicing = async (id, payload) => { const res = await axios.put(`${API}/splicing/${id}`, payload, { headers: authHeaders() }); return res.data; };
