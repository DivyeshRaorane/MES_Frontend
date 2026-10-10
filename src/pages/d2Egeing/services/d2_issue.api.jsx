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
    url: `${API}/getd2chambers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Get QC Users ── */
export const getQCUsers = async () => {
  const response = await axios({
    method: "GET",
    url: `${API}/getqcusers`,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* ── Validate bobbin for D2 Issue ── */
export const validateBobbinForD2 = async (bobbin_no, restricted) => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2issue/validate/${bobbin_no}?restricted=${restricted}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Submit D2 Issue (insert d2_issue + update bobbin_entries) ──
   payload.d2_batch_id is the DRAFT id. Backend generates the FINAL batch id in
   the pattern "<chamberNo>-<YYYYMMDD>-NN" (next finished-batch sequence for that
   chamber+date), inserts the bobbins under it, deletes the draft rows, and
   returns the final id as response.data.d2_batch_id. */
export const submitD2Issue = async (payload) => {
  const response = await axios({
    method: "POST",
    url: `${API}/d2issue`,
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
    url: `${API}/d2issue/drafts`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Get draft details (all bobbins for a batch) ── */
export const getDraftDetails = async (d2_batch_id) => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2issue/drafts/${d2_batch_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Create a new draft batch (backend assigns the draft id) ──
   Called once when a chamber is selected. Backend generates a draft id in the
   pattern "<chamberNo>-<YYYYMMDD>-draftNN" (next sequence for that chamber+date)
   and returns it so the frontend can reuse it for every scan in the session.
   This only reserves the id — bobbins are added later via saveDraftBobbin.
   payload: { chamber, d2_type }
   response: { success, d2_batch_id } */
export const createDraft = async (payload) => {
  console.log("payload:", payload)
  const response = await axios({
    method: "POST",
    url: `${API}/d2issue/drafts/create`,
    data: payload,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Auto-save a scanned bobbin to draft ── */
export const saveDraftBobbin = async (payload) => {
  // payload: { d2_batch_id, bobbin_fid, bobbin_no, chamber, d2_type }
  // d2_batch_id is the draft id returned by createDraft.
  const response = await axios({
    method: "POST",
    url: `${API}/d2issue/drafts`,
    data: payload,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Remove a single bobbin from draft ── */
export const removeDraftBobbin = async (d2_batch_id, bobbin_no) => {
  const response = await axios({
    method: "DELETE",
    url: `${API}/d2issue/drafts/${d2_batch_id}/bobbin/${bobbin_no}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Delete entire draft after successful submission ── */
export const deleteDraft = async (d2_batch_id) => {
  const response = await axios({
    method: "DELETE",
    url: `${API}/d2issue/drafts/${d2_batch_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ══════════════════════════════════════════════════════════════
   D2 BATCHES APIs
   ══════════════════════════════════════════════════════════════ */

/* ── Get distinct D2 batches filtered by d2_end_date range ── */
export const getD2Batches = async (fromDate, toDate) => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2issue/batches?from=${fromDate}&to=${toDate}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ── Get bobbins for final grade export (no final_grade, is_d2=true, if h2 batch then is_h2_after=true) ── */
export const getD2BatchBobbinsForGrade = async (d2_batch_id) => {
  const response = await axios({
    method: "GET",
    url: `${API}/d2issue/batches/${d2_batch_id}/grade-export`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* ══════════════════════════════════════════════════════════════
   BULK FINAL GRADE APIs — removed (old /d2issue/final-grade/*
   endpoints). New Final Grade screen now calls /qcentry/final-grade
   and /qcentry/final-grade-bulk instead — see qc_entry.api.jsx.
   ══════════════════════════════════════════════════════════════ */
