import axios from "axios";

export const getPTUsers = async()=>{
    try{
        const response = await axios({
            method : import.meta.env.VITE_METHOD_GET,
            url: `${import.meta.env.VITE_API_URL}/getptusers`,
            headers: {
                "Content-Type": "application/json",
            }
        })

        return response.data;
    }catch(error){
        throw error
    }
}