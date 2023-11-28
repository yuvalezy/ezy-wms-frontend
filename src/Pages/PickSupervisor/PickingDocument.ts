import {configUtils, delay, globalConfig} from "../../Assets/GlobalConfig";
import {documentMockup, PickingDetailItemsMockup, PickingDetailsMockup, PickingMockup} from "../../Assets/mockup";
import axios from "axios";
import {Document, DocumentStatus} from "../../Assets/Document";

export type PickingDocument = {
    entry: number;
    date: Date;
    salesOrders: number;
    invoices: number;
    transfers: number;
    remarks: String | null;
    status: DocumentStatus;
    detail?: PickingDocumentDetail[];
}
export type PickingDocumentDetail = {
    type: number;
    entry: number;
    number: number;
    date: Date;
    cardCode: string;
    cardName: string;
    items?: PickingDocumentDetailItem[];
    totalItems: number;
}

export type PickingDocumentDetailItem = {
    itemCode: string;
    itemName: string;
    quantity: number;
    openQuantity: number;
}

export type pickingsParameters = {
    id?: number;
    type?: number;
    entry?: number;
    detail?: boolean;
}

export const fetchPickings = async (params?: pickingsParameters): Promise<PickingDocument[]> => {
    try {
        // if (configUtils.isMockup) {
        await delay();
        console.log("Mockup data is being used.");
        let pickingMockup = PickingMockup;
        if (params?.detail ?? false) {
            let picking = pickingMockup[0];
            picking.detail = PickingDetailsMockup;
            return [picking];
        }
        if (params?.type != null) {
            let picking = pickingMockup[0];
            picking.detail = PickingDetailsMockup.filter((v) => v.type === params?.type && v.entry === params?.entry);
            picking.detail.forEach(v => {
                v.items = PickingDetailItemsMockup;
            })
            return [picking];
       }
        return pickingMockup;
        // }

        // if (!globalConfig)
        //     throw new Error("Config has not been initialized!");
        //
        // if (globalConfig.debug)
        //     await delay();
        //
        // const access_token = localStorage.getItem("token");
        //
        // const queryParams = new URLSearchParams();
        // queryParams.append("OrderBy", orderBy.toString());
        // queryParams.append("Desc", desc.toString());
        //
        // if (statuses && statuses.length > 0) {
        //     statuses.forEach((status) =>
        //         queryParams.append("Status", status.toString())
        //     );
        // }
        //
        // if (id !== null && id !== undefined) {
        //     queryParams.append("ID", id.toString());
        // }
        //
        // if (grpo !== null && grpo !== undefined) {
        //     queryParams.append("GRPO", grpo.toString());
        // }
        //
        // if (docName !== null && docName !== undefined) {
        //     queryParams.append("Name", docName);
        // }
        //
        // if (businessPartner !== null && businessPartner !== undefined) {
        //     queryParams.append("BusinessPartner", businessPartner.code);
        // }
        //
        // if (date !== null && date !== undefined) {
        //     queryParams.append("Date", date.toISOString());
        // }
        //
        // const url = `${
        //     globalConfig.baseURL
        // }/api/GoodsReceipt/Documents?${queryParams.toString()}`;
        //
        // const response = await axios.get<Document[]>(url, {
        //     headers: {
        //         Authorization: `Bearer ${access_token}`,
        //     },
        // });
        //
        // return response.data;
    } catch (error) {
        console.error("Error fetching pickings:", error);
        throw error;
    }
}
