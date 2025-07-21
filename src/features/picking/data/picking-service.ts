import {axiosInstance} from "@/utils/axios-instance";
import {
  PickingAddItemResponse,
  PickingDocument,
  pickingParameters,
  pickingsParameters,
  ProcessPickListCancelResponse,
  ProcessPickListResponse,
  ProcessResponse,
  PickListCheckSession,
  PickListCheckItemRequest,
  PickListCheckItemResponse,
  PickListCheckSummaryResponse, PickListCheckPackageResponse
} from "@/features/picking/data/picking";
import {UnitType} from "@/features/shared/data";

export const pickingService = {
  async fetchPicking(params: pickingParameters): Promise<PickingDocument> {
    try {
      const queryParams = new URLSearchParams();

      if (params.type != null) {
        queryParams.append("type", params.type.toString());
      }
      if (params.entry != null) {
        queryParams.append("entry", params.entry.toString());
      }

      if (params.availableBins != null && params.availableBins) {
        queryParams.append("availableBins", "true");
      }

      if (params.binLocation != null) {
        queryParams.append("binEntry", params.binLocation.toString());
      }

      const url = `picking/${params.id}?${queryParams.toString()}`;

      const response = await axiosInstance.get<PickingDocument>(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching pickings:", error);
      throw error;
    }
  },

  async fetchPickings(params?: pickingsParameters): Promise<PickingDocument[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params != null) {
        if (params.id !== undefined) {
          queryParams.append("id", params.id.toString());
        }
        if (params.date !== null && params.date !== undefined) {
          queryParams.append("date", params.date.toISOString());
        }

        if (params.availableBins) {
          queryParams.append("availableBins", "true");
        }
      }

      const url = `Picking?${queryParams.toString()}`;

      const response = await axiosInstance.get<PickingDocument[]>(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching pickings:", error);
      throw error;
    }
  },

  async addItem(params: {
    id: number;
    type: number;
    entry: number;
    itemCode: string;
    quantity: number;
    binEntry: number;
    unit: UnitType;
    packageId: string | undefined
  }): Promise<PickingAddItemResponse> {
    try {
      const url = `picking/addItem`;

      const response = await axiosInstance.post<PickingAddItemResponse>(url, params);
      return response.data;
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },

  async addPackage(params: {
    id: number;
    type: number;
    entry: number;
    packageId: string;
    binEntry?: number;
  }): Promise<ProcessPickListResponse> {
    try {
      const url = `picking/addPackage`;

      const response = await axiosInstance.post<ProcessPickListResponse>(url, params);
      return response.data;
    } catch (error) {
      console.error("Error adding package:", error);
      throw error;
    }
  },

  async processPicking(id: number,): Promise<ProcessResponse> {
    try {
      const url = `picking/process`;

      const response = await axiosInstance.post<ProcessResponse>(url, {id: id});
      if (response.data.errorMessage == null) {
        return response.data;
      } else {
        throw new Error(response.data.errorMessage);
      }
    } catch (error) {
      console.error("Error process picking:", error);
      throw error;
    }
  },

  async cancelPicking(id: number,): Promise<ProcessPickListCancelResponse> {
    try {
      const url = `picking/cancel`;

      const response = await axiosInstance.post<ProcessPickListCancelResponse>(
        url,
        {id: id}
      );
      if (response.data.errorMessage == null) {
        return response.data;
      } else {
        throw new Error(response.data.errorMessage);
      }
    } catch (error) {
      console.error("Error canceling picking:", error);
      throw error;
    }
  },

  async startCheck(pickListId: number): Promise<PickListCheckSession> {
    try {
      const url = `picking/${pickListId}/check/start`;
      const response = await axiosInstance.post<PickListCheckSession>(url);
      return response.data;
    } catch (error) {
      console.error("Error starting check:", error);
      throw error;
    }
  },

  async checkItem(pickListId: number, request: Omit<PickListCheckItemRequest, 'pickListId'>): Promise<PickListCheckItemResponse> {
    try {
      const url = `picking/${pickListId}/check/item`;
      const response = await axiosInstance.post<PickListCheckItemResponse>(url, request);
      return response.data;
    } catch (error) {
      console.error("Error checking item:", error);
      throw error;
    }
  },

  async checkPackage(pickListId: number, packageId: string): Promise<PickListCheckPackageResponse> {
    try {
      const url = `picking/${pickListId}/check/package`;
      const response = await axiosInstance.post<PickListCheckPackageResponse>(url, {packageId});
      return response.data;
    } catch (error) {
      console.error("Error checking package:", error);
      throw error;
    }
  },


  async getCheckSummary(pickListId: number): Promise<PickListCheckSummaryResponse> {
    try {
      const url = `picking/${pickListId}/check/summary`;
      const response = await axiosInstance.get<PickListCheckSummaryResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Error getting check summary:", error);
      throw error;
    }
  },

  async completeCheck(pickListId: number): Promise<void> {
    try {
      const url = `picking/${pickListId}/check/complete`;
      await axiosInstance.post(url);
    } catch (error) {
      console.error("Error completing check:", error);
      throw error;
    }
  }
}
