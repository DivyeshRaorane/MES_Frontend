import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get all active fiber cut indications ── */
export const getAllFiberCutIndications = async () => {
  const response = await axios.get(`${API}/api/fiber-cut-indication`, {
    headers: authHeaders(),
  });
  return response.data;
};

/* ── Get fiber cut indication by ID ── */
export const getFiberCutIndicationById = async (id) => {
  const response = await axios.get(`${API}/api/fiber-cut-indication/${id}`, {
    headers: authHeaders(),
  });
  return response.data;
};

/* ── Create fiber cut indication ── */
export const createFiberCutIndication = async (data) => {
  const response = await axios.post(`${API}/api/fiber-cut-indication`, data, {
    headers: authHeaders(),
  });
  return response.data;
};

/* ── Update fiber cut indication ── */
export const updateFiberCutIndication = async (id, data) => {
  const response = await axios.put(`${API}/api/fiber-cut-indication/${id}`, data, {
    headers: authHeaders(),
  });
  return response.data;
};

/* ── Disable/Enable fiber cut indication ── */
export const toggleFiberCutIndication = async (id, data) => {
  const response = await axios.put(`${API}/api/fiber-cut-indication/${id}`, data, {
    headers: authHeaders(),
  });
  return response.data;
};
