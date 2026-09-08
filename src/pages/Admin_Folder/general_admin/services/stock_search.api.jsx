import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Query SAP Material Stock ── */
export const queryMaterialStock = async ({ Material, Plant, InventoryStockType }) => {
  const payload = {
    Material: (Material || "").trim(),
    Plant: (Plant || "").trim(),
  };

  // InventoryStockType is optional — only include it when the user selected a value
  if (InventoryStockType) {
    payload.InventoryStockType = InventoryStockType;
  }

  const res = await axios.post(`${API}/api/material-stock/query`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};
