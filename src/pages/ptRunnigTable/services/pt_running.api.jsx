import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getPTAllocatedSpool = createAsyncThunk(
    "ptAllocation/getPTAllocationSpool",
    async(is_pt_complete, {rejectWithValue})=>{
        try{
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/api/getptallocatedspool?is_pt_complete=${is_pt_complete}`,
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


export const deallocatePT = async (payload) => {
    const token = localStorage.getItem("token");
    const response = await axios({
        method: "POST",
        url: `${import.meta.env.VITE_API_URL}/api/deallocatept`,
        data: payload,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};
