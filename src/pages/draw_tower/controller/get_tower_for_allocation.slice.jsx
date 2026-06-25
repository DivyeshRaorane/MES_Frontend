import { createSlice } from "@reduxjs/toolkit";
import { getTowerForAllocation } from "../service/draw_tower.api";

const getTowerForAllocationSlice = createSlice({
    name:"towerForAllocation",
    initialState:{
        towerForAllocationData:{},
        taLoading:false,
        taError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getTowerForAllocation.pending, (state)=>{
                                state.taLoading=true,
                                state.taError=null
                            })
                        
                            .addCase(getTowerForAllocation.fulfilled,(state,action)=>{
                                state.taLoading=false,
                                state.towerForAllocationData=action.payload?.data
                            })
                        
                            .addCase(getTowerForAllocation.rejected,(state,action)=>{
                                state.taLoading=false,
                                state.taError=action.payload
                            });
            
    }
})

export default getTowerForAllocationSlice.reducer;