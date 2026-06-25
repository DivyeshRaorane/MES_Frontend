import { createSlice } from "@reduxjs/toolkit";
import { getPreforms } from "../services/preform_data.api";

const preformDataSlice = createSlice({
name:"preformData",
initialState:{
    preformData:[],
    loading:false,
    error:null,
},

reducers:{},

extraReducers:(builder)=>{
    builder
    .addCase(getPreforms.pending, (state)=>{
        state.loading=true,
        state.error=null
    })

    .addCase(getPreforms.fulfilled,(state,action)=>{
        state.loading=false,
        state.preformData=action.payload?.data
    })

    .addCase(getPreforms.rejected,(state,action)=>{
        state.loading=false,
        state.error=action.payload
    });
},

});

export default preformDataSlice.reducer;