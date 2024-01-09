import {ResponseStatus} from "./Common";
import {DeliveryOpenDocument} from "./Deliveries";
import {PickingDocument, PickingDocumentDetail, PickingDocumentDetailItem, PickStatus} from "../Pages/Picking/Data/PickingDocument";
import {ProcessResponse} from "./Document";
import {Counting} from "./Counting";

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

export const processResponseMockup: ProcessResponse = {
    ok: true
}
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
        status: PickStatus.Released,
        quantity: 15,
        openQuantity: 12,
        updateQuantity: 3
    }, {
        entry: 102,
        date: new Date('2023-11-02'),
        salesOrders: 10,
        invoices: 12,
        transfers: 3,
        remarks: null,
        status: PickStatus.Released,
        quantity: 15,
        openQuantity: 12,
        updateQuantity: 3
    }, {
        entry: 103,
        date: new Date('2023-11-03'),
        salesOrders: 20,
        invoices: 15,
        transfers: 7,
        remarks: 'Include gift vouchers',
        status: PickStatus.Released,
        quantity: 15,
        openQuantity: 12,
        updateQuantity: 3
    }, {
        entry: 104,
        date: new Date('2023-11-04'),
        salesOrders: 8,
        invoices: 5,
        transfers: 2,
        remarks: 'Expedited shipping required',
        status: PickStatus.Released,
        quantity: 15,
        openQuantity: 12,
        updateQuantity: 3
    }, {
        entry: 105,
        date: new Date('2023-11-05'),
        salesOrders: 12,
        invoices: 10,
        transfers: 4,
        remarks: 'Partial order completion',
        status: PickStatus.Released,
        quantity: 15,
        openQuantity: 12,
        updateQuantity: 3
    }
]

export const PickingDetailsMockup: PickingDocumentDetail[] = [
    {
        type: 17,
        entry: 1,
        number: 1,
        date: new Date('2023-11-01'),
        cardCode: "JD",
        cardName: "John Doe",
        totalItems: 5,
        totalOpenItems: 5,
    },
    {
        type: 13,
        entry: 2,
        number: 2,
        date: new Date('2023-11-01'),
        cardCode: "KR",
        cardName: "Keren Roe Smith",
        totalItems: 3,
        totalOpenItems: 2,
    }
]

export const PickingDetailItemsMockup: PickingDocumentDetailItem[] = [
    {itemCode: "ABC123", itemName: "Sample Item", quantity: 10, picked: 0, openQuantity: 10,},
    {itemCode: "ABC555", itemName: "Sample Item 5", quantity: 5, picked: 2, openQuantity: 3,},
    {itemCode: "ABC222", itemName: "Sample Item 2", quantity: 30, picked: 10, openQuantity: 20,},
    {itemCode: "XYZ101", itemName: "Item 101", quantity: 15, picked: 0, openQuantity: 15},
    {itemCode: "XYZ102", itemName: "Item 102", quantity: 20, picked: 2, openQuantity: 18},
    {itemCode: "XYZ103", itemName: "Item 103", quantity: 25, picked: 15, openQuantity: 10},
    {itemCode: "XYZ104", itemName: "Item 104", quantity: 12, picked: 0, openQuantity: 12},
    {itemCode: "XYZ105", itemName: "Item 105", quantity: 30, picked: 5, openQuantity: 25},
    {itemCode: "XYZ106", itemName: "Item 106", quantity: 8, picked: 3, openQuantity: 5},
    {itemCode: "XYZ107", itemName: "Item 107", quantity: 18, picked: 8, openQuantity: 10},
    {itemCode: "XYZ108", itemName: "Item 108", quantity: 22, picked: 2, openQuantity: 20},
    {itemCode: "XYZ109", itemName: "Item 109", quantity: 17, picked: 2, openQuantity: 15},
    {itemCode: "XYZ110", itemName: "Item 110", quantity: 19, picked: 0, openQuantity: 19},
    {itemCode: "XYZ111", itemName: "Item 111", quantity: 13, picked: 6, openQuantity: 7},
    {itemCode: "XYZ112", itemName: "Item 112", quantity: 21, picked: 0, openQuantity: 21},
    {itemCode: "XYZ113", itemName: "Item 113", quantity: 16, picked: 2, openQuantity: 14},
    {itemCode: "XYZ114", itemName: "Item 114", quantity: 14, picked: 5, openQuantity: 9},
    {itemCode: "XYZ115", itemName: "Item 115", quantity: 11, picked: 0, openQuantity: 11},
    {itemCode: "XYZ116", itemName: "Item 116", quantity: 9, picked: 3, openQuantity: 6},
    {itemCode: "XYZ117", itemName: "Item 117", quantity: 7, picked: 4, openQuantity: 3},
    {itemCode: "XYZ118", itemName: "Item 118", quantity: 23, picked: 5, openQuantity: 18},
    {itemCode: "XYZ119", itemName: "Item 119", quantity: 26, picked: 0, openQuantity: 26},
    {itemCode: "XYZ120", itemName: "Item 120", quantity: 29, picked: 5, openQuantity: 24},
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
export const countingMockup : Counting = {
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
    error: false,
    errorCode: 0,
    errorParameters: [],
};
