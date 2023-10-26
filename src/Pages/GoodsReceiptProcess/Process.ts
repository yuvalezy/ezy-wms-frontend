import axios from "axios";
import {AlertColor} from "@mui/material";
import {globalConfig} from "../../assets/GlobalConfig";
import {TextValue} from "../../assets/TextValue";
import {StringFormat} from "../../assets/Functions";
import {UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";

interface AddItemResponse {
    lineID: number;
    closedDocument: boolean;
    fulfillment: boolean;
    showroom: boolean;
    warehouse: boolean;
    numInBuy: number;
}

export type AddItemResponseMultipleValue = {
    message: string;
    severity: AlertColor;
}

export type AddItemResponseValue = {
    message: string;
    color: AlertColor;
    multiple?: AddItemResponseMultipleValue[];
    response: AddItemResponse;
}
export const addItem = async (id: number, itemCode: string, barcode: string): Promise<AddItemResponseValue> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/AddItem`;

        const response = await axios.post<AddItemResponse>(url, {
            id: id,
            itemCode: itemCode,
            barcode: barcode
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        let data = response.data;
        if (data.closedDocument) {
            return {
                message: StringFormat(TextValue.GoodsReceiptIsClosed, id),
                color: 'error',
                response: data
            }
        }

        let message: string = '';
        let color: AlertColor = 'info';
        let multiple: AddItemResponseMultipleValue[] = [];
        if ((data.warehouse ? 1 : 0) + (data.fulfillment ? 1 : 0) + (data.showroom ? 1 : 0) === 1) {
            if (data.warehouse) {
                message = TextValue.ScanConfirmStoreInWarehouse;
                color = 'success';
            }
            if (data.fulfillment) {
                message = TextValue.ScanConfirmFulfillment;
                color = 'warning';
            }
            if (data.showroom) {
                message = TextValue.ScanConfirmShowroom;
                color = 'info';
            }
        } else {
            if (data.warehouse) {
                multiple.push({message: TextValue.ScanConfirmStoreInWarehouse, severity: 'success'});
            }
            if (data.fulfillment) {
                multiple.push({message: TextValue.ScanConfirmFulfillment, severity: 'warning'});
            }
            if (data.showroom) {
                multiple.push({message: TextValue.ScanConfirmShowroom, severity: 'info'});
            }
        }

        return {
            message: message,
            color: color,
            multiple: multiple,
            response: data
        };
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
}
export const updateLine = async ({id, lineID, comment, userName, reason, numInBuy}: {
    id: number,
    lineID: number,
    comment?: string,
    userName?: string,
    numInBuy?: number,
    reason?: number
}): Promise<UpdateLineReturnValue> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/UpdateLine`;

        const response = await axios.post<UpdateLineReturnValue>(url, {
            id: id,
            lineID: lineID,
            comment: comment,
            userName: userName,
            closeReason: reason,
            quantityInUnit: numInBuy
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error updating line:", error);
        throw error;
    }
}
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
