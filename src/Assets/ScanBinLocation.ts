import {configUtils, delay, globalConfig} from "./GlobalConfig";
import axios from "axios";
import {BinLocation} from "./Common";
import {binMockup} from "./mockup";

export const scanBinLocation = async (
    bin: string
): Promise<BinLocation> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return binMockup;
        }
        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/General/ScanBinLocation?bin=${bin}`;

        const response = await axios.get<BinLocation>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error canning barcode:", error);
        throw error;
    }
};
