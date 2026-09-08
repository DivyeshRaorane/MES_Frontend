import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createDrawEntry = createAsyncThunk(
    "drawEntry/createDrawEntry",
    async(payload,{rejectWithValue})=>{
        try{
            const token = await localStorage.getItem('token')
        const response = await axios({
                            method: import.meta.env.VITE_METHOD_POST,
                            url: `${import.meta.env.VITE_API_URL}/drawentry`,
                            data:payload,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
            
                        })
                        return response.data
                    }catch(error){
                    return rejectWithValue(
                        error.response?.data || {
                            message : "Something went wrong"
                        }
                    )
                    }
    }
)

export const getTowerEvent = createAsyncThunk(
    "tower/getTowerEventS",
    async(payload, {rejectWithValue})=>{
        console.log("Payload:", payload)
        try{
            const response = await axios({
                            method: import.meta.env.VITE_METHOD_POST,
                            url: `${import.meta.env.VITE_API_URL}/towerdata`,
                            data:payload,
                            headers: {
                                'Content-Type': 'application/json',
                            }
            
                        })
                        return response.data 
        }catch(error){
                    return rejectWithValue(
                        error.response?.data || {
                            message : "Something went wrong"
                        }
                    )
                    }
    }
)

export const getPreformByTower = createAsyncThunk(
    "preformByTower/getPreformByTower",
    async(tower_id, {rejectWithValue})=>{
        try{
            const response = await axios({
                            method: import.meta.env.VITE_METHOD_GET,
                            url: `${import.meta.env.VITE_API_URL}/preformbytower/${tower_id}`,
                            headers: {
                                'Content-Type': 'application/json',
                            }
            
                        })
                        return response.data
        }catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
    }
)