import axios from "axios";
import {Document, DocumentAction, DocumentItem, DocumentStatus, OrderBy} from "../../Assets/Document";
import {configUtils, delay, globalConfig} from "../../Assets/GlobalConfig";
import {documentMockup, itemFatherMockup, ReasonValueMockup} from "../../Assets/mockup";
import {Item, User} from "../../Assets/Common";
import {BusinessPartner} from "../../Assets/Data";


export enum GoodsReceiptType {
    AutoConfirm = "AutoConfirm",
    SpecificOrders = "SpecificOrders",
}

export const createDocument = async (
    type: GoodsReceiptType,
    cardCode: string,
    name: string,
    items: DocumentItem[]
): Promise<Document> => {
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
    action: DocumentAction,
    user: User
): Promise<boolean> => {
    try {
        if (configUtils.isMockup) {
            if (action === "approve") {
                documentMockup.status = DocumentStatus.Finished;
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

export type ReasonValue = {
    value: number;
    description: string;
};

export const fetchReasons = async (): Promise<ReasonValue[]> => {
    if (configUtils.isMockup) {
        console.log("Mockup data is being used.");
        return ReasonValueMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const response = await axios.get<ReasonValue[]>(
        `${globalConfig.baseURL}/api/GoodsReceipt/CancelReasons`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    return response.data;
};
export const fetchDocuments = async (
    id?: number,
    statuses: DocumentStatus[] = [DocumentStatus.Open, DocumentStatus.InProgress],
    businessPartner?: BusinessPartner | null,
    date?: Date | null,
    docName?: string,
    grpo?: number,
    orderBy: OrderBy = OrderBy.ID,
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

        if (grpo !== null && grpo !== undefined) {
            queryParams.append("GRPO", grpo.toString());
        }

        if (docName !== null && docName !== undefined) {
            queryParams.append("Name", docName);
        }

        if (businessPartner !== null && businessPartner !== undefined) {
            queryParams.append("BusinessPartner", businessPartner.code);
        }

        if (date !== null && date !== undefined) {
            queryParams.append("Date", date.toISOString());
        }

        const url = `${
            globalConfig.baseURL
        }/api/GoodsReceipt/Documents?${queryParams.toString()}`;

        const response = await axios.get<Document[]>(url, {
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

export const scanBarcode = async (
    scanCode: string
): Promise<Item[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used. holis");
            return itemFatherMockup;
        }
        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/General/ItemByBarCode?scanCode=${scanCode}`;

        const response = await axios.get<Item[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error canning barcode:", error);
        throw error;
    }
};