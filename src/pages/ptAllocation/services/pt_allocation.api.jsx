import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const ptAllocationEntry = createAsyncThunk(
    "ptAllocation/ptAllocationEntry",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/api/createptallocation`,
                data:payload,
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


export const getDrawEntryDetails = async(spool_id)=>{
try{
    const response = await axios({
            method : import.meta.env.VITE_METHOD_GET,
            url: `${import.meta.env.VITE_API_URL}/api/getdrawentryforpta?spool_id=${spool_id}`,
            headers: {
                "Content-Type": "application/json",
            }
        })

        return response.data;
    }catch(error){
        console.error("API Error:", error);
    throw error;
    }

}