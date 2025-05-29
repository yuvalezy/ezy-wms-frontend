import axios from "axios";
import {
  Document,
  DocumentItem,
  DocumentOrderBy,
  configUtils,
  delay,
  globalConfig,
  documentMockup,
  ObjectAction,
  Status,
  User
} from "@/assets";

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
    if (configUtils.isMockup) {
      console.log("Mockup data is being used.");
      return documentMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");
    const response = await axios.post<Document>(
      `${globalConfig.baseURL}/api/GoodsReceipt/Create`,
      {
        cardCode: cardCode,
        name: name,
        type: type,
        documents: items,
        confirm
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
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
  user: User
): Promise<boolean> => {
  try {
    if (configUtils.isMockup) {
      if (action === "approve") {
        documentMockup.status = Status.Finished;
        return true;
      }
      console.log("Mockup data is being used.");
      return true;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");
    const response = await axios.post<boolean>(
      `${globalConfig.baseURL}/api/GoodsReceipt/${
        action === "approve" ? "Process" : "Cancel"
      }`,
      {
        ID: id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
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
    if (configUtils.isMockup) {
      console.log("Mockup data is being used.");
      return [documentMockup];
    }

    if (!globalConfig)
      throw new Error("Config has not been initialized!");

    if (globalConfig.debug)
      await delay();

    const access_token = localStorage.getItem("token");

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
    const url = `${
      globalConfig.baseURL
    }/api/GoodsReceipt/Documents`;

    const response = await axios.post<Document[]>(url, filters, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
