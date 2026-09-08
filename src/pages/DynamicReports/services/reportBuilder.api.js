/**
 * Report Builder API Service
 * Handles all API calls for report metadata CRUD operations,
 * database discovery, report execution, and exports.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ─── Database Discovery ─────────────────────────────────────────────────────

/** Fetch all available PostgreSQL tables */
export const fetchTables = async () => {
  const res = await axios.get(`${API_URL}/report-builder/tables`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Fetch columns for a specific table */
export const fetchTableColumns = async (tableName) => {
  const res = await axios.get(`${API_URL}/report-builder/tables/${tableName}/columns`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Fetch foreign key relationships for a table */
export const fetchTableRelationships = async (tableName) => {
  const res = await axios.get(`${API_URL}/report-builder/tables/${tableName}/relationships`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Report CRUD ────────────────────────────────────────────────────────────

/** Get all reports (admin view) */
export const fetchAllReports = async () => {
  const res = await axios.get(`${API_URL}/report-builder/reports`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get a single report by ID */
export const fetchReportById = async (reportId) => {
  const res = await axios.get(`${API_URL}/report-builder/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Create a new report */
export const createReport = async (reportData) => {
  const res = await axios.post(`${API_URL}/report-builder/reports`, reportData, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update an existing report */
export const updateReport = async (reportId, reportData) => {
  const res = await axios.put(`${API_URL}/report-builder/reports/${reportId}`, reportData, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Soft-delete a report */
export const deleteReport = async (reportId) => {
  const res = await axios.delete(`${API_URL}/report-builder/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Duplicate a report */
export const duplicateReport = async (reportId) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/${reportId}/duplicate`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Report Execution ───────────────────────────────────────────────────────

/** Preview report (first 100 rows) */
export const previewReport = async (reportConfig) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/preview`, reportConfig, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Execute report with filters and pagination */
export const executeReport = async (reportId, params) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/${reportId}/execute`, params, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get generated SQL for a report (developer mode) */
export const getReportSQL = async (reportConfig) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/sql`, reportConfig, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Dynamic Reports (User Side) ───────────────────────────────────────────

/** Get reports accessible by current user */
export const fetchUserReports = async () => {
  const res = await axios.get(`${API_URL}/dynamic-reports`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Execute a report from user side */
export const executeUserReport = async (reportId, params) => {
  const res = await axios.post(`${API_URL}/dynamic-reports/${reportId}/execute`, params, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Export ─────────────────────────────────────────────────────────────────

/** Export report as Excel */
export const exportReportExcel = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/export/excel`,
    params,
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

/** Export report as CSV */
export const exportReportCSV = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/export/csv`,
    params,
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

/** Export report as PDF */
export const exportReportPDF = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/export/pdf`,
    params,
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

// ─── Permissions ────────────────────────────────────────────────────────────

/** Get permissions for a report */
export const fetchReportPermissions = async (reportId) => {
  const res = await axios.get(`${API_URL}/report-builder/reports/${reportId}/permissions`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update permissions for a report */
export const updateReportPermissions = async (reportId, permissions) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/permissions`,
    permissions,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Get all roles */
export const fetchRoles = async () => {
  const res = await axios.get(`${API_URL}/report-builder/roles`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get all users (for permission assignment) */
export const fetchUsersForPermission = async () => {
  const res = await axios.get(`${API_URL}/report-builder/users`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Multi-Sheet Report CRUD ────────────────────────────────────────────────

/** Create a multi-sheet report (uses same endpoint, backend detects is_multi_sheet) */
export const createMultiSheetReport = async (reportData) => {
  const res = await axios.post(`${API_URL}/report-builder/reports`, { ...reportData, is_multi_sheet: true }, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update a multi-sheet report (uses same endpoint, backend detects is_multi_sheet) */
export const updateMultiSheetReport = async (reportId, reportData) => {
  const res = await axios.put(`${API_URL}/report-builder/reports/${reportId}`, { ...reportData, is_multi_sheet: true }, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get full multi-sheet report structure (sheets + tables) - uses same endpoint */
export const fetchMultiSheetReport = async (reportId) => {
  const res = await axios.get(`${API_URL}/report-builder/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Report Sheets CRUD ─────────────────────────────────────────────────────

/** Get all sheets for a report */
export const fetchReportSheets = async (reportId) => {
  const res = await axios.get(`${API_URL}/report-builder/reports/${reportId}/sheets`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Create a sheet in a report */
export const createReportSheet = async (reportId, sheetData) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/${reportId}/sheets`, sheetData, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update a sheet */
export const updateReportSheet = async (reportId, sheetId, sheetData) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}`,
    sheetData,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Delete a sheet */
export const deleteReportSheet = async (reportId, sheetId) => {
  const res = await axios.delete(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Reorder sheets */
export const reorderReportSheets = async (reportId, sheetOrder) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/sheets/reorder`,
    { sheetOrder },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ─── Report Tables CRUD (within a sheet) ────────────────────────────────────

/** Get all tables for a sheet */
export const fetchSheetTables = async (reportId, sheetId) => {
  const res = await axios.get(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Create a table in a sheet */
export const createSheetTable = async (reportId, sheetId, tableData) => {
  const res = await axios.post(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables`,
    tableData,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Update a table */
export const updateSheetTable = async (reportId, sheetId, tableId, tableData) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables/${tableId}`,
    tableData,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Delete a table */
export const deleteSheetTable = async (reportId, sheetId, tableId) => {
  const res = await axios.delete(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables/${tableId}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Duplicate a table within the same sheet */
export const duplicateSheetTable = async (reportId, sheetId, tableId) => {
  const res = await axios.post(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables/${tableId}/duplicate`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Reorder tables within a sheet */
export const reorderSheetTables = async (reportId, sheetId, tableOrder) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/sheets/${sheetId}/tables/reorder`,
    { tableOrder },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Preview a single table's query */
export const previewTableQuery = async (tableConfig) => {
  const res = await axios.post(`${API_URL}/report-builder/reports/preview-table`, tableConfig, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ─── Multi-Sheet Report Execution ───────────────────────────────────────────

/** Execute a multi-sheet report (uses same execute endpoint - backend detects is_multi_sheet) */
export const executeMultiSheetReport = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/execute`,
    params,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Export multi-sheet report as Excel workbook */
export const exportMultiSheetExcel = async (reportId, params) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/export/multi-excel`,
    params,
    { headers: getAuthHeaders(), responseType: 'blob' }
  );
  return res.data;
};

// ─── Saved Filters ──────────────────────────────────────────────────────────

/** Get saved filters for a report */
export const fetchSavedFilters = async (reportId) => {
  const res = await axios.get(`${API_URL}/dynamic-reports/${reportId}/saved-filters`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Save a filter preset */
export const saveFilter = async (reportId, filterData) => {
  const res = await axios.post(
    `${API_URL}/dynamic-reports/${reportId}/saved-filters`,
    filterData,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Delete a saved filter */
export const deleteSavedFilter = async (reportId, filterId) => {
  const res = await axios.delete(
    `${API_URL}/dynamic-reports/${reportId}/saved-filters/${filterId}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ─── Report Sections (Visibility) ───────────────────────────────────────────

/** Get all active report sections for multi-select */
export const fetchReportSections = async () => {
  const res = await axios.get(`${API_URL}/report-builder/sections`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Get sections assigned to a specific report */
export const fetchReportSectionMappings = async (reportId) => {
  const res = await axios.get(`${API_URL}/report-builder/reports/${reportId}/sections`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/** Update section mappings for a report */
export const updateReportSectionMappings = async (reportId, sectionIds) => {
  const res = await axios.put(
    `${API_URL}/report-builder/reports/${reportId}/sections`,
    { section_ids: sectionIds },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

/** Fetch user reports filtered by section */
export const fetchUserReportsBySection = async (sectionKey) => {
  const res = await axios.get(`${API_URL}/dynamic-reports`, {
    headers: getAuthHeaders(),
    params: sectionKey ? { section: sectionKey } : {},
  });
  return res.data;
};
