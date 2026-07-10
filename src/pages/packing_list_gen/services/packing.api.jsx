import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get order details by order_no ── */
export const getOrderByNo = async (order_no) => {
  const res = await axios.get(`${API}/api/packing/order/${order_no}`);
  return res.data;
};

/* ── Validate bobbin for packing ── */
export const validateBobbinForPacking = async (bobbin_no, order_no) => {
  const res = await axios.get(`${API}/api/packing/validate/${bobbin_no}?order_no=${order_no}`);
  return res.data;
};

/* ── Submit packing list ── */
export const submitPackingList = async (payload) => {
  const res = await axios.post(`${API}/api/packing/submit`, payload, { headers: authHeaders() });
  return res.data;
};
