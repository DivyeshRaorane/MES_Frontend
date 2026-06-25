import { createSlice } from "@reduxjs/toolkit";
import { getPreformForAllocation } from "../services/preform_allocation.api";

const getPreformForAllocationSlice = createSlice({
    name:"preformForAllocation",
    initialState:{
        preformForAllocationData:{},
        paLoading:false,
        paError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getPreformForAllocation.pending, (state)=>{
                                state.paLoading=true,
                                state.paError=null
                            })
                        
                            .addCase(getPreformForAllocation.fulfilled,(state,action)=>{
                                state.paLoading=false,
                                state.preformForAllocationData=action.payload?.data
                            })
                        
                            .addCase(getPreformForAllocation.rejected,(state,action)=>{
                                state.paLoading=false,
                                state.paError=action.payload
                            });
            
    }
})

export default getPreformForAllocationSlice.reducer;