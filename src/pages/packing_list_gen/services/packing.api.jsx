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

/* ── Get all packing lists (history) ── */
export const getAllPackingLists = async () => {
  const res = await axios.get(`${API}/api/packing/list`, { headers: authHeaders() });
  return res.data;
};

/* ── View packing list detail (header + bobbins) ── */
export const viewPackingList = async (orderNo) => {
  const res = await axios.get(`${API}/api/packing/view/${orderNo}`, { headers: authHeaders() });
  return res.data;
};

/* ── Remove bobbin from packing list ── */
export const removeBobbinFromPacking = async (packingOrderBobbinId) => {
  const res = await axios.delete(`${API}/api/packing/bobbin/${packingOrderBobbinId}`, { headers: authHeaders() });
  return res.data;
};

/* ── Remove entire box from packing list ── */
export const removeBoxFromPacking = async (orderNo, stackNo, boxNo) => {
  const res = await axios.delete(`${API}/api/packing/box/${orderNo}/${stackNo}/${boxNo}`, { headers: authHeaders() });
  return res.data;
};

/* ── Add bobbin to existing packing list ── */
export const addBobbinToPacking = async (payload) => {
  const res = await axios.post(`${API}/api/packing/add-bobbin`, payload, { headers: authHeaders() });
  return res.data;
};
