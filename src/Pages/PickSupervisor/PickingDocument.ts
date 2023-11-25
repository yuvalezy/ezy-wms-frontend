import {configUtils, delay, globalConfig} from "../../Assets/GlobalConfig";
import {documentMockup, PickingMockup} from "../../Assets/mockup";
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
}

export const fetchPickings = async(id?: number) : Promise<PickingDocument[]> => {
    try {
        // if (configUtils.isMockup) {
            await delay();
            console.log("Mockup data is being used.");
            return PickingMockup;
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
