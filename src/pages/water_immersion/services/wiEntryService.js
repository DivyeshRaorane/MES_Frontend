import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getWiEntries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/wi-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getWiEntryById = async (id) => {
  const res = await axios.get(`${API}/wi-entry/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createWiEntry = async (payload) => {
  const res = await axios.post(`${API}/wi-entry`, payload, { headers: authHeaders() });
  return res.data;
};

export const updateWiEntry = async (id, payload) => {
  const res = await axios.put(`${API}/wi-entry/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
