import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Get all process orders
 */
export const getAllProcessOrders = async () => {
  const res = await axios.get(`${API}/api/admin/process-orders`, { headers: authHeaders() });
  return res.data;
};

/**
 * Get a single process order by process_o_no
 */
export const getProcessOrderByNo = async (processONo) => {
  const res = await axios.get(`${API}/api/admin/process-orders/${processONo}`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new process order
 * payload: { process_o_no, material_code, process_qty, balance_qty, is_active }
 */
export const createProcessOrder = async (payload) => {
  const res = await axios.post(`${API}/api/admin/process-orders`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing process order
 */
export const updateProcessOrder = async (processONo, payload) => {
  const res = await axios.put(`${API}/api/admin/process-orders/${processONo}`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Toggle process order active/inactive status
 */
export const toggleProcessOrderStatus = async (processONo, isActive) => {
  const res = await axios.patch(`${API}/api/admin/process-orders/${processONo}/status`, { is_active: isActive }, { headers: authHeaders() });
  return res.data;
};
