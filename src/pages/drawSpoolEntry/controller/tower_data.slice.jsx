import { createSlice } from "@reduxjs/toolkit";
import { getTowerEvent } from "../services/draw_spool_entry.api.js";

const getTowerEventSlice = createSlice({
    name:"towerData",
    initialState:{
        towerEventData:{},
        teLoading:false,
        teError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getTowerEvent.pending, (state)=>{
                        state.teLoading=true,
                        state.teError=null
                    })
                
                    .addCase(getTowerEvent.fulfilled,(state,action)=>{
                        state.deLoading=false,
                        state.preformData=action.payload?.data
                    })
                
                    .addCase(getTowerEvent.rejected,(state,action)=>{
                        state.teLoading=false,
                        state.teError=action.payload
                    });
    }
})

export default getTowerEventSlice.reducer;