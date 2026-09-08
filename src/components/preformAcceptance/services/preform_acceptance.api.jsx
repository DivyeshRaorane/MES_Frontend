import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const preformAccept = createAsyncThunk(
    'preformAcceptance/preformAccept',
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/preformaccept`,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }

            })
            return response.data

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)