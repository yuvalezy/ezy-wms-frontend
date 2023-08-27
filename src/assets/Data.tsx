import config from "../config";
import axios from "axios";

export type Employee = {
    id: number;
    name: string;
}

export type BusinessPartner = {
    code: string;
    name: string;
}

export const fetchVendors = async (): Promise<BusinessPartner[]> => {
    try {

        const access_token = localStorage.getItem('token');
        const response = await axios.get<BusinessPartner[]>(`${config.baseURL}/api/General/Vendors`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error loading vendors:", error);
        throw error;  // Re-throwing so that the calling function can decide what to do with the error
    }
}
