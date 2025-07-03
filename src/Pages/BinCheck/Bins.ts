import {axiosInstance} from "@/utils/axios-instance";
import {ItemDetails} from "@/pages/item-check/item-check";
import {PackageStockValue} from "@/components";

export interface BinContentResponse extends ItemDetails {
  onHand: number;
  packages?: PackageStockValue[] | null;
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
