/**
 * Dynamic Reports Redux Slice
 * Manages state for the user-facing Dynamic Reports viewer
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserReports, executeUserReport } from '../services/reportBuilder.api';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const getUserReports = createAsyncThunk(
  'dynamicReports/getUserReports',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUserReports();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const runReport = createAsyncThunk(
  'dynamicReports/runReport',
  async ({ reportId, params }, { rejectWithValue }) => {
    try {
      const data = await executeUserReport(reportId, params);
      console.log('[DynamicReports] runReport API response:', data);
      return data;
    } catch (error) {
      console.error('[DynamicReports] runReport error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ─── Helper: normalize payload ─────────────────────────────────────────────

function normalizeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'string') {
    try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed; } catch (e) {}
  }
  return [];
}

// ─── Slice ──────────────────────────────────────────────────────────────────

const initialState = {
  reports: [],
  activeReport: null,
  // columns returned from backend execution response (dynamic headers)
  responseColumns: null, // [{field, header}] from backend
  reportData: null,
  totalRows: 0,
  executionTime: 0,
  currentPage: 1,
  pageSize: 50,
  filters: {},
  sorting: [],
  searchQuery: '',
  loading: { list: false, data: false },
  error: null,
};

const dynamicReportsSlice = createSlice({
  name: 'dynamicReports',
  initialState,
  reducers: {
    setActiveReport: (state, action) => {
      state.activeReport = action.payload;
      state.reportData = null;
      state.responseColumns = null;
      state.totalRows = 0;
      state.currentPage = 1;
      state.filters = {};
      state.sorting = [];
      state.searchQuery = '';
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setSorting: (state, action) => {
      state.sorting = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    clearReportData: (state) => {
      state.reportData = null;
      state.responseColumns = null;
      state.totalRows = 0;
      state.executionTime = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserReports.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(getUserReports.fulfilled, (state, action) => {
        state.loading.list = false;
        const payload = action.payload;
        state.reports = Array.isArray(payload) ? payload : (payload?.data || payload?.rows || payload?.reports || []);
      })
      .addCase(getUserReports.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload;
      })
      .addCase(runReport.pending, (state) => {
        state.loading.data = true;
        state.error = null;
      })
      .addCase(runReport.fulfilled, (state, action) => {
        state.loading.data = false;
        const payload = action.payload;

        // Extract rows from various response formats
        let rows = [];
        if (Array.isArray(payload)) {
          rows = payload;
        } else if (payload) {
          rows = Array.isArray(payload.data) ? payload.data
            : Array.isArray(payload.rows) ? payload.rows
            : [];
        }

        state.reportData = rows;
        state.totalRows = payload?.totalRows || payload?.totalRecords || payload?.total || rows.length;
        state.executionTime = payload?.executionTime || 0;

        // If backend returns column definitions, store them
        if (payload?.columns && Array.isArray(payload.columns)) {
          state.responseColumns = payload.columns;
        }

        console.log('[DynamicReports] Stored reportData:', rows.length, 'rows');
        console.log('[DynamicReports] responseColumns:', state.responseColumns);
      })
      .addCase(runReport.rejected, (state, action) => {
        state.loading.data = false;
        state.error = action.payload;
        console.error('[DynamicReports] runReport rejected:', action.payload);
      });
  },
});

export const {
  setActiveReport, setCurrentPage, setPageSize,
  setFilters, updateFilter, clearFilters,
  setSorting, setSearchQuery,
  clearReportData, clearError,
} = dynamicReportsSlice.actions;

export default dynamicReportsSlice.reducer;
