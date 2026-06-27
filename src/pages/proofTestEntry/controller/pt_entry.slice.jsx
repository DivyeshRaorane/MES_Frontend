import { createSlice } from "@reduxjs/toolkit";
import { ptEntryApi } from "../services/pt_entry.api";

const ptEntrySlice = createSlice({
    name:"ptEntry",
    initialState:{
        ptEntryData:{},
        ptLoading:{},
        ptError:{}
    },

    reducers:{},

    extraReducers: (reducer)=>{
        reducer
        .addCase(ptEntryApi.pending, (state) => {
                        state.ptLoading = true,
                            state.ptError = null
                    })
        
                    .addCase(ptEntryApi.fulfilled, (state, action) => {
                        state.ptLoading = false,
                            state.ptEntryData = action.payload?.data
                    })
        
                    .addCase(ptEntryApi.rejected, (state, action) => {
                        state.ptLoading = false,
                            state.ptError = action.payload
                    });
    }
})

export default ptEntrySlice.reducer;