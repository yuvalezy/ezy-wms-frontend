import {axiosInstance} from "@/utils/axios-instance";

export type CountingSummaryReportData = {
    countingId: string;
    number: number;
    name: string;
    date: string;
    whsCode: string;
    totalLines: number;
    processedLines: number;
    varianceLines: number;
    totalSystemValue: number;
    totalCountedValue: number;
    totalVarianceValue: number;
    lines: CountingSummaryReportLine[];
}

export type CountingSummaryReportLine = {
    itemCode: string;
    itemName: string;
    binCode: string;
    quantity: number;
    buyUnitMsr?: string;
    numInBuy: number;
    purPackMsr?: string;
    purPackUn: number;
}

export const fetchCountingSummaryReport = async (id: string): Promise<CountingSummaryReportData> => {
    try {
        const url = `counting/countingSummaryReport/${id}`;

        const response = await axiosInstance.get<CountingSummaryReportData>(url);

        return response.data;
    } catch (error) {
        console.error("Error fetching countings:", error);
        throw error;
    }
};
