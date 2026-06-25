import { createSlice } from "@reduxjs/toolkit";
import { ptAllocationEntry } from "../services/pt_allocation.api";

const ptAllocationSlice = createSlice({
    name: "ptAllocation",
    initialState: {
        ptAllocationData: {},
        ptALoading: false,
        ptError: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(ptAllocationEntry.pending, (state) => {
                state.ptALoading = true,
                    state.ptError = null
            })

            .addCase(ptAllocationEntry.fulfilled, (state, action) => {
                state.ptALoading = false,
                    state.ptAllocationData = action.payload?.data
            })

            .addCase(ptAllocationEntry.rejected, (state, action) => {
                state.ptALoading = false,
                    state.ptError = action.payload
            });
    }
})

export default ptAllocationSlice.reducer;