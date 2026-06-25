import { createSlice } from "@reduxjs/toolkit";
import { getPreformByTower } from "../services/draw_spool_entry.api";

const preformByTowerSlice = createSlice({
    name:"preformByTower",
    initialState:{
        preformByTowerData:{},
        pbtLoading:false,
        pbtError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getPreformByTower.pending, (state)=>{
                                state.pbtLoading=true,
                                state.pbtError=null
                            })
                        
                            .addCase(getPreformByTower.fulfilled,(state,action)=>{
                                state.pbtLoading=false,
                                state.preformByTowerData=action.payload?.data
                            })
                        
                            .addCase(getPreformByTower.rejected,(state,action)=>{
                                state.pbtLoading=false,
                                state.pbtError=action.payload
                            });
    }
})

export default preformByTowerSlice.reducer;