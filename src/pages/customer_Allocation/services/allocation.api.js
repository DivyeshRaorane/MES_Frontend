import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Run Allocation Engine ── */
export const runAllocationEngine = async (spec_ids) => {
  const res = await axios.post(`${API}/allocation/run`, { spec_ids }, { headers: authHeaders() });
  return res.data;
};

/* ── Save Allocation (future) ── */
export const saveAllocation = async (payload) => {
  const res = await axios.post(`${API}/allocation/save`, payload, { headers: authHeaders() });
  return res.data;
};
