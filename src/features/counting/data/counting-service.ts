import {axiosInstance, None} from "@/utils/axios-instance";

import {
  Counting,
  CountingActionResponse,
  CountingAddItemResponse, CountingContent,
  CountingSummaryReportData, OrderBy
} from "@/features/counting/data/counting";
import {Status, UnitType, UpdateLineParameters, UpdateLineReturnValue} from "@/features/shared/data";

export const countingService = {
  async create(name: string): Promise<Counting> {
    try {
      const response = await axiosInstance.post<Counting>(`Counting/Create`, {name: name});

      return response.data;
    } catch (error) {
      console.error("Error creating counting:", error);
      throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
  },

  async cancel(id: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post<boolean>(`Counting/Cancel`, {id});
      return response.data;
    } catch (error) {
      console.error("Error processing counting: ", error);
      throw error;
    }
  },

  async process(id: string): Promise<CountingActionResponse> {
    try {
      const response = await axiosInstance.post<CountingActionResponse>(`Counting/Process`, {id});

      if (!response.data.success) {
        throw new Error(response.data.errorMessage);
      }

      return response.data;
    } catch (error) {
      console.error("Error processing counting: ", error);
      throw error;
    }
  },

  async fetch(id: string): Promise<Counting> {
    try {
      const response = await axiosInstance.get<Counting>(`Counting/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching counting:", error);
      throw error;
    }
  },

  async fetchContent(id: string, binEntry?: number): Promise<CountingContent[]> {
    try {
      const url = `Counting/CountingContent`;

      const response = await axiosInstance.post<CountingContent[]>(
        url,
        {
          id: id,
          binEntry: binEntry
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching countings:", error);
      throw error;
    }
  },

  async search(
    id?: number,
    statuses: Status[] = [Status.Open, Status.InProgress],
    date?: Date | null,
    docName?: string,
    orderBy: OrderBy = OrderBy.ID,
    desc: boolean = true
  ): Promise<Counting[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("OrderBy", orderBy.toString());
      queryParams.append("Desc", desc.toString());

      if (statuses && statuses.length > 0) {
        statuses.forEach((status) =>
          queryParams.append("Statuses", status)
        );
      }

      if (id !== null && id !== undefined) {
        queryParams.append("ID", id.toString());
      }

      if (docName !== null && docName !== undefined) {
        queryParams.append("Name", docName);
      }

      if (date !== null && date !== undefined) {
        queryParams.append("Date", date.toISOString());
      }

      const url = `Counting?${queryParams.toString()}`;

      const response = await axiosInstance.get<Counting[]>(url,);

      return response.data;
    } catch (error) {
      console.error("Error fetching countings:", error);
      throw error;
    }
  },

  async updateLine({
                     id,
                     lineId,
                     comment,
                     reason,
                     quantity
                   }: UpdateLineParameters): Promise<UpdateLineReturnValue> {
    try {
      const url = `Counting/UpdateLine`;

      const response = await axiosInstance.post<UpdateLineReturnValue>(
        url,
        {
          id: id,
          lineId: lineId,
          comment: comment,
          closeReason: reason,
          quantity: quantity,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error updating line:", error);
      throw error;
    }
  },

  async addItem(
    id: string,
    itemCode: string,
    barcode: string,
    binEntry: number | undefined,
    unit: UnitType,
    startNewPackage: boolean,
    packageId?: string | null):
    Promise<CountingAddItemResponse> {
    try {
      const url = `Counting/AddItem`;

      const response = await axiosInstance.post<CountingAddItemResponse>(
        url,
        {
          id: id,
          itemCode: itemCode,
          barcode: barcode,
          binEntry: binEntry,
          quantity: 1,
          unit: unit,
          startNewPackage,
          packageId,
        },
      );
      if (response.data.errorMessage == null) {
        return response.data;
      } else {
        throw new Error(response.data.errorMessage);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },

  async fetchCountingSummaryReport(id: string): Promise<CountingSummaryReportData> {
    try {
      const url = `counting/countingSummaryReport/${id}`;

      const response = await axiosInstance.get<CountingSummaryReportData>(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching countings:", error);
      throw error;
    }
  },
}
