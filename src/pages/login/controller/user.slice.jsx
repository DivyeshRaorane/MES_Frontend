import { createSlice } from "@reduxjs/toolkit";
import { userLogin } from "../services/user.api";

// Auto logout on page refresh: use sessionStorage to track active session
// sessionStorage clears on tab close/refresh, localStorage persists
const isSessionActive = sessionStorage.getItem("session_active");
if (!isSessionActive) {
    // Page was refreshed or newly opened — clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null
    },
    reducers: {
        logOut: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("session_active");
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
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    // Mark session as active (survives SPA navigation, clears on refresh/tab close)
                    sessionStorage.setItem("session_active", "true");
                })
                .addCase(userLogin.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                });
        }
    
})

export const { logOut } = authSlice.actions;
export default authSlice.reducer