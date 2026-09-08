import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getUsers = createAsyncThunk(
    'users/getUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/getuser`;

            const query = [];

            if (params.emp_id) query.push(`emp_id=${params.emp_id}`);
            if (params.role) query.push(`role=${params.role}`);
            if (params.department_id) query.push(`department_id=${params.department_id}`);

            if (query.length > 0){
                 url += `?${query.join("&")}`;
            }

            const response = await axios({
        method: import.meta.env.VITE_METHOD_GET,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      return response.data;
        }catch(error){
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)