import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ── Get D2 Chambers where is_active = false (currently in use) ── */
export const getD2ChambersInUse = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2receiving/chambers-in-use`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get running batch for a chamber (returns batch_id, start_date, start_time, total_bobbins) ── */
export const getRunningBatchForReceiving = async (chamber_no) => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2receiving/running-batch/${chamber_no}`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/getqcusers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Complete D2 Receiving (update d2_issue + bobbin_entries) ── */
export const completeD2Receiving = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios({
    method: "PUT",
    url: `${API}/d2receiving/complete`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
