import {delay, globalConfig} from "@/assets";
import axios from "axios";

export type CountingSummaryReportData = {
    name: string;
    lines: CountingSummaryReportLine[];
}

export type CountingSummaryReportLine = {
    itemCode: string;
    itemName: string;
    binCode: string;
    unit: number;
    dozen: number;
    pack: number;
}

export const fetchCountingSummaryReport = async (id: number): Promise<CountingSummaryReportData> => {
    try {
        if (!globalConfig)
            throw new Error("Config has not been initialized!");
        if (globalConfig.debug)
            await delay();
        // if (configUtils.isMockup) {
        //     console.log("Mockup data is being used.");
        //     return GoodsReceiptMockup;
        // }

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Counting/CountingSummaryReport/${id}`;

        const response = await axios.get<CountingSummaryReportData>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching countings:", error);
        throw error;
    }
};
