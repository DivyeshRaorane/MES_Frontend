import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ── Validate bobbin for QC Out ── */
export const validateBobbinForQCOut = async (bobbin_no) => {
  const res = await axios.get(`${API}/api/qcout/validate/${bobbin_no}`);
  return res.data;
};

/* ── Submit QC Out ── */
export const submitQCOut = async (payload) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/api/qcout/submit`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
