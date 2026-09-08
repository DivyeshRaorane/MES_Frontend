import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * List all col_material_code records.
 * @param {boolean} [isActive] - optional filter; when true/false, adds ?is_active=<value>
 * Response: { success, message?, data: [ { col_material_code_id, product, color, material_code, is_active } ] }
 */
export const getColMaterialCodes = async (isActive) => {
  const url =
    isActive === undefined || isActive === null
      ? `${API}/api/col-material-code`
      : `${API}/api/col-material-code?is_active=${isActive}`;
  const res = await axios.get(url, { headers: authHeaders() });
  return res.data;
};

/**
 * Get a single col_material_code record.
 * Response: { success, message?, data: { col_material_code_id, product, color, material_code, is_active } }
 */
export const getColMaterialCodeById = async (id) => {
  const res = await axios.get(`${API}/api/col-material-code/${id}`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new col_material_code record.
 * payload: { product, color, material_code, is_active }
 * Response: { success, message?, data }
 */
export const createColMaterialCode = async (payload) => {
  const res = await axios.post(`${API}/api/createcolmaterialcode`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing col_material_code record.
 * payload: { product, color, material_code, is_active }
 * Response: { success, message?, data }
 */
export const updateColMaterialCode = async (id, payload) => {
  const res = await axios.put(`${API}/api/admin/colmaterialcode/${id}`, payload, { headers: authHeaders() });
  return res.data;
};
