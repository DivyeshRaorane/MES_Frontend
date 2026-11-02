import axios from "axios";

// VITE_API_URL already ends with /api, so `${API}/fiber/lock` hits POST /api/fiber/lock.
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Lock a preform / spool / bobbin (and its children).
 * POST /api/fiber/lock
 * payload: { lock_type: "preform" | "spool" | "bobbin", id: string, lock_reason: string }
 *
 * Success (200): { status, message, data: { lock_type, lock_reason, counts, preforms, spools, bobbins } }
 * Errors: { status, message, data: null } with 400 / 404 / 409 / 500.
 * 401 is handled by the global axios interceptor (logout + redirect to login).
 */
export const lockFiber = async ({ lock_type, id, lock_reason = "" }) => {
  const res = await axios.post(
    `${API}/fiber/lock`,
    { lock_type, id, lock_reason },
    { headers: authHeaders() }
  );
  return res.data;
};

/**
 * Unlock a preform / spool / bobbin (and its children).
 * POST /api/fiber/unlock
 * payload: { lock_type, id, unlock_reason } — send only the user's text; the backend
 * adds the "Unlock_reason- " prefix itself.
 */
export const unlockFiber = async ({ lock_type, id, unlock_reason = "" }) => {
  const res = await axios.post(
    `${API}/fiber/unlock`,
    { lock_type, id, unlock_reason },
    { headers: authHeaders() }
  );
  return res.data;
};

/** Text to show the user for an axios error from the endpoints above. */
export const getFiberLockErrorMessage = (e, fallback = "Something went wrong") => {
  const data = e?.response?.data;
  if (data?.message) return data.message;
  if (!e?.response) return "Unable to reach the server. Please check your connection.";
  return fallback;
};
