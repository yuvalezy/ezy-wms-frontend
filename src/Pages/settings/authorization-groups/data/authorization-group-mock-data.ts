import { AuthorizationGroup, RoleInfo } from "./authorization-group";
import { RoleType } from "@/assets";

export const roleInfoMap = new Map<RoleType, RoleInfo>([
  [RoleType.GOODS_RECEIPT, {
    role: RoleType.GOODS_RECEIPT,
    displayName: "Goods Receipt",
    description: "Process incoming goods and update inventory",
    category: "Operations"
  }],
  [RoleType.GOODS_RECEIPT_SUPERVISOR, {
    role: RoleType.GOODS_RECEIPT_SUPERVISOR,
    displayName: "Goods Receipt Supervisor",
    description: "Supervise goods receipt operations and generate reports",
    category: "Supervision"
  }],
  [RoleType.GOODS_RECEIPT_CONFIRMATION, {
    role: RoleType.GOODS_RECEIPT_CONFIRMATION,
    displayName: "Goods Receipt Confirmation",
    description: "Confirm and validate received goods",
    category: "Operations"
  }],
  [RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR, {
    role: RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
    displayName: "Goods Receipt Confirmation Supervisor",
    description: "Supervise goods receipt confirmation processes",
    category: "Supervision"
  }],
  [RoleType.PICKING, {
    role: RoleType.PICKING,
    displayName: "Picking",
    description: "Pick items for orders and shipments",
    category: "Operations"
  }],
  [RoleType.PICKING_SUPERVISOR, {
    role: RoleType.PICKING_SUPERVISOR,
    displayName: "Picking Supervisor",
    description: "Supervise picking operations and manage assignments",
    category: "Supervision"
  }],
  [RoleType.COUNTING, {
    role: RoleType.COUNTING,
    displayName: "Inventory Counting",
    description: "Perform physical inventory counts and cycle counts",
    category: "Operations"
  }],
  [RoleType.COUNTING_SUPERVISOR, {
    role: RoleType.COUNTING_SUPERVISOR,
    displayName: "Counting Supervisor",
    description: "Supervise inventory counting activities and resolve discrepancies",
    category: "Supervision"
  }],
  [RoleType.TRANSFER, {
    role: RoleType.TRANSFER,
    displayName: "Transfer",
    description: "Move inventory between locations and warehouses",
    category: "Operations"
  }],
  [RoleType.TRANSFER_SUPERVISOR, {
    role: RoleType.TRANSFER_SUPERVISOR,
    displayName: "Transfer Supervisor", 
    description: "Supervise transfer operations and approve movements",
    category: "Supervision"
  }],
  [RoleType.TRANSFER_REQUEST, {
    role: RoleType.TRANSFER_REQUEST,
    displayName: "Transfer Request",
    description: "Create and manage transfer requests between locations",
    category: "Operations"
  }]
]);

export const mockAuthorizationGroups: AuthorizationGroup[] = [
  {
    id: "ag-001",
    name: "Warehouse Manager",
    description: "Full warehouse management access with all operational and supervisory permissions",
    authorizations: [
      RoleType.GOODS_RECEIPT,
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.GOODS_RECEIPT_CONFIRMATION,
      RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      RoleType.PICKING,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER,
      RoleType.TRANSFER_SUPERVISOR,
      RoleType.TRANSFER_REQUEST
    ],
    canDelete: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "ag-002",
    name: "Goods Receipt Operator",
    description: "Access to goods receipt operations only",
    authorizations: [RoleType.GOODS_RECEIPT],
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "ag-003",
    name: "Picking Operator",
    description: "Access to picking operations only",
    authorizations: [RoleType.PICKING],
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "ag-004",
    name: "Counting Operator",
    description: "Access to inventory counting operations only",
    authorizations: [RoleType.COUNTING],
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "ag-005",
    name: "Transfer Operator",
    description: "Access to transfer operations and requests",
    authorizations: [RoleType.TRANSFER, RoleType.TRANSFER_REQUEST],
    canDelete: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "ag-006",
    name: "Supervisors",
    description: "Supervisory access to all operational areas",
    authorizations: [
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER_SUPERVISOR
    ],
    canDelete: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "ag-007",
    name: "System Administrator",
    description: "Full system access including settings management",
    authorizations: [
      RoleType.GOODS_RECEIPT,
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.GOODS_RECEIPT_CONFIRMATION,
      RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      RoleType.PICKING,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER,
      RoleType.TRANSFER_SUPERVISOR,
      RoleType.TRANSFER_REQUEST,
      RoleType.SETTINGS
    ],
    canDelete: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
];