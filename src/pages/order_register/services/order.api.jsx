import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get all orders ── */
export const getAllOrders = async () => {
  const res = await axios.get(`${API}/orders`);
  return res.data;
};

/* ── Create order ── */
export const createOrder = async (payload) => {
  const res = await axios.post(`${API}/orders`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Update order ── */
export const updateOrder = async (packing_order_id, payload) => {
  const res = await axios.put(`${API}/orders/${packing_order_id}`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Get customers (for dropdown) ── */
export const getCustomers = async () => {
  const res = await axios.get(`${API}/admin/customers`);
  return res.data;
};
