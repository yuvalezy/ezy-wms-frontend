import {BinLocation} from "./Common";
import {binMockup} from "./mockup";
import {axiosInstance, Mockup} from "@/utils/axios-instance";
import axios from "axios";

export const scanBinLocation = async (
    bin: string
): Promise<BinLocation | null> => {
    try {
        if (Mockup) {
            console.log("Mockup data is being used.");
            return binMockup;
        }
        const url = `General/ScanBinLocation?bin=${bin}`;

        const response = await axiosInstance.get<BinLocation>(url);

        if (response.status === 404) {
            return null;
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        console.error("Error canning barcode:", error);
        throw error;
    }
};
