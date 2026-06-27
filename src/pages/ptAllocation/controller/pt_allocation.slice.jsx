import { createSlice } from "@reduxjs/toolkit";
import { ptAllocationEntry } from "../services/pt_allocation.api";

const ptAllocationSlice = createSlice({
    name: "ptAllocation",
    initialState: {
        ptAllocationData: {},
        ptALoading: false,
        ptAError: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(ptAllocationEntry.pending, (state) => {
                state.ptALoading = true,
                    state.ptAError = null
            })

            .addCase(ptAllocationEntry.fulfilled, (state, action) => {
                state.ptALoading = false,
                    state.ptAllocationData = action.payload?.data
            })

            .addCase(ptAllocationEntry.rejected, (state, action) => {
                state.ptALoading = false,
                    state.ptAError = action.payload
            });
    }
})

export default ptAllocationSlice.reducer;