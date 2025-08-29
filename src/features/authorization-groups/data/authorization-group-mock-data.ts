import {AuthorizationGroup, RoleType} from "./authorization-group";

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
    ],
    canDelete: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
];