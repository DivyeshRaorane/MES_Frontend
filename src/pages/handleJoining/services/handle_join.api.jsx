import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getPreformForHandleJoin = createAsyncThunk(
    'handleJoin/getPreformFroHandleJoin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/getpreformformhandlejoin`,
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

export const handleJoin = createAsyncThunk(
    'handleJoin/handleJoin',
    async (payload, { rejectWithValue }) => {
        try {
            console.log("What is the payload:",payload)
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/handlejoin`,
                data: payload,
                headers: {
                    'Content-Type': 'application/json',
                }
        })
        return response.data;
            }catch (error) {
                return rejectWithValue(
                    error.response?.data?.message || error.message
                )
            }
        }
)