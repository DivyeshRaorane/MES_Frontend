import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Add stock (KG) to an existing preform.
 * POST /preform-stock-add
 * payload: { preform_id: string, adding_weight: number (> 0) }
 *
 * Success (200): { success: true, message, preform_id, adding_weight, is_active,
 *   mat_stock_updated, previous_qty, new_qty, previous_balance_qty, new_balance_qty,
 *   preform_data_updated, preform_accept_updated, is_handle_join, is_allocate,
 *   preform_draw, draw_entries_updated, is_last_reset }
 *
 * Errors: { success: false, message, error } (400 / 404 / 500) — the user-facing text
 * is in `error`. Auth errors are { message } with 401; the global axios interceptor
 * (utils/axiosInterceptor.js) already logs out and redirects to login on 401.
 *
 * NOTE: every successful call adds stock again, so the caller must not retry
 * automatically and must prevent double submit.
 */
export const addPreformStock = async (payload) => {
  const res = await axios.post(`${API}/preform-stock-add`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Pull the text to show the user out of an axios error from the endpoints above.
 * Prefers the backend `error` field, then `message`, then a generic fallback.
 */
export const getEntryServiceErrorMessage = (e, fallback = "Something went wrong") => {
  const data = e?.response?.data;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (!e?.response) return "Unable to reach the server. Please check your connection.";
  return fallback;
};
