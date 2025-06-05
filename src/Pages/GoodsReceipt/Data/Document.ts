import {
  ReceiptDocument,
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
  id?: string | null;
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
  items: DocumentItem[]): Promise<ReceiptDocument> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      // return documentMockup;
    }

    const response = await axiosInstance.post<ReceiptDocument>(
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
  id: string,
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

    const response = await axiosInstance.post<boolean>(`goodsReceipt/${action === "approve" ? "process" : "cancel"}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error creating document: ", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};

export const fetchDocument = async (id: string): Promise<ReceiptDocument> => {
  try {
    if (Mockup) {
      // console.log("Mockup data is being used.");
      // return documentMockup;
    }

    const response = await axiosInstance.get<ReceiptDocument>(`goodsReceipt/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const fetchDocuments = async (
  filters: GoodsReceiptReportFilter,
  orderBy: DocumentOrderBy = DocumentOrderBy.ID,
  desc: boolean = true
): Promise<ReceiptDocument[]> => {
  try {
    if (Mockup) {
    }
    const url = `goodsReceipt`;

    const response = await axiosInstance.post<ReceiptDocument[]>(url, filters,);

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
