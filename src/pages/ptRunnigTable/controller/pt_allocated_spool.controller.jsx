import { createSlice } from "@reduxjs/toolkit";
import { getPTAllocatedSpool } from "../services/pt_running.api";

const ptAllocatedSpoolSlice = createSlice({
    name:"ptAllocatedSpool",
    initialState:{
        ptAllocatedSpoolData:{},
        ptASLoading:false,
        ptASError:null
    },

    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(getPTAllocatedSpool.pending, (state) => {
                        state.ptASLoading = true,
                            state.ptASError = null
                    })
        
                    .addCase(getPTAllocatedSpool.fulfilled, (state, action) => {
                        state.ptASLoading = false,
                            state.ptAllocatedSpoolData = action.payload?.data
                    })
        
                    .addCase(getPTAllocatedSpool.rejected, (state, action) => {
                        state.ptASLoading = false,
                            state.ptASError = action.payload
                    });
    }
})

export default ptAllocatedSpoolSlice.reducer;