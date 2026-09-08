import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getPreforms = createAsyncThunk(
    "preform/getPreform",
    async(_,{rejectWithValue})=>{
        try{
            const response = await axios({
                method:import.meta.env.VITE_METHOD_GET,
                url:`${import.meta.env.VITE_API_URL}/getpreform`,
                headers:{
                    'Content-Type':'application/json',
                }
            })
            const data = response.data
            return data
        }catch(error){
return rejectWithValue(
    error.response?.data?.message || error.message
)
        }
        
    }
)