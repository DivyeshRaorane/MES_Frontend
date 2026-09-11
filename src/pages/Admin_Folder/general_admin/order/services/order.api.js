import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Get all orders (header rows). One row per order_no.
 * Response shape expected: { success, data: [ { order_no, material_code, order_qty, uom,
 *   gr_qty, order_status, order_creation_date, updated_at, total_components, total_operations } ] }
 */
export const getAllOrders = async () => {
  const res = await axios.get(`${API}/admin/orders`, { headers: authHeaders() });
  return res.data;
};

/**
 * Get a single order with all related rows.
 * Response shape expected: { success, data: {
 *   header:      { order_no, material_code, order_qty, uom, gr_qty, order_status, order_creation_date, updated_at },
 *   components:  [ { order_comp_id, order_no, material_code, mat_desc, qty, uom, movement_type } ],
 *   operations:  [ { order_opr_id, order_no, operation_no, workcenter, operation_qty, activity_1..activity_6 } ],
 *   confirmations:[ { order_conf_id, order_no, confrmation_no, confirmation_counter, cancelling_flag,
 *                    operation_no, confirmed_qty, gr_document, inspection_lot } ]
 * } }
 */
export const getOrderByNo = async (orderNo) => {
  const res = await axios.get(`${API}/admin/orders/${orderNo}`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new order (header + components + operations).
 * payload: {
 *   header:     { order_no, material_code, order_qty, uom, gr_qty, order_status, order_creation_date },
 *   components: [ { material_code, mat_desc, qty, uom, movement_type } ],
 *   operations: [ { operation_no, workcenter, operation_qty, activity_1..activity_6 } ]
 * }
 */
export const createOrder = async (payload) => {
  const res = await axios.post(`${API}/admin/orders`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing order (header + replace components + operations).
 * order_conf is NOT editable and is ignored on update.
 * payload: same shape as createOrder.
 */
export const updateOrder = async (orderNo, payload) => {
  const res = await axios.put(`${API}/admin/orders/${orderNo}`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Sync process orders from SAP.
 * @param {string} [date] - optional, in "DD-MM-YYYY" or "YYYY-MM-DD".
 *   Provide a date to sync only orders created on that date.
 *   Omit it (or pass empty) to full-sync ALL process orders from SAP.
 *   NOTE: full-sync can return a large payload and take noticeably longer.
 * Existing orders are UPDATED (header refreshed, components/operations re-synced),
 * not skipped.
 * Response: { success, message, summary: {
 *   date,                       // "ALL" when no date was provided, else "YYYY-MM-DD"
 *   fetched, inserted, updated,
 *   skipped_no_order_no, skipped_duplicate_in_batch, failed,
 *   inserted_order_nos, updated_order_nos, failed_order_nos,
 *   details: [ { order_no, status, reason, message } ]
 *   // status ∈ "inserted" | "updated" | "skipped" | "failed"
 * } }
 */
export const syncProcessOrders = async (date) => {
  const body = date ? { date } : {};
  const res = await axios.post(`${API}/process-order/sync`, body, { headers: authHeaders() });
  return res.data;
};

/**
 * Fetch materials from material_master (optionally filtered by category).
 * Used to populate material_code dropdowns for header & components.
 */
export const getMaterials = async (category) => {
  const url = category
    ? `${API}/admin/materials?category=${category}`
    : `${API}/admin/materials`;
  const res = await axios.get(url, { headers: authHeaders() });
  return res.data;
};
