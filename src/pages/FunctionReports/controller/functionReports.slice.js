/**
 * Function Reports Redux Slice
 * Manages state for the Function Report Registry (admin + user execution)
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchAllFunctionReports,
  fetchUserFunctionReports,
  executeFunctionReport,
  fetchAvailableFunctions,
  fetchFunctionParameters,
  fetchFunctionReportSections,
} from '../services/functionReports.api';

// ─── Async Thunks ───────────────────────────────────────────────────────────

/** Admin: Get all registered function reports */
export const getAllFunctionReports = createAsyncThunk(
  'functionReports/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllFunctionReports();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Admin: Get available PostgreSQL functions from DB metadata */
export const getAvailableFunctions = createAsyncThunk(
  'functionReports/getAvailableFunctions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAvailableFunctions();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Admin: Get function parameters for a specific function */
export const getFunctionParameters = createAsyncThunk(
  'functionReports/getFunctionParameters',
  async ({ schemaName, functionName }, { rejectWithValue }) => {
    try {
      const data = await fetchFunctionParameters(schemaName, functionName);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Get available sections */
export const getSections = createAsyncThunk(
  'functionReports/getSections',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchFunctionReportSections();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** User: Get function reports accessible to current user */
export const getUserFunctionReports = createAsyncThunk(
  'functionReports/getUserReports',
  async (section, { rejectWithValue }) => {
    try {
      const data = await fetchUserFunctionReports(section);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** User: Execute a function report */
export const runFunctionReport = createAsyncThunk(
  'functionReports/execute',
  async ({ reportId, params }, { rejectWithValue }) => {
    try {
      const data = await executeFunctionReport(reportId, params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const initialState = {
  // Admin state
  registeredReports: [],
  availableFunctions: [],
  functionParams: [],
  sections: [],

  // User-facing state
  userReports: [],
  activeReport: null,
  reportResult: null,
  resultColumns: [],
  totalRows: 0,
  executionTime: 0,

  // Loading states
  loading: {
    list: false,
    functions: false,
    params: false,
    sections: false,
    userList: false,
    execution: false,
  },
  error: null,
};

const functionReportsSlice = createSlice({
  name: 'functionReports',
  initialState,
  reducers: {
    setActiveReport: (state, action) => {
      state.activeReport = action.payload;
      state.reportResult = null;
      state.resultColumns = [];
      state.totalRows = 0;
      state.executionTime = 0;
    },
    clearReportResult: (state) => {
      state.reportResult = null;
      state.resultColumns = [];
      state.totalRows = 0;
      state.executionTime = 0;
    },
    clearFunctionParams: (state) => {
      state.functionParams = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllFunctionReports
      .addCase(getAllFunctionReports.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(getAllFunctionReports.fulfilled, (state, action) => {
        state.loading.list = false;
        const payload = action.payload;
        const reports = Array.isArray(payload) ? payload : (payload?.data || []);
        // Ensure param_config is always a parsed array
        state.registeredReports = reports.map(r => {
          let config = r.param_config;
          if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch { config = []; }
          }
          if (!Array.isArray(config)) config = [];
          config = config.map(p => {
            let opts = p.dropdown_options;
            if (typeof opts === 'string') {
              try { opts = JSON.parse(opts); } catch { opts = []; }
            }
            return { ...p, dropdown_options: opts };
          });
          return { ...r, param_config: config };
        });
      })
      .addCase(getAllFunctionReports.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload;
      })

      // getAvailableFunctions
      .addCase(getAvailableFunctions.pending, (state) => {
        state.loading.functions = true;
      })
      .addCase(getAvailableFunctions.fulfilled, (state, action) => {
        state.loading.functions = false;
        const payload = action.payload;
        state.availableFunctions = Array.isArray(payload) ? payload : (payload?.data || []);
      })
      .addCase(getAvailableFunctions.rejected, (state, action) => {
        state.loading.functions = false;
        state.error = action.payload;
      })

      // getFunctionParameters
      .addCase(getFunctionParameters.pending, (state) => {
        state.loading.params = true;
      })
      .addCase(getFunctionParameters.fulfilled, (state, action) => {
        state.loading.params = false;
        const payload = action.payload;
        state.functionParams = Array.isArray(payload) ? payload : (payload?.data || []);
      })
      .addCase(getFunctionParameters.rejected, (state, action) => {
        state.loading.params = false;
        state.error = action.payload;
      })

      // getSections
      .addCase(getSections.pending, (state) => {
        state.loading.sections = true;
      })
      .addCase(getSections.fulfilled, (state, action) => {
        state.loading.sections = false;
        const payload = action.payload;
        state.sections = Array.isArray(payload) ? payload : (payload?.data || []);
      })
      .addCase(getSections.rejected, (state, action) => {
        state.loading.sections = false;
        state.error = action.payload;
      })

      // getUserFunctionReports
      .addCase(getUserFunctionReports.pending, (state) => {
        state.loading.userList = true;
        state.error = null;
      })
      .addCase(getUserFunctionReports.fulfilled, (state, action) => {
        state.loading.userList = false;
        const payload = action.payload;
        const reports = Array.isArray(payload) ? payload : (payload?.data || []);
        // Ensure param_config is always a parsed array (may come as JSON string from API)
        state.userReports = reports.map(r => {
          let config = r.param_config;
          if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch { config = []; }
          }
          if (!Array.isArray(config)) config = [];
          // Parse dropdown_options within each param if stored as string
          config = config.map(p => {
            let opts = p.dropdown_options;
            if (typeof opts === 'string') {
              try { opts = JSON.parse(opts); } catch { opts = []; }
            }
            return { ...p, dropdown_options: opts };
          });
          return { ...r, param_config: config };
        });
      })
      .addCase(getUserFunctionReports.rejected, (state, action) => {
        state.loading.userList = false;
        state.error = action.payload;
      })

      // runFunctionReport
      .addCase(runFunctionReport.pending, (state) => {
        state.loading.execution = true;
        state.error = null;
      })
      .addCase(runFunctionReport.fulfilled, (state, action) => {
        state.loading.execution = false;
        const payload = action.payload;

        let rows = [];
        if (Array.isArray(payload)) {
          rows = payload;
        } else if (payload) {
          rows = Array.isArray(payload.data) ? payload.data
            : Array.isArray(payload.rows) ? payload.rows
            : [];
        }

        state.reportResult = rows;
        state.totalRows = payload?.totalRows || payload?.total || rows.length;
        state.executionTime = payload?.executionTime || 0;

        // Extract column definitions if provided
        if (payload?.columns && Array.isArray(payload.columns)) {
          state.resultColumns = payload.columns;
        } else if (rows.length > 0) {
          // Auto-detect columns from first row
          state.resultColumns = Object.keys(rows[0]).map(key => ({
            field: key,
            header: key.replace(/_/g, ' '),
          }));
        }
      })
      .addCase(runFunctionReport.rejected, (state, action) => {
        state.loading.execution = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveReport,
  clearReportResult,
  clearFunctionParams,
  clearError,
} = functionReportsSlice.actions;

export default functionReportsSlice.reducer;
