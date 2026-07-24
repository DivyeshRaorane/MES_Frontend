import { createSlice } from "@reduxjs/toolkit";
import { getPTFlaws } from "../services/pt_entry.api";

const ptFlawsSlice = createSlice({
    name:"ptFlaws",
    initialState:{
        ptFlawsData:{},
        ptFLoading: false,
        ptfError:null
    },

    reducers:{
        clearPtFlaws: (state) => {
            state.ptFlawsData = [];
            state.ptfLoading = false;
            state.ptfError = null;
        }
    },
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


export const { clearPtFlaws } = ptFlawsSlice.actions;
export default ptFlawsSlice.reducer;