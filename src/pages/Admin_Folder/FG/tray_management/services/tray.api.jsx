import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getAllTrays = async () => {
  const res = await axios.get(`${API}/admin/trays`);
  return res.data;
};

export const createTray = async (payload) => {
  const res = await axios.post(`${API}/admin/trays`, payload, { headers: authHeaders() });
  return res.data;
};

export const deactivateTray = async (tray_id) => {
  const res = await axios.put(`${API}/admin/trays/${tray_id}/deactivate`, {}, { headers: authHeaders() });
  return res.data;
};

export const getTrayPositions = async (tray_id) => {
  const res = await axios.get(`${API}/admin/trays/${tray_id}/positions`);
  return res.data;
};

export const addPositions = async (tray_id, count) => {
  const res = await axios.put(`${API}/admin/trays/${tray_id}/add-positions`, { count }, { headers: authHeaders() });
  return res.data;
};

export const removePositions = async (tray_id, count) => {
  const res = await axios.put(`${API}/admin/trays/${tray_id}/remove-positions`, { count }, { headers: authHeaders() });
  return res.data;
};

export const activateTray = async (tray_id) => {
  const res = await axios.put(`${API}/admin/trays/${tray_id}/activate`, {}, { headers: authHeaders() });
  return res.data;
};

export const updateTrayName = async (tray_id, tray_name) => {
  const res = await axios.put(`${API}/admin/trays/${tray_id}/update-name`, { tray_name }, { headers: authHeaders() });
  return res.data;
};
