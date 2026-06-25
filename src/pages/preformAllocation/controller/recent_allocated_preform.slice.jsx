import { createSlice } from "@reduxjs/toolkit";
import { getRecentAllocatedPreforms } from "../services/preform_allocation.api";

const recentAllocatedPreformSlice = createSlice({
    name:"recentAllocatedPreform",
    initialState:{
        recentAllocatedPreformData:{},
        rapLoading:false,
        rapError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getRecentAllocatedPreforms.pending, (state)=>{
                                        state.rapLoading=true,
                                        state.rapError=null
                                    })
                                
                                    .addCase(getRecentAllocatedPreforms.fulfilled,(state,action)=>{
                                        state.rapLoading=false,
                                        state.recentAllocatedPreformData=action.payload?.data
                                    })
                                
                                    .addCase(getRecentAllocatedPreforms.rejected,(state,action)=>{
                                        state.rapLoading=false,
                                        state.rapError=action.payload
                                    });
                    
            }
    
})

export default recentAllocatedPreformSlice.reducer;