import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getPreformVendors = async () => {
  try {
    const response = await axios({
      method: import.meta.env.VITE_METHOD_GET,
      url: `${API}/api/getpreformvendor`,
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPreformVendor = async (data) => {
  try {
    const response = await axios.post(`${API}/api/createpreformvendor`, data, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePreformVendor = async (id, data) => {
  try {
    const response = await axios.put(`${API}/api/admin/preformvendor/${id}`, data, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
