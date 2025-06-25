import { CancellationReason } from "./cancellation-reason";

export const mockCancellationReasons: CancellationReason[] = [
  {
    id: "cr-001",
    name: "Item damaged during handling",
    isEnabled: true,
    transfer: true,
    goodsReceipt: true,
    counting: false,
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "cr-002",
    name: "Product past expiration date",
    isEnabled: true,
    transfer: false,
    goodsReceipt: true,
    counting: true,
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "cr-003",
    name: "Wrong item received",
    isEnabled: true,
    transfer: false,
    goodsReceipt: true,
    counting: false,
    canDelete: true,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16")
  },
  {
    id: "cr-004",
    name: "Quality does not meet standards",
    isEnabled: true,
    transfer: true,
    goodsReceipt: true,
    counting: true,
    canDelete: true,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17")
  },
  {
    id: "cr-005",
    name: "Duplicate order/item",
    isEnabled: false,
    transfer: true,
    goodsReceipt: true,
    counting: false,
    canDelete: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "cr-006",
    name: "Customer requested cancellation",
    isEnabled: true,
    transfer: false,
    goodsReceipt: true,
    counting: false,
    canDelete: true,
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-19")
  },
  {
    id: "cr-007",
    name: "Item out of stock",
    isEnabled: true,
    transfer: true,
    goodsReceipt: false,
    counting: true,
    canDelete: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "cr-008",
    name: "Pricing discrepancy",
    isEnabled: true,
    transfer: false,
    goodsReceipt: true,
    counting: false,
    canDelete: false,
    createdAt: new Date("2024-01-21"),
    updatedAt: new Date("2024-01-21")
  }
];