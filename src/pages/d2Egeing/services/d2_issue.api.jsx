import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Get active D2 Chambers ── */
export const getD2Chambers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/getd2chambers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/getqcusers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Validate bobbin for D2 Issue ── */
export const validateBobbinForD2 = async (bobbin_no, restricted) => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2issue/validate/${bobbin_no}?restricted=${restricted}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Submit D2 Issue (insert d2_issue + update bobbin_entries) ── */
export const submitD2Issue = async (payload) => {
  const response = await axios({
    method: "POST",
    url: `${API}/api/d2issue`,
    data: payload,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ══════════════════════════════════════════════════════════════
   DRAFT APIs
   ══════════════════════════════════════════════════════════════ */

/* ── Get all active draft batches ── */
export const getDraftList = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2issue/drafts`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Get draft details (all bobbins for a batch) ── */
export const getDraftDetails = async (d2_batch_id) => {
  const response = await axios({
    method: "GET",
    url: `${API}/api/d2issue/drafts/${d2_batch_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Auto-save a scanned bobbin to draft ── */
export const saveDraftBobbin = async (payload) => {
  // payload: { d2_batch_id, bobbin_fid, bobbin_no, chamber, d2_type }
  const response = await axios({
    method: "POST",
    url: `${API}/api/d2issue/drafts`,
    data: payload,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Remove a single bobbin from draft ── */
export const removeDraftBobbin = async (d2_batch_id, bobbin_no) => {
  const response = await axios({
    method: "DELETE",
    url: `${API}/api/d2issue/drafts/${d2_batch_id}/bobbin/${bobbin_no}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Delete entire draft after successful submission ── */
export const deleteDraft = async (d2_batch_id) => {
  const response = await axios({
    method: "DELETE",
    url: `${API}/api/d2issue/drafts/${d2_batch_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};
