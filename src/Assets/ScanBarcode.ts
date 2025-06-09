import {Item} from "./Common";
import {axiosInstance} from "@/utils/axios-instance";

export const scanBarcode = async (
  scanCode: string,
  item?: boolean
): Promise<Item[]> => {
  try {
    const url = `General/ItemByBarCode?scanCode=${scanCode}&item=${item ?? false}`;

    const response = await axiosInstance.get<Item[]>(url);

    return response.data;
  } catch (error) {
    console.error("Error canning barcode:", error);
    throw error;
  }
};
