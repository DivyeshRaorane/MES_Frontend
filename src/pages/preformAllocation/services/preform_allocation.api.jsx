import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getPreformForAllocation = createAsyncThunk(
    'preformAllocation/getPreformAllocation',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/getpreformforallocation`,
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

export const preformAllocationEntry = createAsyncThunk(
    'prformAllocation/preformAllocationEntry',
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/preformallocationentry`,
                data: payload,
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
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

export const getRecentAllocatedPreforms = createAsyncThunk(
    'preformAllocation/getRecentAllocatedPreform',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/recentallocatedpreform`,
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

export const preformDiallocation = async(allocation_id)=>{
    try{
        const response = await axios({
            method : import.meta.env.VITE_METHOD_PUT,
            url: `${import.meta.env.VITE_API_URL}/preformdeallocation/${allocation_id}`,
            headers: {
                "Content-Type": "application/json",
            }
        })

        return response.data;
    }catch(error){
        throw error
    }
} 