import {
  Counting,
  CountingContent,
  OrderBy,
  ObjectAction,
  Status,
  UserInfo
} from "@/assets";
import {axiosInstance} from "@/utils/axios-instance";

export const createCounting = async (
  name: string
): Promise<Counting> => {
  try {
    const response = await axiosInstance.post<Counting>(`Counting/Create`,
      {
        name: name,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error creating counting:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
}
interface CountingActionResponse {
  success: boolean;
  externalEntry: string | null;
  externalNumber: string | null;
  errorMessage: string;
  status: string;
}

export const countingAction = async (
  id: string,
  action: ObjectAction,
  user: UserInfo
): Promise<boolean | CountingActionResponse> => {
  try {
    if (action === "cancel") {
      const response = await axiosInstance.post<boolean>(
        `Counting/Cancel`,
        {
          id,
        },
      );
      return response.data;
    } else {
      const response = await axiosInstance.post<CountingActionResponse>(
        `Counting/Process`,
        {
          id,
        },
      );
      
      if (!response.data.success) {
        throw new Error(response.data.errorMessage);
      }
      
      return response.data;
    }
  } catch (error) {
    console.error("Error processing counting: ", error);
    throw error;
  }
};
export const fetchCountings = async (
  id?: number,
  statuses: Status[] = [Status.Open, Status.InProgress],
  date?: Date | null,
  docName?: string,
  orderBy: OrderBy = OrderBy.ID,
  desc: boolean = true
): Promise<Counting[]> => {
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

    const response = await axiosInstance.get<Counting[]>(url, );

    return response.data;
  } catch (error) {
    console.error("Error fetching countings:", error);
    throw error;
  }
};


export const fetchCounting = async (id: string): Promise<Counting> => {
  try {
    const response = await axiosInstance.get<Counting>(`Counting/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching counting:", error);
    throw error;
  }
}

export const fetchCountingContent = async (id: string, binEntry?: number): Promise<CountingContent[]> => {
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
}