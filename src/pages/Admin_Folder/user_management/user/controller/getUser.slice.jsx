import { createSlice } from "@reduxjs/toolkit";
import { getUsers } from "../service/user.api";

const getUsersSlice = createSlice({
    name:"getUsers",
    initialState:{
        getUsersData:[],
        uLoading:false,
        uError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getUsers.pending, (state)=>{
                        state.uLoading=true,
                        state.uError=null
                    })
                
                    .addCase(getUsers.fulfilled,(state,action)=>{
                        state.uLoading=false,
                        state.getUsersData=action.payload?.data
                    })
                
                    .addCase(getUsers.rejected,(state,action)=>{
                        state.uLoading=false,
                        state.uError=action.payload
                    });
    }
})

export default getUsersSlice.reducer;