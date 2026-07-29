import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Get all BOMs grouped by product material code
 */
export const getAllBOMs = async () => {
  const res = await axios.get(`${API}/api/admin/bom`, { headers: authHeaders() });
  return res.data;
};

/**
 * Get BOM details (all component rows) for a specific product material code
 */
export const getBOMByMaterialCode = async (materialCode) => {
  const res = await axios.get(`${API}/api/admin/bom/${materialCode}`, { headers: authHeaders() });
  return res.data;
};

/**
 * Create a new BOM (product + all component rows)
 * payload: { material_code, material_desc, components: [{ component_material_code, component_material_desc, consume_qty_per_km }] }
 */
export const createBOM = async (payload) => {
  const res = await axios.post(`${API}/api/admin/bom`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Update an existing BOM (replaces all component rows for the product)
 * payload: { material_code, material_desc, components: [{ component_material_code, component_material_desc, consume_qty_per_km }] }
 */
export const updateBOM = async (materialCode, payload) => {
  const res = await axios.put(`${API}/api/admin/bom/${materialCode}`, payload, { headers: authHeaders() });
  return res.data;
};

/**
 * Toggle BOM active/inactive status
 */
export const toggleBOMStatus = async (materialCode, isActive) => {
  const res = await axios.patch(`${API}/api/admin/bom/${materialCode}/status`, { is_active: isActive }, { headers: authHeaders() });
  return res.data;
};

/**
 * Fetch materials from material_master filtered by category
 * category: 'SEMI_FINISHED' | 'CONSUMABLE'
 */
export const getMaterialsByCategory = async (category) => {
  const res = await axios.get(`${API}/api/admin/materials?category=${category}`, { headers: authHeaders() });
  console.log("What is the materials:,", res)
  return res.data;
};
