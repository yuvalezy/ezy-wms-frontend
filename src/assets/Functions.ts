import {TextValue} from "./TextValue";

export const IsNumeric = (value: string) => {
    return /^\d+$/.test(value);
}
export const StringFormat = (template: string, ...args: any[]): string => {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined'
            ? args[index]
            : match;
    });
}

export const IsNullOrEmpty = (str: string | null | undefined) => {
    return str === null || str === undefined || str.trim() === '';
}

export const ObjectName = (objectType: number | null | undefined) => {
    switch (objectType) {
        case 13:
            return TextValue.ReservedInvoice;
        case 17:
            return TextValue.SalesOrder;
        case 18:
            return TextValue.ReservedInvoice;
        case 22:
            return TextValue.PurchaseOrder;
        case 1250000001:
            return TextValue.TransferRequest;
        default:
            return `Unknown object ${objectType}`
    }
}
