import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getAllDrawFiberCutReason = async () => {
  try {
    const response = await axios({
      method: import.meta.env.VITE_METHOD_GET,
      url: `${API}/api/getalldrawfibercutreasons`,
      headers: {
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ── Get fiber cut reasons filtered by indication_id ── */
export const getFiberCutReasonsByIndication = async (indicationId) => {
  const response = await axios.get(
    `${API}/api/fiber-cut-reasons?indication_id=${indicationId}`,
    { headers: authHeaders() }
  );
  return response.data;
};
