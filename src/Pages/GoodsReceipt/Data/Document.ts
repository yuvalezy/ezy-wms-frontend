import {
  Document,
  DocumentItem,
  DocumentOrderBy,
  documentMockup,
  ObjectAction,
  Status,
  UserInfo
} from "@/assets";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export enum GoodsReceiptType {
  AutoConfirm = "AutoConfirm",
  SpecificOrders = "SpecificOrders",
  SpecificReceipts = "SpecificReceipts"
}

export type GoodsReceiptReportFilter = {
  id?: number | null;
  businessPartner?: string | null;
  name?: string;
  grpo?: string;
  purchaseOrder?: string;
  reservedInvoice?: string;
  goodsReceipt?: string;
  purchaseInvoice?: string;
  status?: Status[] | null;
  date?: Date | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  orderBy?: DocumentOrderBy | null;
  orderByDesc?: boolean | null;
  pageSize?: number | null;
  pageNumber?: number | null;
  lastID?: number | null;
  confirm?: boolean;
}

export const createDocument = async (
  type: GoodsReceiptType,
  cardCode: string,
  name: string,
  items: DocumentItem[]): Promise<Document> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return documentMockup;
    }

    const response = await axiosInstance.post<Document>(
      `GoodsReceipt/Create`,
      {
        cardCode: cardCode,
        name: name,
        type: type,
        documents: items,
        confirm
      },
      
    );

    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};
export const documentAction = async (
  id: number,
  action: ObjectAction,
  user: UserInfo
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
      `GoodsReceipt/${
        action === "approve" ? "Process" : "Cancel"
      }`,
      {
        ID: id,
      },
      
    );
    return response.data;
  } catch (error) {
    console.error("Error creating document: ", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};

export const fetchDocuments = async (
  filters: GoodsReceiptReportFilter,
  orderBy: DocumentOrderBy = DocumentOrderBy.ID,
  desc: boolean = true
): Promise<Document[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return [documentMockup];
    }



    

    // const queryParams = new URLSearchParams();
    // queryParams.append("OrderBy", orderBy.toString());
    // queryParams.append("Desc", desc.toString());
    //
    // if (filters.statuses && filters.statuses.length > 0) {
    //     filters.statuses.forEach((status) =>
    //         queryParams.append("Status", status.toString())
    //     );
    // }
    //
    // if (filters.id !== null && filters.id !== undefined) {
    //     queryParams.append("ID", filters.id.toString());
    // }
    //
    // if (filters.grpo !== null && filters.grpo !== undefined) {
    //     queryParams.append("GRPO", filters.grpo.toString());
    // }
    //
    // if (filters.docName !== null && filters.docName !== undefined) {
    //     queryParams.append("Name", filters.docName);
    // }
    //
    // if (filters.businessPartner !== null && filters.businessPartner !== undefined) {
    //     queryParams.append("BusinessPartner", filters.businessPartner.code);
    // }
    //
    // if (filters.date !== null && filters.date !== undefined) {
    //     queryParams.append("Date", filters.date.toISOString());
    // }

    // const url = `${
    //     globalConfig.baseURL
    // }/api/GoodsReceipt/Documents?${queryParams.toString()}`;
    const url = `GoodsReceipt/Documents`;

    const response = await axiosInstance.post<Document[]>(url, filters, );

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
