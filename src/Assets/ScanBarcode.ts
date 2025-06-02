import {Item} from "./Common";
import {itemFatherMockup} from "./mockup";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export const scanBarcode = async (
  scanCode: string,
  item?: boolean
): Promise<Item[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return itemFatherMockup;
    }

    const url = `General/ItemByBarCode?scanCode=${scanCode}&item=${item ?? false}`;

    const response = await axiosInstance.get<Item[]>(url);

    return response.data;
  } catch (error) {
    console.error("Error canning barcode:", error);
    throw error;
  }
};
