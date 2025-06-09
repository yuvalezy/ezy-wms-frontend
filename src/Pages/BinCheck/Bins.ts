import {axiosInstance} from "@/utils/axios-instance";

export interface BinContentResponse {
  itemCode: string;
  itemName: string;
  onHand: number;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
}

export const binCheck = async (
  binEntry: number
): Promise<BinContentResponse[]> => {
  try {
    const url = `General/BinCheck?binEntry=${binEntry}`;

    const response = await axiosInstance.get<BinContentResponse[]>(url);

    return response.data;
  } catch (error) {
    console.error("Error checking bin content:", error);
    throw error;
  }
};
