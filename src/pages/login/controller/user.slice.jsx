import { createSlice } from "@reduxjs/toolkit";
import { userLogin } from "../services/user.api";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem("token") || null,
        loading: false,
        error: null
    },
    reducers: {
        logOut: (state) => {
            state.user = null,
                state.token = null,
                localStorage.removeItem("token");
        },
    },
        extraReducers: (builder) => {
            builder
                .addCase(userLogin.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(userLogin.fulfilled, (state, action) => {
                    state.loading = false;
                    state.user = action.payload.user; // adjust based on API response
                    state.token = action.payload.token;
                })
                .addCase(userLogin.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                });
        }
    
})

export const { logOut } = authSlice.actions;
export default authSlice.reducer