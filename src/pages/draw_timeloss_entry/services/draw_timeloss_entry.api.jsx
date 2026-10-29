import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get draw users (operators / shift incharge) ── */
export const getDrawUsers = async () => {
  const res = await axios.get(`${API}/getdrawusers`, { headers: authHeaders() });
  return res.data;
};

/* ── Submit Draw TimeLoss Entry (exactly 4 towers) ── */
export const submitDrawTimeloss = async (payload) => {
  const res = await axios.post(`${API}/drawtimelossentry`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};
