/**
 * Function Reports API Service
 * 
 * This module ONLY manages report registrations (metadata) that point to
 * existing PostgreSQL functions. It does NOT create, alter, or drop functions.
 * 
 * The only DB-level read is fetching function metadata from pg_proc/information_schema.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Database Function Discovery (READ-ONLY) ────────────────────────────────

/** Fetch list of existing PostgreSQL functions from database metadata */
export const fetchAvailableFunctions = async () => {
  const res = await axios.get(`${API_URL}/function-reports/available-functions`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Fetch parameters of a specific function (from pg_proc metadata) */
export const fetchFunctionParameters = async (schemaName, functionName) => {
  const res = await axios.get(
    `${API_URL}/function-reports/function-params/${schemaName}/${functionName}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ─── Function Report Registration CRUD ──────────────────────────────────────

/** Get all registered function reports (admin) */
export const fetchAllFunctionReports = async () => {
  const res = await axios.get(`${API_URL}/function-reports`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get a single registered function report by ID */
export const fetchFunctionReportById = async (reportId) => {
  const res = await axios.get(`${API_URL}/function-reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Register a new function report (create report configuration pointing to an existing function) */
export const createFunctionReport = async (reportData) => {
  const res = await axios.post(`${API_URL}/function-reports`, reportData, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update a registered function report */
export const updateFunctionReport = async (reportId, reportData) => {
  const res = await axios.put(`${API_URL}/function-reports/${reportId}`, reportData, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Toggle active/disable status of a registered function report */
export const toggleFunctionReportStatus = async (reportId) => {
  const res = await axios.patch(`${API_URL}/function-reports/${reportId}/toggle-status`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Delete a registered function report (soft delete) */
export const deleteFunctionReport = async (reportId) => {
  const res = await axios.delete(`${API_URL}/function-reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Function Report Execution (User Side) ──────────────────────────────────

/** Get function reports accessible by current user, optionally filtered by section */
export const fetchUserFunctionReports = async (section) => {
  const res = await axios.get(`${API_URL}/function-reports/user/reports`, {
    headers: getAuthHeaders(),
    params: section ? { section } : {},
  });
  return res.data;
};

/** Execute a registered function report with user-provided parameters */
export const executeFunctionReport = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/function-reports/${reportId}/execute`,
    { params },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ─── Export ─────────────────────────────────────────────────────────────────

/** Export function report result as Excel */
export const exportFunctionReportExcel = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/function-reports/${reportId}/export/excel`,
    { params },
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

/** Export function report result as CSV */
export const exportFunctionReportCSV = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/function-reports/${reportId}/export/csv`,
    { params },
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

// ─── Sections ───────────────────────────────────────────────────────────────

/** Get available sections for function report assignment */
export const fetchFunctionReportSections = async () => {
  const res = await axios.get(`${API_URL}/function-reports/sections`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get section mappings for a specific function report */
export const fetchFunctionReportSectionMappings = async (reportId) => {
  const res = await axios.get(`${API_URL}/function-reports/${reportId}/sections`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update section mappings for a function report */
export const updateFunctionReportSectionMappings = async (reportId, sectionIds) => {
  const res = await axios.put(
    `${API_URL}/function-reports/${reportId}/sections`,
    { section_ids: sectionIds },
    { headers: getAuthHeaders() }
  );
  return res.data;
};
