import axios from "axios";

// VITE_API_URL already carries the "/api" prefix (same as the other services).
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/** Make sure every field the label reads exists, so template defaults never leak into a real label. */
const normalizeBox = (b = {}) => ({
  customer_name: b.customer_name ?? '',
  product:       b.product ?? '',
  box_no:        b.box_no ?? '',
  packing_order: b.packing_order ?? '',
  stack_no:      b.stack_no ?? '',
  bobbin_details: Array.isArray(b.bobbin_details)
    ? b.bobbin_details.map((x) => ({
        fid:    x?.fid ?? '',
        color:  x?.color ?? '',
        length: x?.length ?? 0, // already in metres
      }))
    : [],
});

/*
 * Fetch label data for one or more boxes.
 *
 *   POST {API}/box/labels
 *   body: { box_nos: number[] }
 *   resp: { status, message, data: Box[] }   (data is always an array)
 *
 * The backend reports the real outcome in the BODY `status` (200 / 400 / 404 / 500),
 * so `validateStatus` is relaxed: axios must NOT throw on non-2xx and drop the JSON body.
 * Only a true network failure (no response) rejects.
 *
 * @param {number[]} boxNos
 * @returns {Promise<{ status: number, message: string, data: object[] }>}
 */
export const fetchBoxLabels = async (boxNos) => {
  const res = await axios.post(
    `${API}/box/labels`,
    { box_nos: boxNos },
    { headers: authHeaders(), validateStatus: () => true }
  );

  const body = res.data && typeof res.data === 'object' ? res.data : {};
  return {
    status: Number(body.status ?? res.status),
    message: typeof body.message === 'string' ? body.message : '',
    data: Array.isArray(body.data) ? body.data.map(normalizeBox) : [],
  };
};
