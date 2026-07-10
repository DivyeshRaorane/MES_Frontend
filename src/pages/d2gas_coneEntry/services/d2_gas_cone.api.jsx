import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ── Get D2 Chambers where is_active = false (currently in use) ── */
export const getD2ChambersInUse = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2gas/chambers-in-use`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get running batch for a chamber ── */
export const getRunningBatch = async (chamber_no) => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2gas/running-batch/${chamber_no}`,
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

/* ── Get Shifts ── */
export const getAllShifts = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/getshifts`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Submit D2 Gas Entry ── */
export const submitD2GasEntry = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios({
    method: "POST",
    url: `${API}/api/d2gas/entry`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
