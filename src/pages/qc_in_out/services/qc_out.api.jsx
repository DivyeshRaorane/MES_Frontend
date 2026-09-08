import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ── Validate bobbin for QC Out ── */
export const validateBobbinForQCOut = async (bobbin_no) => {
  const res = await axios.get(`${API}/qcout/validate/${bobbin_no}`);
  return res.data;
};

/* ── Submit QC Out ── */
export const submitQCOut = async (payload) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/qcout/submit`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

/* ── Bulk validate bobbins for QC Out (Excel import) ── */
export const bulkValidateQCOut = async (bobbins) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/qcout/bulk-validate`, { bobbins }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

/* ── Bulk submit QC Out (for validated bobbins) ── */
export const bulkSubmitQCOut = async (payload) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API}/qcout/bulk-submit`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

/* ── Get Pending QC Out bobbins ── */
export const getPendingQCOut = async (fromDate, toDate) => {
  const params = {};
  if (fromDate) params.from_date = fromDate;
  if (toDate) params.to_date = toDate;
  const res = await axios.get(`${API}/qcout/pending`, { params });
  return res.data;
};
