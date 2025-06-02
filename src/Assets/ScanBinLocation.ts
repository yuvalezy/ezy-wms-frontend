import {BinLocation} from "./Common";
import {binMockup} from "./mockup";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export const scanBinLocation = async (
    bin: string
): Promise<BinLocation> => {
    try {
        if (Mockup) {
            console.log("Mockup data is being used.");
            return binMockup;
        }
        const url = `General/ScanBinLocation?bin=${bin}`;

        const response = await axiosInstance.get<BinLocation>(url);

        return response.data;
    } catch (error) {
        console.error("Error canning barcode:", error);
        throw error;
    }
};
