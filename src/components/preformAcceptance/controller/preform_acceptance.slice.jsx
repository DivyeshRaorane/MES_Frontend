import { createSlice } from "@reduxjs/toolkit";
import { preformAccept } from "../services/preform_acceptance.api";

const preformAcceptanceSlice = createSlice({
    name:"preformAcceptance",
    initialState:{
        preformAcceptanceData:[],
        preformALoading:false,
        preformAError:null
    },
    reducers:{},

    extraReducers:(builder)=>{
        builder
        .addCase(preformAccept.pending, (state)=>{
                state.preformALoading=true,
                state.error=null
            })
        
            .addCase(preformAccept.fulfilled,(state,action)=>{
                state.preformALoading=false,
                state.preformAcceptanceData=action.payload?.data
            })
        
            .addCase(preformAccept.rejected,(state,action)=>{
                state.preformALoading=false,
                state.preformAError=action.payload
            });
    }
});


export default preformAcceptanceSlice.reducer;

