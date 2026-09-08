import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Fetch all bobbins that are pending a user decision.
 * Backend should return bobbins that have an inspection_lot and status = false
 * in the order_conf table, enriched with basic info from bobbin_entries
 * (optical_length, final_grade, product_type).
 *
 * Expected envelope: { success: boolean, data: [ { bobbin_no, inspection_lot, optical_length, final_grade, product_type } ], message? }
 */
export const getPendingUserDecisions = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(
    `${API}/user-decision/pending${params ? `?${params}` : ""}`,
    { headers: authHeaders() }
  );
  return res.data;
};

/**
 * Post a User Decision (UD) for one or many inspection lots.
 * Maps directly onto the backend endpoint POST /api/sap/inspection-lot/ud
 * which accepts a single object, a raw array, or a { lots: [...] } wrapper.
 *
 * @param {Array<{InspectionLot: string, UD_CODE: string, type?: string}>} lots
 * Returns the raw backend response so the caller can read summary.results / summary.errors
 * (bulk) or result (single).
 */
export const postUserDecisionUD = async (lots) => {
  const res = await axios.post(
    `${API}/sap/inspection-lot/ud`,
    lots,
    { headers: authHeaders() }
  );
  return res.data;
};
