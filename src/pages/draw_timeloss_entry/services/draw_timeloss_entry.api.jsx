import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Submit Draw TimeLoss Entry (exactly 4 towers) ── */
export const submitDrawTimeloss = async (payload) => {
  const res = await axios.post(`${API}/drawtimelossentry`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};
