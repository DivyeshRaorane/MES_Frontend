import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Mail Send APIs ─────────────────────────────────────────

// Generic send mail
export const sendMail = async (payload) => {
  const res = await axios.post(`${API}/mail/send`, payload, { headers: authHeaders() });
  return res.data;
};

// Send via Gmail only
export const sendGmail = async (payload) => {
  const res = await axios.post(`${API}/mail/send-gmail`, payload, { headers: authHeaders() });
  return res.data;
};

// Send via Organization mail only
export const sendOrgMail = async (payload) => {
  const res = await axios.post(`${API}/mail/send-org`, payload, { headers: authHeaders() });
  return res.data;
};

// Send with template
export const sendTemplateMail = async (payload) => {
  const res = await axios.post(`${API}/mail/send-template`, payload, { headers: authHeaders() });
  return res.data;
};

// ─── Connection Verify ──────────────────────────────────────

// Verify mail connection for a provider ("gmail" or "org")
export const verifyMailConnection = async (provider) => {
  const res = await axios.get(`${API}/mail/verify/${provider}`, { headers: authHeaders() });
  return res.data;
};

// ─── Templates API ──────────────────────────────────────────

// Get all available templates with their variables
export const getMailTemplates = async () => {
  const res = await axios.get(`${API}/mail/templates`, { headers: authHeaders() });
  return res.data;
};

// Preview a template (server-side render) — optional
export const previewTemplate = async (payload) => {
  const res = await axios.post(`${API}/mail/preview-template`, payload, { headers: authHeaders() });
  return res.data;
};

// ─── Scheduled Mail APIs ────────────────────────────────────

// Schedule a new email
export const scheduleMailApi = async (payload) => {
  const res = await axios.post(`${API}/mail/schedule`, payload, { headers: authHeaders() });
  return res.data;
};

// Get all scheduled mails
export const getScheduledMails = async () => {
  const res = await axios.get(`${API}/mail/schedule`, { headers: authHeaders() });
  return res.data;
};

// Cancel a scheduled mail by ID
export const cancelScheduledMail = async (id) => {
  const res = await axios.put(`${API}/mail/schedule/${id}/cancel`, {}, { headers: authHeaders() });
  return res.data;
};

// Delete a scheduled mail by ID
export const deleteScheduledMail = async (id) => {
  const res = await axios.delete(`${API}/mail/schedule/${id}`, { headers: authHeaders() });
  return res.data;
};

// ─── Saved Drafts / Reusable Mail APIs ──────────────────────

// Save a mail as draft for later reuse
export const saveDraftMail = async (payload) => {
  const res = await axios.post(`${API}/mail/drafts`, payload, { headers: authHeaders() });
  return res.data;
};

// Get all saved drafts
export const getSavedDrafts = async () => {
  const res = await axios.get(`${API}/mail/drafts`, { headers: authHeaders() });
  return res.data;
};

// Update a saved draft
export const updateDraftMail = async (id, payload) => {
  const res = await axios.put(`${API}/mail/drafts/${id}`, payload, { headers: authHeaders() });
  return res.data;
};

// Delete a saved draft
export const deleteDraftMail = async (id) => {
  const res = await axios.delete(`${API}/mail/drafts/${id}`, { headers: authHeaders() });
  return res.data;
};
