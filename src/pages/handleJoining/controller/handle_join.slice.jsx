import { createSlice } from "@reduxjs/toolkit";
import { handleJoin } from "../services/handle_join.api";

const handleJoinSlice = createSlice({
    name: "handleJoin",
    initialState: {
        handleJoinData: {},
        hjLoading: false,
        hjError: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(handleJoin.pending, (state) => {
                state.hjLoading = true,
                    state.hjError = null
            })

            .addCase(handleJoin.fulfilled, (state, action) => {
                state.hjLoading = false,
                    state.handleJoinData = action.payload?.data
            })

            .addCase(handleJoin.rejected, (state, action) => {
                state.hjLoading = false,
                    state.hjError = action.payload
            });
    }
})

export default handleJoinSlice.reducer;