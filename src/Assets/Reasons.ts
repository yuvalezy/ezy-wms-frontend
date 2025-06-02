import {ReasonValueMockup} from "./mockup";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export type ReasonValue = {
  value: number;
  description: string;
};

export enum ReasonType {
  GoodsReceipt = "GoodsReceipt",
  Counting = "Counting",
  Transfer = "Transfer",
}

export const fetchReasons = async (type: ReasonType): Promise<ReasonValue[]> => {
  if (Mockup) {
    console.log("Mockup data is being used.");
    return ReasonValueMockup;
  }

  const response = await axiosInstance.get<ReasonValue[]>(`${type}/CancelReasons`);

  return response.data;
};
