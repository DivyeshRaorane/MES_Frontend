import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ── Get active D2 Chambers ── */
export const getD2Chambers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/getd2chambers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/getqcusers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Validate bobbin for D2 Issue ── */
export const validateBobbinForD2 = async (bobbin_no, restricted) => {
  const token = localStorage.getItem("token");
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2issue/validate/${bobbin_no}?restricted=${restricted}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/* ── Submit D2 Issue (insert d2_issue + update bobbin_entries) ── */
export const submitD2Issue = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios({
    method: "POST",
    url: `${API}/api/d2issue`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
