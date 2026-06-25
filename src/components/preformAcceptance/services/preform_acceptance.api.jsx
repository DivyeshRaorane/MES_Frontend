import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const preformAccept = createAsyncThunk(
    'preformAcceptance/preformAccept',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/api/preformaccept`,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
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