import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getAllTrays = async () => {
  const res = await axios.get(`${API}/api/admin/trays`);
  return res.data;
};

export const createTray = async (payload) => {
  const res = await axios.post(`${API}/api/admin/trays`, payload, { headers: authHeaders() });
  return res.data;
};

export const deactivateTray = async (tray_id) => {
  const res = await axios.put(`${API}/api/admin/trays/${tray_id}/deactivate`, {}, { headers: authHeaders() });
  return res.data;
};

export const getTrayPositions = async (tray_id) => {
  const res = await axios.get(`${API}/api/admin/trays/${tray_id}/positions`);
  return res.data;
};

export const addPositions = async (tray_id, count) => {
  const res = await axios.put(`${API}/api/admin/trays/${tray_id}/add-positions`, { count }, { headers: authHeaders() });
  return res.data;
};

export const removePositions = async (tray_id, count) => {
  const res = await axios.put(`${API}/api/admin/trays/${tray_id}/remove-positions`, { count }, { headers: authHeaders() });
  return res.data;
};
