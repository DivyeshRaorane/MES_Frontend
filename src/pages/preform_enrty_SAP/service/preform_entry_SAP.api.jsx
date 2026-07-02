import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const preformEntrySap = createAsyncThunk(
    'preformEntrySAP/preformEntrySap',
    async(payload, {rejectWithValue})=>{
        try {
                    const response = await axios({
                        method: import.meta.env.VITE_METHOD_POST,
                        url: `${import.meta.env.VITE_API_URL}/api/createpreform`,
                        data:payload,
                        headers: {
                            'Content-Type': 'application/json',
                        }
        
                    })
                    console.log("what is the response:",response)
                    return response.data
                } catch (error) {
                    console.log(error.response.data.message)
                    return rejectWithValue(
                        error.response?.data?.message || error.message
                    )
                }
    }
)