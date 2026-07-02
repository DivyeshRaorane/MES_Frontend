import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Spool } from "lucide-react";

export const getSpoolDetailsForPT = async(bobbin_id)=>{
    try{
        const response = await axios({
            method : import.meta.env.VITE_METHOD_GET,
            url: `${import.meta.env.VITE_API_URL}/api/getspooldetailsforpt/${bobbin_id}`,
            headers: {
                "Content-Type": "application/json",
            }
        })
        return response.data;
    }catch(error){
        throw error
    }
}

export const ptEntryApi = createAsyncThunk(
    "ptEntry/ptEntryApi",
    async(payload, {rejectWithValue})=>{
        try{
            const token = await localStorage.getItem("token")
            const response = await axios({
                method: import.meta.env.VITE_METHOD_POST,
                url: `${import.meta.env.VITE_API_URL}/api/ptentry`,
                data:payload,
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                }

            })
            return response.data
        }catch(error){
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)

export const getPTFlaws = createAsyncThunk(
    "ptEntry/getPTFlaws",
    async(Spool_id, {rejectWithValue})=>{
        try{
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/api/getptflaws?spool_id=${Spool_id}`,
                headers: {
                    'Content-Type': 'application/json',
                }

            })
            return response.data
        }catch(error){
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)


export const getPTLogs = createAsyncThunk(
    "ptEntry/getPTLogs",
    async(Spool_id, {rejectWithValue})=>{
        try{
            const response = await axios({
                method: import.meta.env.VITE_METHOD_GET,
                url: `${import.meta.env.VITE_API_URL}/api/getptlogs?spool_id=${Spool_id}`,
                headers: {
                    'Content-Type': 'application/json',
                }

            })
            return response.data
        }catch(error){
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)

