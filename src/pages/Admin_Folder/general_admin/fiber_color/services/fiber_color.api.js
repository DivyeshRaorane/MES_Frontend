import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * List all fiber_color records.
 * @param {boolean} [isActive] - optional filter; when true/false, adds ?is_active=<value>
 * Response: { success, message?, data: [ { fiber_color_id, color, is_active, created_at } ] }
 */
export const getFiberColors = async (isActive) => {
  const url =
    isActive === undefined || isActive === null
      ? `${API}/getfibercolor`
      : `${API}/getfibercolor?is_active=${isActive}`;
  const res = await axios.get(url, { headers: authHeaders() });
  return res.data;
};

/**
 * Get a single fiber_color record.
 * Response: { success, message?, data: { fiber_color_id, color, is_active, created_at } }
 */
export const getFiberColorById = async (id) => {
  const res = await axios.get(`${API}/fiber-color/${id}`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new fiber_color record.
 * payload: { color }
 * Response: { success, message?, data }
 */
export const createFiberColor = async (payload) => {
  const res = await axios.post(`${API}/createfibercolor`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing fiber_color record.
 * payload: { color, is_active }
 * Response: { success, message?, data }
 */
export const updateFiberColor = async (id, payload) => {
  const res = await axios.put(`${API}/admin/fibercolors/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
