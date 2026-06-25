import { createSlice } from "@reduxjs/toolkit";
import { preformAllocationEntry } from "../services/preform_allocation.api";

const preformAlllocationSlice = createSlice({
    name:"preformAllocation",
    initialState:{
        preformAllocationData:{},
        pAllocationLoading:false,
        pAllocationError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(preformAllocationEntry.pending, (state)=>{
                                        state.pAllocationLoading=true,
                                        state.pAllocationError=null
                                    })
                                
                                    .addCase(preformAllocationEntry.fulfilled,(state,action)=>{
                                        state.pAllocationLoading=false,
                                        state.preformAllocationData=action.payload?.data
                                    })
                                
                                    .addCase(preformAllocationEntry.rejected,(state,action)=>{
                                        state.pAllocationLoading=false,
                                        state.pAllocationError=action.payload
                                    });
    }
})

export default preformAlllocationSlice.reducer;