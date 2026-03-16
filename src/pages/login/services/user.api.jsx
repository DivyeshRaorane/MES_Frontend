import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const userLogin = createAsyncThunk(
    'auth/userLogin',
    async(credential,{rejectWithValue})=>{
        try{
            const response = await axios({
                method:import.meta.env.VITE_METHOD_POST,
                url:`${import.meta.env.VITE_API_URL}/user/loginuser`,
                data:credential,
                headers: {
                    'Content-Type': 'application/json',
                  },
            })
            const data = response.data;
            if (data?.token) {
        localStorage.setItem("token", data.token);
      }
            return data
        }catch (err) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
          }
    }
)