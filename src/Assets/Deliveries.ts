export type DeliveryOpenDocument = {
    objType: number;
    docEntry: number;
    docNum: number;
    docDate: Date;
    cardCode: string;
    cardName: string;
    address: string | null;
}