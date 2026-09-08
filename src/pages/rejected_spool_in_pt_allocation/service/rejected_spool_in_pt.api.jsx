import axios from "axios";

export const rejectedSpools = async(is_reject)=>{
    try{
        const response = await axios({
            method : import.meta.env.VITE_METHOD_GET,
            url: `${import.meta.env.VITE_API_URL}/getptrejectedspool?is_reject=${is_reject}`,
            headers: {
                "Content-Type": "application/json",
            }
        })

        return response.data;
    }catch(error){
        throw error
    }
}