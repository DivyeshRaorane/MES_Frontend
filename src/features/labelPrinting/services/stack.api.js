import axios from "axios";

// VITE_API_URL already carries the "/api" prefix (same as the other services).
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/** Make sure every field the label reads exists, so template defaults never leak into a real label. */
const normalizeStack = (s = {}) => ({
  bobbin_no:     s.bobbin_no ?? '',
  packing_order: s.packing_order ?? '',
  customer_name: s.customer_name ?? '',
  cust_address:  s.cust_address ?? '',
});

/*
 * Fetch consignee address data for one or more bobbins.
 *
 *   POST {API}/stack/labels
 *   body: { bobbin_nos: string[] }
 *   resp: { status, message, data: [{ bobbin_no, packing_order, customer_name, cust_address }] }
 *
 * The backend reports the real outcome in the BODY `status` (200 / 400 / 404 / 500),
 * so `validateStatus` is relaxed: axios must NOT throw on non-2xx and drop the JSON body.
 * Only a true network failure (no response) rejects.
 *
 * @param {string[]} bobbinNos
 * @returns {Promise<{ status: number, message: string, data: object[] }>}
 */
export const fetchStackLabels = async (bobbinNos) => {
  const res = await axios.post(
    `${API}/stack/labels`,
    { bobbin_nos: bobbinNos },
    { headers: authHeaders(), validateStatus: () => true }
  );

  const body = res.data && typeof res.data === 'object' ? res.data : {};
  return {
    status: Number(body.status ?? res.status),
    message: typeof body.message === 'string' ? body.message : '',
    data: Array.isArray(body.data) ? body.data.map(normalizeStack) : [],
  };
};
