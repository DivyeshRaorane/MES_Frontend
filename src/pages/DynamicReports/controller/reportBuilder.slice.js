/**
 * Report Builder Redux Slice
 * Manages state for the admin Report Builder wizard
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchTables,
  fetchTableColumns,
  fetchTableRelationships,
  fetchAllReports,
  fetchReportById,
  createReport,
  updateReport,
  deleteReport,
  previewReport,
  fetchRoles,
  fetchUsersForPermission,
  fetchReportSections,
} from '../services/reportBuilder.api';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const getTables = createAsyncThunk(
  'reportBuilder/getTables',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTables();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getTableColumns = createAsyncThunk(
  'reportBuilder/getTableColumns',
  async (tableName, { rejectWithValue }) => {
    try {
      const data = await fetchTableColumns(tableName);
      return { tableName, columns: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getTableRelationships = createAsyncThunk(
  'reportBuilder/getTableRelationships',
  async (tableName, { rejectWithValue }) => {
    try {
      const data = await fetchTableRelationships(tableName);
      return { tableName, relationships: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAllReports = createAsyncThunk(
  'reportBuilder/getAllReports',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllReports();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReportById = createAsyncThunk(
  'reportBuilder/getReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const data = await fetchReportById(reportId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const saveReport = createAsyncThunk(
  'reportBuilder/saveReport',
  async ({ reportId, reportData }, { rejectWithValue }) => {
    try {
      if (reportId) {
        const data = await updateReport(reportId, reportData);
        return data;
      } else {
        const data = await createReport(reportData);
        return data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeReport = createAsyncThunk(
  'reportBuilder/removeReport',
  async (reportId, { rejectWithValue }) => {
    try {
      await deleteReport(reportId);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const previewReportData = createAsyncThunk(
  'reportBuilder/previewReport',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const data = await previewReport(reportConfig);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getRoles = createAsyncThunk(
  'reportBuilder/getRoles',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRoles();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUsersForPermission = createAsyncThunk(
  'reportBuilder/getUsersForPermission',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUsersForPermission();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getReportSections = createAsyncThunk(
  'reportBuilder/getReportSections',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchReportSections();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ─── Initial State ──────────────────────────────────────────────────────────

const initialWizardState = {
  // Step 1: Report Info
  reportName: '',
  description: '',
  module: '',
  status: 'active',

  // Section visibility (Display In)
  selectedSections: [], // [section_id, ...]

  // Step 2: Main Table
  mainTable: '',

  // Step 3: Selected Columns
  selectedColumns: [], // [{ table, column, dataType }]

  // Step 4: Display Names
  columnDisplayNames: {}, // { "table.column": "Display Name" }

  // Step 5: Column Order
  columnOrder: [], // ["table.column", ...]

  // Step 6: Joins
  joins: [], // [{ leftTable, leftColumn, rightTable, rightColumn, joinType }]

  // Expressions
  expressions: [], // [{ name, displayName, expression, alias }]

  // Filters
  filters: [], // [{ column, filterType, label, required, defaultValue, options }]

  // Sorting
  sorting: [], // [{ column, direction }]

  // Grouping
  groupBy: [], // ["table.column"]

  // Aggregates
  aggregates: [], // [{ column, function, alias }]

  // Having
  having: [], // [{ expression, operator, value }]

  // Permissions
  permissions: [], // [{ type: 'role'|'user', id, view, create, update, delete, export }]

  // Excel Heading (applies to single-sheet and multi-sheet)
  heading: { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 },

  // Multi-Sheet mode (when true, steps 2-9 become sheet/table management)
  isMultiSheet: false,
  sheets: [],             // [{ id, sheetName, displayOrder, tables: [] }]
  activeSheetIndex: 0,
  activeTableIndex: null, // null = not editing a table
  editingTableConfig: null, // Deep copy of table being edited in modal
};

const initialState = {
  // Wizard state
  wizard: { ...initialWizardState },
  currentStep: 0,
  editingReportId: null,

  // Database discovery
  tables: [],
  tableColumns: {}, // { tableName: [columns] }
  tableRelationships: {}, // { tableName: [relationships] }

  // Report list
  reports: [],
  currentReport: null,

  // Report sections (for Display In multi-select)
  sections: [],

  // Preview
  previewData: null,
  previewSQL: '',
  previewExecutionTime: 0,

  // Roles & Users (for permissions)
  roles: [],
  users: [],

  // Loading states
  loading: {
    tables: false,
    columns: false,
    reports: false,
    save: false,
    preview: false,
    roles: false,
    users: false,
  },

  // Errors
  error: null,
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const reportBuilderSlice = createSlice({
  name: 'reportBuilder',
  initialState,
  reducers: {
    // Wizard navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, 9);
    },
    prevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 0);
    },

    // Wizard field updates
    updateWizardField: (state, action) => {
      const { field, value } = action.payload;
      state.wizard[field] = value;
    },

    // Step 1
    setReportInfo: (state, action) => {
      const { reportName, description, module, status } = action.payload;
      state.wizard.reportName = reportName;
      state.wizard.description = description;
      state.wizard.module = module;
      state.wizard.status = status;
    },

    // Step 2
    setMainTable: (state, action) => {
      const newTable = action.payload;
      // Only reset dependent fields if the table actually CHANGED and we're not in initial load
      if (state.wizard.mainTable && state.wizard.mainTable !== newTable) {
        state.wizard.selectedColumns = [];
        state.wizard.columnDisplayNames = {};
        state.wizard.columnOrder = [];
        state.wizard.joins = [];
        state.wizard.expressions = [];
        state.wizard.filters = [];
        state.wizard.sorting = [];
        state.wizard.groupBy = [];
        state.wizard.aggregates = [];
        state.wizard.having = [];
      }
      state.wizard.mainTable = newTable;
    },

    // Step 3
    toggleColumn: (state, action) => {
      const { table, column, dataType } = action.payload;
      const key = `${table}.${column}`;
      const idx = state.wizard.selectedColumns.findIndex(
        (c) => c.table === table && c.column === column
      );
      if (idx >= 0) {
        state.wizard.selectedColumns.splice(idx, 1);
        delete state.wizard.columnDisplayNames[key];
        state.wizard.columnOrder = state.wizard.columnOrder.filter((k) => k !== key);
      } else {
        state.wizard.selectedColumns.push({ table, column, dataType });
        state.wizard.columnDisplayNames[key] = column.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        state.wizard.columnOrder.push(key);
      }
    },

    selectAllColumns: (state, action) => {
      const { table, columns } = action.payload;
      columns.forEach((col) => {
        const key = `${table}.${col.column_name}`;
        const exists = state.wizard.selectedColumns.find(
          (c) => c.table === table && c.column === col.column_name
        );
        if (!exists) {
          state.wizard.selectedColumns.push({ table, column: col.column_name, dataType: col.data_type });
          state.wizard.columnDisplayNames[key] = col.column_name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          state.wizard.columnOrder.push(key);
        }
      });
    },

    deselectAllColumns: (state, action) => {
      const { table } = action.payload;
      state.wizard.selectedColumns = state.wizard.selectedColumns.filter((c) => c.table !== table);
      Object.keys(state.wizard.columnDisplayNames).forEach((key) => {
        if (key.startsWith(`${table}.`)) {
          delete state.wizard.columnDisplayNames[key];
        }
      });
      state.wizard.columnOrder = state.wizard.columnOrder.filter((k) => !k.startsWith(`${table}.`));
    },

    // Step 4
    setColumnDisplayName: (state, action) => {
      const { key, displayName } = action.payload;
      state.wizard.columnDisplayNames[key] = displayName;
    },

    // Step 5
    setColumnOrder: (state, action) => {
      state.wizard.columnOrder = action.payload;
    },

    // Step 6: Joins
    addJoin: (state, action) => {
      state.wizard.joins.push(action.payload);
    },
    updateJoin: (state, action) => {
      const { index, join } = action.payload;
      state.wizard.joins[index] = join;
    },
    removeJoin: (state, action) => {
      state.wizard.joins.splice(action.payload, 1);
    },

    // Expressions
    addExpression: (state, action) => {
      state.wizard.expressions.push(action.payload);
    },
    updateExpression: (state, action) => {
      const { index, expression } = action.payload;
      state.wizard.expressions[index] = expression;
    },
    removeExpression: (state, action) => {
      state.wizard.expressions.splice(action.payload, 1);
    },

    // Filters
    addFilter: (state, action) => {
      state.wizard.filters.push(action.payload);
    },
    updateFilter: (state, action) => {
      const { index, filter } = action.payload;
      state.wizard.filters[index] = filter;
    },
    removeFilter: (state, action) => {
      state.wizard.filters.splice(action.payload, 1);
    },

    // Sorting
    addSort: (state, action) => {
      state.wizard.sorting.push(action.payload);
    },
    updateSort: (state, action) => {
      const { index, sort } = action.payload;
      state.wizard.sorting[index] = sort;
    },
    removeSort: (state, action) => {
      state.wizard.sorting.splice(action.payload, 1);
    },

    // Group By
    setGroupBy: (state, action) => {
      state.wizard.groupBy = action.payload;
    },
    toggleGroupByColumn: (state, action) => {
      const col = action.payload;
      const idx = state.wizard.groupBy.indexOf(col);
      if (idx >= 0) {
        state.wizard.groupBy.splice(idx, 1);
      } else {
        state.wizard.groupBy.push(col);
      }
    },

    // Aggregates
    addAggregate: (state, action) => {
      state.wizard.aggregates.push(action.payload);
    },
    updateAggregate: (state, action) => {
      const { index, aggregate } = action.payload;
      state.wizard.aggregates[index] = aggregate;
    },
    removeAggregate: (state, action) => {
      state.wizard.aggregates.splice(action.payload, 1);
    },

    // Having
    addHaving: (state, action) => {
      state.wizard.having.push(action.payload);
    },
    updateHaving: (state, action) => {
      const { index, having } = action.payload;
      state.wizard.having[index] = having;
    },
    removeHaving: (state, action) => {
      state.wizard.having.splice(action.payload, 1);
    },

    // Permissions
    setPermissions: (state, action) => {
      state.wizard.permissions = action.payload;
    },
    addPermission: (state, action) => {
      state.wizard.permissions.push(action.payload);
    },
    updatePermission: (state, action) => {
      const { index, permission } = action.payload;
      state.wizard.permissions[index] = permission;
    },
    removePermission: (state, action) => {
      state.wizard.permissions.splice(action.payload, 1);
    },

    // ── Report Heading (single-sheet mode) ──────────────────────────────
    updateReportHeading: (state, action) => {
      if (!state.wizard.heading) {
        state.wizard.heading = { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 };
      }
      Object.assign(state.wizard.heading, action.payload);
    },

    // ── Multi-Sheet Mode Toggle ─────────────────────────────────────────
    setMultiSheetMode: (state, action) => {
      state.wizard.isMultiSheet = action.payload;
      if (action.payload && state.wizard.sheets.length === 0) {
        // Initialize with one sheet when switching to multi-sheet mode
        state.wizard.sheets = [{
          id: `temp_${Date.now()}_0`,
          sheetName: 'Sheet 1',
          displayOrder: 1,
          tables: [],
          heading: { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 },
        }];
        state.wizard.activeSheetIndex = 0;
      }
    },

    // ── Sheet Management ─────────────────────────────────────────────────
    msAddSheet: (state) => {
      const newOrder = state.wizard.sheets.length + 1;
      state.wizard.sheets.push({
        id: `temp_${Date.now()}_${newOrder}`,
        sheetName: `Sheet ${newOrder}`,
        displayOrder: newOrder,
        tables: [],
        heading: { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 },
      });
      state.wizard.activeSheetIndex = state.wizard.sheets.length - 1;
    },
    msRemoveSheet: (state, action) => {
      const idx = action.payload;
      if (state.wizard.sheets.length <= 1) return;
      state.wizard.sheets.splice(idx, 1);
      state.wizard.sheets.forEach((s, i) => { s.displayOrder = i + 1; });
      if (state.wizard.activeSheetIndex >= state.wizard.sheets.length) {
        state.wizard.activeSheetIndex = state.wizard.sheets.length - 1;
      }
    },
    msRenameSheet: (state, action) => {
      const { index, name } = action.payload;
      if (state.wizard.sheets[index]) {
        state.wizard.sheets[index].sheetName = name.replace(/[\\/*?[\]:]/g, '').substring(0, 31);
      }
    },
    msReorderSheets: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [moved] = state.wizard.sheets.splice(fromIndex, 1);
      state.wizard.sheets.splice(toIndex, 0, moved);
      state.wizard.sheets.forEach((s, i) => { s.displayOrder = i + 1; });
      if (state.wizard.activeSheetIndex === fromIndex) state.wizard.activeSheetIndex = toIndex;
      else if (fromIndex < state.wizard.activeSheetIndex && toIndex >= state.wizard.activeSheetIndex) state.wizard.activeSheetIndex--;
      else if (fromIndex > state.wizard.activeSheetIndex && toIndex <= state.wizard.activeSheetIndex) state.wizard.activeSheetIndex++;
    },
    msSetActiveSheet: (state, action) => {
      state.wizard.activeSheetIndex = action.payload;
      state.wizard.activeTableIndex = null;
      state.wizard.editingTableConfig = null;
    },

    // ── Sheet Heading ────────────────────────────────────────────────────
    msUpdateSheetHeading: (state, action) => {
      const sheet = state.wizard.sheets[state.wizard.activeSheetIndex];
      if (!sheet) return;
      if (!sheet.heading) {
        sheet.heading = { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 };
      }
      Object.assign(sheet.heading, action.payload);
    },

    // ── Table Management ─────────────────────────────────────────────────
    msAddTable: (state) => {
      const sheet = state.wizard.sheets[state.wizard.activeSheetIndex];
      if (!sheet) return;
      const newOrder = sheet.tables.length + 1;
      sheet.tables.push({
        id: `temp_${Date.now()}_t${newOrder}`,
        tableName: `Table ${newOrder}`,
        mainTable: '',
        selectedColumns: [],
        columnDisplayNames: {},
        columnOrder: [],
        joins: [],
        expressions: [],
        filters: [],
        sorting: [],
        groupBy: [],
        aggregates: [],
        having: [],
        displayOrder: newOrder,
        spacing: 2,
        formatting: { headerBold: true, headerBgColor: '#1e293b', headerTextColor: '#ffffff', borderEnabled: true, autoWidth: true },
      });
    },
    msRemoveTable: (state, action) => {
      const { sheetIndex, tableIndex } = action.payload;
      const si = sheetIndex ?? state.wizard.activeSheetIndex;
      const sheet = state.wizard.sheets[si];
      if (!sheet) return;
      sheet.tables.splice(tableIndex, 1);
      sheet.tables.forEach((t, i) => { t.displayOrder = i + 1; });
      if (state.wizard.activeTableIndex === tableIndex) {
        state.wizard.activeTableIndex = null;
        state.wizard.editingTableConfig = null;
      }
    },
    msDuplicateTable: (state, action) => {
      const { sheetIndex, tableIndex } = action.payload;
      const si = sheetIndex ?? state.wizard.activeSheetIndex;
      const sheet = state.wizard.sheets[si];
      if (!sheet || !sheet.tables[tableIndex]) return;
      const orig = sheet.tables[tableIndex];
      sheet.tables.push({
        ...JSON.parse(JSON.stringify(orig)),
        id: `temp_${Date.now()}_dup`,
        tableName: `${orig.tableName} (Copy)`,
        displayOrder: sheet.tables.length + 1,
      });
    },
    msReorderTables: (state, action) => {
      const { sheetIndex, fromIndex, toIndex } = action.payload;
      const si = sheetIndex ?? state.wizard.activeSheetIndex;
      const sheet = state.wizard.sheets[si];
      if (!sheet) return;
      const [moved] = sheet.tables.splice(fromIndex, 1);
      sheet.tables.splice(toIndex, 0, moved);
      sheet.tables.forEach((t, i) => { t.displayOrder = i + 1; });
    },

    // ── Table Editing ────────────────────────────────────────────────────
    msStartEditingTable: (state, action) => {
      const { sheetIndex, tableIndex } = action.payload;
      const si = sheetIndex ?? state.wizard.activeSheetIndex;
      const sheet = state.wizard.sheets[si];
      if (!sheet || !sheet.tables[tableIndex]) return;
      state.wizard.activeTableIndex = tableIndex;
      state.wizard.editingTableConfig = JSON.parse(JSON.stringify(sheet.tables[tableIndex]));
    },
    msCancelEditingTable: (state) => {
      state.wizard.activeTableIndex = null;
      state.wizard.editingTableConfig = null;
    },
    msSaveEditingTable: (state) => {
      if (state.wizard.editingTableConfig === null || state.wizard.activeTableIndex === null) return;
      const sheet = state.wizard.sheets[state.wizard.activeSheetIndex];
      if (!sheet) return;
      sheet.tables[state.wizard.activeTableIndex] = { ...state.wizard.editingTableConfig };
      state.wizard.activeTableIndex = null;
      state.wizard.editingTableConfig = null;
    },

    // ── Table Config Field Updates (on editingTableConfig) ───────────────
    msUpdateTableField: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const { field, value } = action.payload;
      state.wizard.editingTableConfig[field] = value;
    },
    msSetTableMainTable: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const newTable = action.payload;
      if (state.wizard.editingTableConfig.mainTable && state.wizard.editingTableConfig.mainTable !== newTable) {
        state.wizard.editingTableConfig.selectedColumns = [];
        state.wizard.editingTableConfig.columnDisplayNames = {};
        state.wizard.editingTableConfig.columnOrder = [];
        state.wizard.editingTableConfig.joins = [];
        state.wizard.editingTableConfig.expressions = [];
        state.wizard.editingTableConfig.filters = [];
        state.wizard.editingTableConfig.sorting = [];
        state.wizard.editingTableConfig.groupBy = [];
        state.wizard.editingTableConfig.aggregates = [];
        state.wizard.editingTableConfig.having = [];
      }
      state.wizard.editingTableConfig.mainTable = newTable;
    },
    msToggleColumn: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const { table, column, dataType } = action.payload;
      const key = `${table}.${column}`;
      const tc = state.wizard.editingTableConfig;
      const idx = tc.selectedColumns.findIndex(c => c.table === table && c.column === column);
      if (idx >= 0) {
        tc.selectedColumns.splice(idx, 1);
        delete tc.columnDisplayNames[key];
        tc.columnOrder = tc.columnOrder.filter(k => k !== key);
      } else {
        tc.selectedColumns.push({ table, column, dataType });
        tc.columnDisplayNames[key] = column.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        tc.columnOrder.push(key);
      }
    },
    msSelectAllColumns: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const { table, columns } = action.payload;
      const tc = state.wizard.editingTableConfig;
      columns.forEach(col => {
        const key = `${table}.${col.column_name}`;
        if (!tc.selectedColumns.find(c => c.table === table && c.column === col.column_name)) {
          tc.selectedColumns.push({ table, column: col.column_name, dataType: col.data_type });
          tc.columnDisplayNames[key] = col.column_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          tc.columnOrder.push(key);
        }
      });
    },
    msDeselectAllColumns: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const { table } = action.payload;
      const tc = state.wizard.editingTableConfig;
      tc.selectedColumns = tc.selectedColumns.filter(c => c.table !== table);
      Object.keys(tc.columnDisplayNames).forEach(key => { if (key.startsWith(`${table}.`)) delete tc.columnDisplayNames[key]; });
      tc.columnOrder = tc.columnOrder.filter(k => !k.startsWith(`${table}.`));
    },
    msSetColumnDisplayName: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      state.wizard.editingTableConfig.columnDisplayNames[action.payload.key] = action.payload.displayName;
    },
    msSetColumnOrder: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      state.wizard.editingTableConfig.columnOrder = action.payload;
    },
    msAddJoin: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.joins.push(action.payload); },
    msUpdateJoin: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.joins[action.payload.index] = action.payload.join; },
    msRemoveJoin: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.joins.splice(action.payload, 1); },
    msAddExpression: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.expressions.push(action.payload); },
    msUpdateExpression: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.expressions[action.payload.index] = action.payload.expression; },
    msRemoveExpression: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.expressions.splice(action.payload, 1); },
    msAddFilter: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.filters.push(action.payload); },
    msUpdateFilter: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.filters[action.payload.index] = action.payload.filter; },
    msRemoveFilter: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.filters.splice(action.payload, 1); },
    msAddSort: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.sorting.push(action.payload); },
    msUpdateSort: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.sorting[action.payload.index] = action.payload.sort; },
    msRemoveSort: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.sorting.splice(action.payload, 1); },
    msSetGroupBy: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.groupBy = action.payload; },
    msToggleGroupByColumn: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      const col = action.payload;
      const idx = state.wizard.editingTableConfig.groupBy.indexOf(col);
      if (idx >= 0) state.wizard.editingTableConfig.groupBy.splice(idx, 1);
      else state.wizard.editingTableConfig.groupBy.push(col);
    },
    msAddAggregate: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.aggregates.push(action.payload); },
    msUpdateAggregate: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.aggregates[action.payload.index] = action.payload.aggregate; },
    msRemoveAggregate: (state, action) => { if (state.wizard.editingTableConfig) state.wizard.editingTableConfig.aggregates.splice(action.payload, 1); },
    msUpdateTableFormatting: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      state.wizard.editingTableConfig.formatting = { ...state.wizard.editingTableConfig.formatting, ...action.payload };
    },
    msSetTableSpacing: (state, action) => {
      if (!state.wizard.editingTableConfig) return;
      state.wizard.editingTableConfig.spacing = action.payload;
    },

    // Reset wizard
    resetWizard: (state) => {
      state.wizard = { ...initialWizardState };
      state.currentStep = 0;
      state.editingReportId = null;
      state.previewData = null;
      state.previewSQL = '';
      state.previewExecutionTime = 0;
    },

    // Set editing report
    setEditingReport: (state, action) => {
      state.editingReportId = action.payload;
    },

    // Load report into wizard for editing
    loadReportIntoWizard: (state, action) => {
      const report = action.payload;
      if (!report) return;
      
      // Helper to parse JSONB fields that might be strings
      const parseJson = (val, fallback) => {
        if (Array.isArray(val)) return val;
        if (val && typeof val === 'object' && !Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch (e) { return fallback; }
        }
        return fallback;
      };

      state.wizard = {
        reportName: report.report_name || report.reportName || '',
        description: report.description || '',
        module: report.module || '',
        status: report.status || 'active',
        mainTable: report.main_table || report.mainTable || '',
        selectedColumns: parseJson(report.columns || report.selectedColumns, []),
        columnDisplayNames: parseJson(report.column_display_names || report.columnDisplayNames, {}),
        columnOrder: parseJson(report.column_order || report.columnOrder, []),
        joins: parseJson(report.joins, []),
        expressions: parseJson(report.expressions, []),
        filters: parseJson(report.filters, []),
        sorting: parseJson(report.sorting, []),
        groupBy: parseJson(report.group_by || report.groupBy, []),
        aggregates: parseJson(report.aggregates, []),
        having: parseJson(report.having, []),
        permissions: parseJson(report.permissions, []),
        // Report-level heading (for single-sheet export)
        heading: parseJson(report.heading, { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 }),
        // Section visibility (Display In)
        selectedSections: report.sections 
          ? report.sections.map(s => s.section_id) 
          : (report.section_ids && Array.isArray(report.section_ids) 
              ? report.section_ids 
              : []),
        // Multi-sheet fields
        isMultiSheet: report.is_multi_sheet || false,
        sheets: parseJson(report.sheets, []).map((sheet, idx) => ({
          id: sheet.id || `temp_${Date.now()}_${idx}`,
          sheetName: sheet.sheet_name || sheet.sheetName || `Sheet ${idx + 1}`,
          displayOrder: sheet.display_order || sheet.displayOrder || idx + 1,
          heading: parseJson(sheet.heading, { text: '', fontSize: 15, bgColor: '#1e40af', textColor: '#ffffff', startCell: 'B2', mergeRows: 2, mergeCols: 2 }),
          tables: parseJson(sheet.tables, []).map((table, tIdx) => ({
            id: table.id || `temp_${Date.now()}_${idx}_${tIdx}`,
            tableName: table.table_name || table.tableName || `Table ${tIdx + 1}`,
            mainTable: table.main_table || table.mainTable || '',
            selectedColumns: parseJson(table.columns || table.selectedColumns, []),
            columnDisplayNames: parseJson(table.column_display_names || table.columnDisplayNames, {}),
            columnOrder: parseJson(table.column_order || table.columnOrder, []),
            joins: parseJson(table.joins, []),
            expressions: parseJson(table.expressions, []),
            filters: parseJson(table.filters, []),
            sorting: parseJson(table.sorting, []),
            groupBy: parseJson(table.group_by || table.groupBy, []),
            aggregates: parseJson(table.aggregates, []),
            having: parseJson(table.having, []),
            displayOrder: table.display_order || table.displayOrder || tIdx + 1,
            spacing: table.spacing ?? 2,
            formatting: parseJson(table.formatting, { headerBold: true, headerBgColor: '#1e293b', headerTextColor: '#ffffff', borderEnabled: true, autoWidth: true }),
          })),
        })),
        activeSheetIndex: 0,
        activeTableIndex: null,
        editingTableConfig: null,
      };
      state.editingReportId = report.id != null ? String(report.id) : null;
      state.currentStep = 0;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Clear preview
    clearPreview: (state) => {
      state.previewData = null;
      state.previewSQL = '';
      state.previewExecutionTime = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Tables
      .addCase(getTables.pending, (state) => { state.loading.tables = true; state.error = null; })
      .addCase(getTables.fulfilled, (state, action) => {
        state.loading.tables = false;
        // Handle both array response and {data: [...]} wrapper
        const payload = action.payload;
        state.tables = Array.isArray(payload) ? payload : (payload?.data || payload?.rows || []);
      })
      .addCase(getTables.rejected, (state, action) => {
        state.loading.tables = false;
        state.error = action.payload;
      })

      // Get Table Columns
      .addCase(getTableColumns.pending, (state) => { state.loading.columns = true; state.error = null; })
      .addCase(getTableColumns.fulfilled, (state, action) => {
        state.loading.columns = false;
        const cols = action.payload.columns;
        state.tableColumns[action.payload.tableName] = Array.isArray(cols) ? cols : (cols?.data || cols?.rows || []);
      })
      .addCase(getTableColumns.rejected, (state, action) => {
        state.loading.columns = false;
        state.error = action.payload;
      })

      // Get Table Relationships
      .addCase(getTableRelationships.fulfilled, (state, action) => {
        state.tableRelationships[action.payload.tableName] = action.payload.relationships;
      })

      // Get All Reports
      .addCase(getAllReports.pending, (state) => { state.loading.reports = true; state.error = null; })
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.loading.reports = false;
        const payload = action.payload;
        state.reports = Array.isArray(payload) ? payload : (payload?.data || payload?.rows || payload?.reports || []);
      })
      .addCase(getAllReports.rejected, (state, action) => {
        state.loading.reports = false;
        state.error = action.payload;
      })

      // Get Report By ID
      .addCase(getReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      })

      // Save Report
      .addCase(saveReport.pending, (state) => { state.loading.save = true; state.error = null; })
      .addCase(saveReport.fulfilled, (state) => {
        state.loading.save = false;
      })
      .addCase(saveReport.rejected, (state, action) => {
        state.loading.save = false;
        state.error = action.payload;
      })

      // Delete Report
      .addCase(removeReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => r.id !== action.payload);
      })

      // Preview Report
      .addCase(previewReportData.pending, (state) => { state.loading.preview = true; state.error = null; })
      .addCase(previewReportData.fulfilled, (state, action) => {
        state.loading.preview = false;
        state.previewData = action.payload.data;
        state.previewSQL = action.payload.sql || '';
        state.previewExecutionTime = action.payload.executionTime || 0;
      })
      .addCase(previewReportData.rejected, (state, action) => {
        state.loading.preview = false;
        state.error = action.payload;
      })

      // Get Roles
      .addCase(getRoles.pending, (state) => { state.loading.roles = true; })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading.roles = false;
        state.roles = action.payload;
      })
      .addCase(getRoles.rejected, (state) => { state.loading.roles = false; })

      // Get Users
      .addCase(getUsersForPermission.pending, (state) => { state.loading.users = true; })
      .addCase(getUsersForPermission.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload;
      })
      .addCase(getUsersForPermission.rejected, (state) => { state.loading.users = false; })

      // Get Report Sections
      .addCase(getReportSections.fulfilled, (state, action) => {
        const payload = action.payload;
        state.sections = Array.isArray(payload) ? payload : (payload?.data || []);
      });
  },
});

export const {
  setCurrentStep, nextStep, prevStep,
  updateWizardField, setReportInfo, setMainTable,
  toggleColumn, selectAllColumns, deselectAllColumns,
  setColumnDisplayName, setColumnOrder,
  addJoin, updateJoin, removeJoin,
  addExpression, updateExpression, removeExpression,
  addFilter, updateFilter, removeFilter,
  addSort, updateSort, removeSort,
  setGroupBy, toggleGroupByColumn,
  addAggregate, updateAggregate, removeAggregate,
  addHaving, updateHaving, removeHaving,
  setPermissions, addPermission, updatePermission, removePermission,
  updateReportHeading,
  resetWizard, setEditingReport, loadReportIntoWizard,
  clearError, clearPreview,
  // Multi-sheet actions
  setMultiSheetMode,
  msAddSheet, msRemoveSheet, msRenameSheet, msReorderSheets, msSetActiveSheet,
  msUpdateSheetHeading,
  msAddTable, msRemoveTable, msDuplicateTable, msReorderTables,
  msStartEditingTable, msCancelEditingTable, msSaveEditingTable,
  msUpdateTableField, msSetTableMainTable,
  msToggleColumn, msSelectAllColumns, msDeselectAllColumns,
  msSetColumnDisplayName, msSetColumnOrder,
  msAddJoin, msUpdateJoin, msRemoveJoin,
  msAddExpression, msUpdateExpression, msRemoveExpression,
  msAddFilter, msUpdateFilter, msRemoveFilter,
  msAddSort, msUpdateSort, msRemoveSort,
  msSetGroupBy, msToggleGroupByColumn,
  msAddAggregate, msUpdateAggregate, msRemoveAggregate,
  msUpdateTableFormatting, msSetTableSpacing,
} = reportBuilderSlice.actions;

export default reportBuilderSlice.reducer;
