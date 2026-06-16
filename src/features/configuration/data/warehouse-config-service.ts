import {axiosInstance} from "@/utils/axios-instance";

export interface WarehouseOption {
  id: string;
  name: string;
  enableBinLocations: boolean;
  defaultBinLocation?: number | null;
}

export interface BinOption {
  entry: number;
  code: string;
}

export const warehouseConfigService = {
  async getWarehouses(): Promise<WarehouseOption[]> {
    const res = await axiosInstance.get<WarehouseOption[]>("general/Warehouses");
    return res.data;
  },

  async getBins(warehouse: string): Promise<BinOption[]> {
    const res = await axiosInstance.get<BinOption[]>(
      `general/Warehouses/${encodeURIComponent(warehouse)}/bins`,
    );
    return res.data;
  },
};
