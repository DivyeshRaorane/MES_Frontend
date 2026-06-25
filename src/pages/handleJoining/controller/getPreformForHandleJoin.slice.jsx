import { createSlice } from "@reduxjs/toolkit";
import { getPreformForHandleJoin } from "../services/handle_join.api";

const getPreformForHandleJoinSlice = createSlice({
    name:"preformForHandleJoin",
    initialState:{
        preformForHandleJoinData:[],
        phjLoading:false,
        phjError:null
    },

    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(getPreformForHandleJoin.pending, (state)=>{
                        state.phjLoading=true,
                        state.phjError=null
                    })
                
                    .addCase(getPreformForHandleJoin.fulfilled,(state,action)=>{
                        state.phjLoading=false,
                        state.preformForHandleJoinData=action.payload?.data
                    })
                
                    .addCase(getPreformForHandleJoin.rejected,(state,action)=>{
                        state.phjLoading=false,
                        state.phjError=action.payload
                    });
    }
})

export default getPreformForHandleJoinSlice.reducer;