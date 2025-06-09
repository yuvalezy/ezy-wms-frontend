import {axiosInstance} from "@/utils/axios-instance";

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
  const response = await axiosInstance.get<ReasonValue[]>(`${type}/CancelReasons`);

  return response.data;
};
