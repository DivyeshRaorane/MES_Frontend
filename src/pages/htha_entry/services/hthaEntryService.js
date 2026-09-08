import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getHthaEntries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/htha-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getHthaEntryById = async (id) => {
  const res = await axios.get(`${API}/htha-entry/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createHthaEntry = async (payload) => {
  const res = await axios.post(`${API}/htha-entry`, payload, { headers: authHeaders() });
  return res.data;
};

export const updateHthaEntry = async (id, payload) => {
  const res = await axios.put(`${API}/htha-entry/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
