import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Get all config entries
 */
export const getAllConfigs = async () => {
  const res = await axios.get(`${API}/admin/mes-config`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new config entry
 */
export const createConfig = async (payload) => {
  const res = await axios.post(`${API}/admin/mes-config`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing config entry
 */
export const updateConfig = async (id, payload) => {
  const res = await axios.put(`${API}/admin/mes-config/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Toggle config enable/disable status
 */
export const toggleConfigStatus = async (id, disable) => {
  const res = await axios.patch(`${API}/admin/mes-config/${id}/status`, { disable }, { headers: authHeaders() });
  return res.data;
};
