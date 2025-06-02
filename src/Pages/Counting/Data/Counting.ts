import {
  Counting,
  CountingContent,
  OrderBy,
  countingMockup,
  documentMockup,
  ObjectAction,
  Status,
  User
} from "@/assets";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export const createCounting = async (
  name: string
): Promise<Counting> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return countingMockup;
    }
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
export const countingAction = async (
  id: number,
  action: ObjectAction,
  user: User
): Promise<boolean> => {
  try {
    if (Mockup) {
      if (action === "approve") {
        documentMockup.status = Status.Finished;
        return true;
      }
      console.log("Mockup data is being used.");
      return true;
    }


    const response = await axiosInstance.post<boolean>(
      `Counting/${
        action === "approve" ? "Process" : "Cancel"
      }`,
      {
        ID: id,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating counting: ", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
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
    if (Mockup) {
      console.log("Mockup data is being used.");
      return [countingMockup];
    }

    const queryParams = new URLSearchParams();
    queryParams.append("OrderBy", orderBy.toString());
    queryParams.append("Desc", desc.toString());

    if (statuses && statuses.length > 0) {
      statuses.forEach((status) =>
        queryParams.append("Status", status.toString())
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

    const url = `Counting/Countings?${queryParams.toString()}`;

    const response = await axiosInstance.get<Counting[]>(url, );

    return response.data;
  } catch (error) {
    console.error("Error fetching countings:", error);
    throw error;
  }
};

export const fetchCountingContent = async (id: number, binEntry?: number): Promise<CountingContent[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      //todo return mockup
    }




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