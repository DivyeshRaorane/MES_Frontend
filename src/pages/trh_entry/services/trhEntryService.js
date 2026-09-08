import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getTrhEntries = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API}/trh-entry?${params}`, { headers: authHeaders() });
  return res.data;
};

export const getTrhEntryById = async (id) => {
  const res = await axios.get(`${API}/trh-entry/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createTrhEntry = async (payload) => {
  const res = await axios.post(`${API}/trh-entry`, payload, { headers: authHeaders() });
  return res.data;
};

export const updateTrhEntry = async (id, payload) => {
  const res = await axios.put(`${API}/trh-entry/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
