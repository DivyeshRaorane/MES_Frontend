import { createSlice } from "@reduxjs/toolkit";
import { getPTLogs } from "../services/pt_entry.api";

const ptLogsSlice = createSlice({
    name:"ptFlaws",
    initialState:{
        ptLogsData:{},
        ptLLoading: false,
        ptLError:null
    },

    reducers:{
        clearPtLogs: (state) => {
            state.ptLogsData = [];
            state.ptLLoading = false;
            state.ptLError = null;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(getPTLogs.pending, (state) => {
                                    state.ptLLoading = true,
                                    state.ptLError = null
                            })
                
                            .addCase(getPTLogs.fulfilled, (state, action) => {
                                state.ptLLoading = false,
                                    state.ptLogsData = action.payload?.data
                            })
                
                            .addCase(getPTLogs.rejected, (state, action) => {
                                state.ptLLoading = false,
                                    state.ptLfError = action.payload
                            });
    }
})


export const { clearPtLogs } = ptLogsSlice.actions;
export default ptLogsSlice.reducer;