import {ResponseStatus} from "./Common";
import {DeliveryOpenDocument} from "./Deliveries";
import {PickingDocument} from "../Pages/PickSupervisor/PickingDocument";

enum UpdateLineReturnValue {
    Status = "Status",
    LineStatus = "LineStatus",
    CloseReason = "CloseReason",
    Ok = "Ok",
    SupervisorPassword = "SupervisorPassword",
    NotSupervisor = "NotSupervisor",
}

enum GoodsReceiptType {
    AutoConfirm = "AutoConfirm",
    SpecificOrders = "SpecificOrders",
}

enum DocumentStatus {
    Open = "Open",
    Processing = "Processing",
    Finished = "Finished",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
}

export const itemMockup = [
    {
        itemCode: "exampleItemCode",
        itemName: "exampleItemName",
        purPackUn: 5,
        barcodes: ["barcode1", "barcode2", "barcode3"],
    },
];

export const itemFatherMockup = [
    {
        code: "ABC123",
        name: "John Doe",
        father: "Michael Doe",
        boxNumber: 5,
    },
];

export const updateItemBarMockup = {
    existItem: "Sample Item",
    errorMessage: "Sample Error Message",
    status: ResponseStatus.Ok,
};

export const GoodsReceiptMockup = [
    {
        itemCode: "ABC123",
        itemName: "Sample Item",
        quantity: 10,
        delivery: 5,
        showroom: 3,
        stock: 2,
    },
];

export const goodsReceiptVSExitReportDataMockup = [
    {
        objectType: 1,
        number: 123,
        cardName: "Sample Card",
        address: "123 Sample Address",
        lines: [
            {
                itemCode: "ABC123",
                itemName: "Sample Item 1",
                openQuantity: 10,
                quantity: 5,
            },
            {
                itemCode: "DEF456",
                itemName: "Sample Item 2",
                openQuantity: 20,
                quantity: 15,
            },
        ],
    },
];

export const addItemResponseMockup = {
    lineID: 123,
    closedDocument: false,
    fulfillment: false,
    showroom: false,
    warehouse: false,
    purPackUn: 5,
};

export const UpdateLineReturnValueMockup: UpdateLineReturnValue =
    UpdateLineReturnValue.Status;

export const documentMockup = {
    id: 1,
    name: "Mock Document",
    date: "2023-11-03",
    employee: {
        id: 5678,
        name: "John Doe",
    },
    status: DocumentStatus.InProgress,
    statusDate: "2023-11-03",
    statusEmployee: {
        id: 5678,
        name: "John Doe",
    },
    businessPartner: {
        code: "code",
        name: "Mock Business Partner",
    },
    type: GoodsReceiptType.SpecificOrders,
    error: false,
    errorCode: 0,
    errorParameters: [],
    specificDocuments: [
        {
            objectType: 18,
            documentNumber: 56789,
        },
        {
            objectType: 22,
            documentNumber: 12345,
        },
    ],
};

export const vendorsMockup = [
    {
        code: "1",
        name: "Provedor 1",
    },
    {
        code: "2",
        name: "Provedor 2",
    },
    {
        code: "3",
        name: "Provedor 3",
    },
    {
        code: "4",
        name: "Provedor 4",
    },
    {
        code: "5",
        name: "Provedor 5",
    },
];

export const ReasonValueMockup = [
    {
        value: 1,
        description: "description",
    },
];

export const PickingMockup: PickingDocument[] = [
    {
        entry: 101,
        date: new Date('2023-11-01'),
        salesOrders: 15,
        invoices: 8,
        transfers: 5,
        remarks: 'High priority orders',
        status: DocumentStatus.Open
    }, {
        entry: 102,
        date: new Date('2023-11-02'),
        salesOrders: 10,
        invoices: 12,
        transfers: 3,
        remarks: null,
        status: DocumentStatus.Open
    }, {
        entry: 103,
        date: new Date('2023-11-03'),
        salesOrders: 20,
        invoices: 15,
        transfers: 7,
        remarks: 'Include gift vouchers',
        status: DocumentStatus.Open
    }, {
        entry: 104,
        date: new Date('2023-11-04'),
        salesOrders: 8,
        invoices: 5,
        transfers: 2,
        remarks: 'Expedited shipping required',
        status: DocumentStatus.Open
    }, {
        entry: 105,
        date: new Date('2023-11-05'),
        salesOrders: 12,
        invoices: 10,
        transfers: 4,
        remarks: 'Partial order completion',
        status: DocumentStatus.Open
    }
]

export const DeliveryOpenDocuments: DeliveryOpenDocument[] = [
    {
        objType: 13,
        docEntry: 411,
        docNum: 4,
        docDate: new Date("2023-08-27 00:00:00.000"),
        cardCode: "yuval",
        cardName: "Yuval Lerner",
        address: "GERMANY"
    }
    ,
    {

        objType: 13,
        docEntry: 412,
        docNum: 5,
        docDate: new Date("2023-08-27 00:00:00.000"),
        cardCode: "C23900",
        cardName: "Mikrochips GmbH",
        address: "Hessische Str. 5\r\r68305 Mannheim GERMANY"
    }
    ,
    {
        objType: 13,
        docEntry: 413,
        docNum: 6,
        docDate: new Date("2023-09-24 00:00:00.000"),
        cardCode: "AITH_DEMO",
        cardName: "Aith Demo",
        address: null
    }
    ,
    {
        objType: 17,
        docEntry: 527,
        docNum: 45,
        docDate: new Date("2023-09-24 00:00:00.000"),
        cardCode: "AITH_DEMO",
        cardName: "Aith Demo",
        address: null
    }
    ,
    {
        objType: 17,
        docEntry: 528,
        docNum: 46,
        docDate: new Date("2023-10-10 00:00:00.000"),
        cardCode: "AITH_DEMO",
        cardName: "Aith Demo",
        address: null
    }
    ,
    {
        objType: 17,
        docEntry: 529,
        docNum: 47,
        docDate: new Date("2023-10-10 00:00:00.000"),
        cardCode: "C99999",
        cardName: "Einmalkunde",
        address: null
    }
    ,
    {
        objType: 17,
        docEntry: 530,
        docNum: 48,
        docDate: new Date("2023-10-18 00:00:00.000"),
        cardCode: "C30000",
        cardName: "Computerhandel Müller",
        address: "Fuldastieg 3\r\r21079 Hamburg GERMANY"
    }
];