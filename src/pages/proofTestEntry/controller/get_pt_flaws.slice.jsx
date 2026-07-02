import { createSlice } from "@reduxjs/toolkit";
import { getPTFlaws } from "../services/pt_entry.api";

const ptFlawsSlice = createSlice({
    name:"ptFlaws",
    initialState:{
        ptFlawsData:{},
        ptFLoading: false,
        ptfError:null
    },

    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(getPTFlaws.pending, (state) => {
                                state.ptfLoading = true,
                                    state.ptfError = null
                            })
                
                            .addCase(getPTFlaws.fulfilled, (state, action) => {
                                state.ptfLoading = false,
                                    state.ptFlawsData = action.payload?.data
                            })
                
                            .addCase(getPTFlaws.rejected, (state, action) => {
                                state.ptLoading = false,
                                    state.ptfError = action.payload
                            });
    }
})


export default ptFlawsSlice.reducer;