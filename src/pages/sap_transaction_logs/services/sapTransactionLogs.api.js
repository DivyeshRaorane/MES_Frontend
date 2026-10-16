import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Fetch SAP transaction logs.
 *
 * GET /api/saptransactionlogs (admin only, Bearer token).
 * Only non-empty filters are appended to the query string. Empty / undefined
 * fields are omitted entirely so they act as "no filter" on the server.
 *
 * @param {Object} filters
 * @param {string} [filters.prod_order]  exact match
 * @param {string} [filters.batch]       exact match
 * @param {string} [filters.status]      e.g. SUCCESS | FAILED
 * @param {string} [filters.operation]   e.g. FG_CONFIRMATION
 * @param {string} [filters.from_date]   ISO date/timestamp (created_at lower bound)
 * @param {string} [filters.to_date]     ISO date/timestamp (created_at upper bound)
 * @returns {Promise<{success:boolean,message:string,count:number,data:Array}>}
 */
export const getSapTransactionLogs = async (filters = {}) => {
  const params = {};
  const keys = ["prod_order", "batch", "status", "operation", "from_date", "to_date"];
  keys.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params[key] = String(value).trim();
    }
  });

  const response = await axios({
    method: import.meta.env.VITE_METHOD_GET,
    url: `${API}/saptransactionlogs`,
    headers: authHeaders(),
    params,
  });

  return response.data;
};
