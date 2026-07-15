import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getSpecList = async () => {
  const res = await axios.get(`${API}/api/spec`, { headers: authHeaders() });
  return res.data;
};

export const getSpecById = async (id) => {
  const res = await axios.get(`${API}/api/spec/${id}`, { headers: authHeaders() });
  return res.data;
};

export const createSpec = async (payload) => {
  const res = await axios.post(`${API}/api/spec`, payload, { headers: authHeaders() });
  return res.data;
};

export const updateSpec = async (id, payload) => {
  const res = await axios.put(`${API}/api/spec/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

export const deactivateSpec = async (id) => {
  const res = await axios.patch(`${API}/api/spec/${id}/deactivate`, {}, { headers: authHeaders() });
  return res.data;
};
