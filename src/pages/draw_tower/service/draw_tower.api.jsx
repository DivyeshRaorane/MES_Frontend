import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getTowerForAllocation = createAsyncThunk(
    'drawTower/getTowerForAllocation',
    async(active = null, {rejectWithValue})=>{
        try{

            let url = `${import.meta.env.VITE_API_URL}/gettowers`;

      if (active === true || active === false) {
        url += `?active=${active}`;
      }


            const response = await axios({
                            method: import.meta.env.VITE_METHOD_GET,
                            url,
                            headers: {
                                'Content-Type': 'application/json',
                            }
            
                        })
                        return response.data
        }catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)