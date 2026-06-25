import { createSlice } from "@reduxjs/toolkit";
import { createDrawEntry } from "../services/draw_spool_entry.api";

const drawEntrySlice = createSlice({
    name:"DrawEntry",
    initialState:{
        drawEntryData:{},
        deLoading:false,
        deError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(createDrawEntry.pending, (state)=>{
                state.deLoading=true,
                state.deError=null
            })
        
            .addCase(createDrawEntry.fulfilled,(state,action)=>{
                state.deLoading=false,
                state.preformData=action.payload?.data
            })
        
            .addCase(createDrawEntry.rejected,(state,action)=>{
                state.deLoading=false,
                state.deError=action.payload
            });
    }
})

export default drawEntrySlice.reducer;