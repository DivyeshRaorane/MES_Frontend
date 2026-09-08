import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Spool } from "lucide-react";

export const getSpoolDetailsForPT = async(bobbin_id)=>{
    try{
        const response = await axios({
            method : import.meta.env.VITE_METHOD_GET,
            url: `${import.meta.env.VITE_API_URL}/getspooldetailsforpt/${bobbin_id}`,
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
                url: `${import.meta.env.VITE_API_URL}/ptentry`,
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
                url: `${import.meta.env.VITE_API_URL}/getptflaws?spool_id=${Spool_id}`,
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
                url: `${import.meta.env.VITE_API_URL}/getptlogs?spool_id=${Spool_id}`,
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



export const getFidBySpool = async (spool_id) => {
  const response = await axios({
    method: "GET",
    url: `${import.meta.env.VITE_API_URL}/getfidbyspool/${spool_id}`,
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};
