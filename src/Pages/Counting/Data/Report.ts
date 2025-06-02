import {axiosInstance} from "@/utils/axios-instance";

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
        // if (Mockup) {
        //     console.log("Mockup data is being used.");
        //     return GoodsReceiptMockup;
        // }

        const url = `Counting/CountingSummaryReport/${id}`;

        const response = await axiosInstance.get<CountingSummaryReportData>(url);

        return response.data;
    } catch (error) {
        console.error("Error fetching countings:", error);
        throw error;
    }
};
