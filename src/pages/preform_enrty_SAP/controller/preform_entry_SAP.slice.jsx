import { createSlice } from "@reduxjs/toolkit";
import { preformEntrySap } from "../service/preform_entry_SAP.api";

const preformEntrySAPSlice = createSlice({
    name:"preformEntrySap",
    initialState:{
        preformEntrySapData:{},
        pesLoading:false,
        pesError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(preformEntrySap.pending, (state) => {
                        state.pesLoading = true,
                            state.pesError = null
                    })
        
                    .addCase(preformEntrySap.fulfilled, (state, action) => {
                        state.pesLoading = false,
                            state.preformEntrySapData = action.payload
                    })
        
                    .addCase(preformEntrySap.rejected, (state, action) => {
                        state.pesLoading = false,
                            state.pesError = action.payload
                    });
    }
})

export default preformEntrySAPSlice.reducer;