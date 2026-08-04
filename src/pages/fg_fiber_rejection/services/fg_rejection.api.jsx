import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Validate bobbin for Color request ── */
export const validateBobbinForColor = async (bobbin_no, require_color) => {
  const res = await axios.get(`${API}/api/fg/color/validate/${bobbin_no}?require_color=${require_color}`);
  return res.data;
};

/* ── Submit Color request ── */
export const submitColorRequest = async (payload) => {
  const res = await axios.post(`${API}/api/fg/color/submit`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Validate bobbin for Rewinding ── */
export const validateBobbinForRewind = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/fg/rewind/validate/${bobbin_no}`);
  return res.data;
};

/* ── Submit Rewinding (whole or cut) ── */
export const submitRewindRequest = async (payload) => {
  const res = await axios.post(`${API}/api/fg/rewind/submit`, payload, { headers: authHeaders() });
  return res.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const res = await axios.get(`${API}/api/getqcusers`);
  return res.data;
};

/* ── Get Fiber Information (Bobbin + QC + Dispatch) ── */
export const getFiberInformation = async (searchValue, searchType = 'bobbin_no') => {
  const res = await axios.get(`${API}/api/fg/fiber-information`, {
    params: { search_value: searchValue, search_type: searchType },
    headers: authHeaders(),
  });
  return res.data;
};
