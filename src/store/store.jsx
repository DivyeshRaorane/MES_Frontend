import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../pages/login/controller/user.slice'

export const store = configureStore({
    reducer:{
        auth:authReducer
    }
})