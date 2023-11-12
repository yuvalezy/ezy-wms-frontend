import { ResponseStatus } from "./Common";

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
