import {BinLocation, ResponseStatus, Status, UnitType, UserInfo} from "./Common";
import {DeliveryOpenDocument} from "./Deliveries";
import {
  PickingDocument,
  PickingDocumentDetail,
  PickingDocumentDetailItem,
  PickStatus
} from "@/pages/picking/data/picking-document";
import {DocumentAddItemResponse, ProcessResponse} from "./ReceiptDocument";
import {Counting, CountingContent} from "./Counting";
import {GoodsReceiptAll, GoodsReceiptAllDetail, GoodsReceiptVSExitReportData} from "@/pages/GoodsReceipt/data/Report";
import {TransferDocument} from "@/pages/transfer/data/transfer-document";
import {TransferAddItemResponse} from "@/pages/transfer/data/transfer-process";
import {ItemCheckResponse, ItemStockResponse} from "@/pages/item-check/item";
import {BinContentResponse} from "@/pages/BinCheck/Bins";

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

export const itemMockup: ItemCheckResponse[] = [
  {
    itemCode: "exampleItemCode",
    itemName: "exampleItemName",
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box",
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

export const GoodsReceiptMockup: GoodsReceiptAll[] = [
  {
    itemCode: "ABC123",
    itemName: "Sample Item",
    quantity: 10,
    delivery: 5,
    showroom: 3,
    stock: 2,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
];

export const GoodsReceiptAllDetailMockup: GoodsReceiptAllDetail[] = [
  {lineId: 1, timeStamp: new Date(), employeeName: "Test", quantity: 1, unit: UnitType.Unit},
  {lineId: 2, timeStamp: new Date(), employeeName: "Test", quantity: 3, unit: UnitType.Dozen},
  {lineId: 3, timeStamp: new Date(), employeeName: "Test", quantity: 10, unit: UnitType.Pack},
]

export const itemStockMockup: ItemStockResponse[] = [
  {binCode: "BIN-A01", quantity: 50},
  {binCode: "BIN-A02", quantity: 25},
  {binCode: "BIN-B01", quantity: 100},
  {binCode: "BIN-B02", quantity: 75},
  {binCode: "BIN-C01", quantity: 30},
];

export const goodsReceiptVSExitReportDataMockup: GoodsReceiptVSExitReportData[] = [
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
        numInBuy: 12,
        purPackUn: 4
      },
      {
        itemCode: "DEF456",
        itemName: "Sample Item 2",
        openQuantity: 20,
        quantity: 15,
        numInBuy: 12,
        purPackUn: 4
      },
    ],
  },
];

export const processResponseMockup: ProcessResponse = {
  ok: true
}
export const addItemResponseMockup: DocumentAddItemResponse = {
  lineId: 123,
  closedDocument: false,
  fulfillment: false,
  showroom: false,
  warehouse: false,
  quantity: 1,
  numInBuy: 12,
  buyUnitMsr: "DOZ",
  purPackMsr: "Pack",
  purPackUn: 4
};

export const UpdateLineReturnValueMockup: UpdateLineReturnValue =
  UpdateLineReturnValue.Status;

export const documentMockup = {
  id: "0000-0000",
  name: "Mock Document",
  date: "2023-11-03",
  employee: {
    id: 5678,
    name: "John Doe",
  },
  status: Status.InProgress,
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
  {
    itemCode: "ABC123",
    itemName: "Sample Item",
    quantity: 10,
    picked: 0,
    openQuantity: 10,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ABC555",
    itemName: "Sample Item 5",
    quantity: 5,
    picked: 2,
    openQuantity: 3,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ABC222",
    itemName: "Sample Item 2",
    quantity: 30,
    picked: 10,
    openQuantity: 20,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ101",
    itemName: "Item 101",
    quantity: 15,
    picked: 0,
    openQuantity: 15,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ102",
    itemName: "Item 102",
    quantity: 20,
    picked: 2,
    openQuantity: 18,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ103",
    itemName: "Item 103",
    quantity: 25,
    picked: 15,
    openQuantity: 10,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ104",
    itemName: "Item 104",
    quantity: 12,
    picked: 0,
    openQuantity: 12,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ105",
    itemName: "Item 105",
    quantity: 30,
    picked: 5,
    openQuantity: 25,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ106",
    itemName: "Item 106",
    quantity: 8,
    picked: 3,
    openQuantity: 5,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ107",
    itemName: "Item 107",
    quantity: 18,
    picked: 8,
    openQuantity: 10,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ108",
    itemName: "Item 108",
    quantity: 22,
    picked: 2,
    openQuantity: 20,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ109",
    itemName: "Item 109",
    quantity: 17,
    picked: 2,
    openQuantity: 15,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ110",
    itemName: "Item 110",
    quantity: 19,
    picked: 0,
    openQuantity: 19,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ111",
    itemName: "Item 111",
    quantity: 13,
    picked: 6,
    openQuantity: 7,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ112",
    itemName: "Item 112",
    quantity: 21,
    picked: 0,
    openQuantity: 21,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ113",
    itemName: "Item 113",
    quantity: 16,
    picked: 2,
    openQuantity: 14,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ114",
    itemName: "Item 114",
    quantity: 14,
    picked: 5,
    openQuantity: 9,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ115",
    itemName: "Item 115",
    quantity: 11,
    picked: 0,
    openQuantity: 11,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ116",
    itemName: "Item 116",
    quantity: 9,
    picked: 3,
    openQuantity: 6,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ117",
    itemName: "Item 117",
    quantity: 7,
    picked: 4,
    openQuantity: 3,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ118",
    itemName: "Item 118",
    quantity: 23,
    picked: 5,
    openQuantity: 18,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ119",
    itemName: "Item 119",
    quantity: 26,
    picked: 0,
    openQuantity: 26,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "XYZ120",
    itemName: "Item 120",
    quantity: 29,
    picked: 5,
    openQuantity: 24,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
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
export const countingMockup: Counting = {
  id: "000----",
  name: "Mock Document",
  date: "2023-11-03",
  employee: {
    id: 5678,
    name: "John Doe",
  },
  status: Status.InProgress,
  statusDate: "2023-11-03",
  statusEmployee: {
    id: 5678,
    name: "John Doe",
  },
  error: false,
  errorCode: 0,
  errorParameters: [],
};


export const binMockup: BinLocation = {
  entry: 1,
  code: "1234",
  quantity: 1
}

export const countProcessRows: CountingContent[] = [
  {itemCode: "test1", itemName: "test1 name", quantity: 22},
  {itemCode: "test2", itemName: "test2 name", quantity: 22},
  {itemCode: "test3", itemName: "test3 name", quantity: 22},
  {itemCode: "test4", itemName: "test4 name", quantity: 22},
  {itemCode: "test5", itemName: "test5 name", quantity: 22},
  {itemCode: "test6", itemName: "test6 name", quantity: 22},
  {itemCode: "test7", itemName: "test7 name", quantity: 22},
  {itemCode: "test8", itemName: "test8 name", quantity: 22},
  {itemCode: "test9", itemName: "test9 name", quantity: 22},
  {itemCode: "test10", itemName: "test10 name", quantity: 22},
  {itemCode: "test11", itemName: "test11 name", quantity: 22},
  {itemCode: "test12", itemName: "test12 name", quantity: 22},
  {itemCode: "test13", itemName: "test13 name", quantity: 22},
  {itemCode: "test14", itemName: "test14 name", quantity: 22},
  {itemCode: "test15", itemName: "test15 name", quantity: 22},
  {itemCode: "test16", itemName: "test16 name", quantity: 22},
  {itemCode: "test17", itemName: "test17 name", quantity: 22},
  {itemCode: "test18", itemName: "test18 name", quantity: 22},
  {itemCode: "test19", itemName: "test19 name", quantity: 22},
]
export const userMock: UserInfo = {
  id: "00000-0000",
  name: "John Doe",
  roles: [],
  warehouses: [],
  currentWarehouse: "",
  binLocations: false,
  settings: {
    goodsReceiptDraft: false,
    goodsReceiptCreateSupervisorRequired: true,
    goodsReceiptModificationSupervisor: true,
    transferTargetItems: false
  },
  superUser: false
}
export const transferMockup: TransferDocument = {
  id: "0000000",
  date: new Date("2023-11-03"),
  createdByUser: userMock,
  createdAt: new Date("2023-11-03"),
  updatedAt: new Date("2023-11-03"),
  updatedByUser: userMock,
  status: Status.InProgress,
};
export const transferAddItemResponseMockup: TransferAddItemResponse = {
  lineId: 123,
  closedTransfer: false,
  purPackUn: 5,
};


export const binCheckMockup: BinContentResponse[] = [
  {
    itemCode: "ITEM001",
    itemName: "Computer Mouse",
    onHand: 50,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ITEM002",
    itemName: "Keyboard",
    onHand: 30,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ITEM003",
    itemName: "Monitor",
    onHand: 15,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ITEM004",
    itemName: "Laptop",
    onHand: 25,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  },
  {
    itemCode: "ITEM005",
    itemName: "Printer",
    onHand: 10,
    numInBuy: 12,
    buyUnitMsr: "Doz",
    purPackUn: 4,
    purPackMsr: "Box"
  }
]