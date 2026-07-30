import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/** Get all packing orders for selection */
export const getPackingOrders = async () => {
  const res = await axios.get(`${API}/api/tc/packing-orders`, { headers: authHeaders() });
  return res.data;
};

/** Load TC data for a packing order (bobbins + QC data) */
export const loadTCData = async (orderNo) => {
  const res = await axios.get(`${API}/api/tc/load/${orderNo}`, { headers: authHeaders() });
  return res.data;
};

/** Save Test Certificate */
export const saveTC = async (payload) => {
  const res = await axios.post(`${API}/api/tc/save`, payload, { headers: authHeaders() });
  return res.data;
};

/** Get all saved TCs */
export const getAllTCs = async () => {
  const res = await axios.get(`${API}/api/tc`, { headers: authHeaders() });
  return res.data;
};

/** Get TC by ID (header + bobbins) */
export const getTCById = async (tcId) => {
  const res = await axios.get(`${API}/api/tc/${tcId}`, { headers: authHeaders() });
  return res.data;
};
