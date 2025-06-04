import { User, ExternalUser, AuthorizationGroup, Warehouse } from "./user";
import { RoleType } from "@/assets";

export const mockWarehouses: Warehouse[] = [
  {
    id: "wh-001",
    name: "Main Warehouse",
    enableBinLocations: true
  },
  {
    id: "wh-002", 
    name: "Secondary Warehouse",
    enableBinLocations: false
  },
  {
    id: "wh-003",
    name: "Distribution Center",
    enableBinLocations: true
  }
];

export const mockAuthorizationGroups: AuthorizationGroup[] = [
  {
    id: "ag-001",
    name: "Warehouse Manager",
    description: "Full warehouse management access",
    authorizations: [
      RoleType.GOODS_RECEIPT,
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.PICKING,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER,
      RoleType.TRANSFER_SUPERVISOR
    ]
  },
  {
    id: "ag-002",
    name: "Goods Receipt Operator",
    description: "Goods receipt operations only",
    authorizations: [RoleType.GOODS_RECEIPT]
  },
  {
    id: "ag-003",
    name: "Picking Operator",
    description: "Picking operations only",
    authorizations: [RoleType.PICKING]
  },
  {
    id: "ag-004",
    name: "Counting Operator",
    description: "Counting operations only",
    authorizations: [RoleType.COUNTING]
  },
  {
    id: "ag-005",
    name: "Transfer Operator",
    description: "Transfer operations only", 
    authorizations: [RoleType.TRANSFER, RoleType.TRANSFER_REQUEST]
  }
];

export const mockExternalUsers: ExternalUser[] = [
  {
    id: "ext-001",
    fullName: "John Smith",
    email: "john.smith@company.com",
    position: "Warehouse Supervisor",
    department: "Operations"
  },
  {
    id: "ext-002", 
    fullName: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    position: "Inventory Manager",
    department: "Logistics"
  },
  {
    id: "ext-003",
    fullName: "Mike Davis",
    email: "mike.davis@company.com", 
    position: "Operations Manager",
    department: "Operations"
  }
];

export const mockUsers: User[] = [
  {
    id: "u-001",
    fullName: "Administrator",
    email: "admin@company.com",
    position: "System Administrator",
    superUser: true,
    active: true,
    warehouses: mockWarehouses,
    authorizationGroupId: "ag-001",
    authorizationGroupName: "Warehouse Manager",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "u-002",
    fullName: "Maria Garcia",
    email: "maria.garcia@company.com",
    position: "Warehouse Supervisor",
    superUser: false,
    active: true,
    warehouses: [mockWarehouses[0], mockWarehouses[1]],
    authorizationGroupId: "ag-001",
    authorizationGroupName: "Warehouse Manager", 
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "u-003",
    fullName: "James Wilson",
    email: "james.wilson@company.com",
    position: "Goods Receipt Clerk",
    superUser: false,
    active: true,
    warehouses: [mockWarehouses[0]],
    authorizationGroupId: "ag-002",
    authorizationGroupName: "Goods Receipt Operator",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "u-004",
    fullName: "Lisa Chen",
    email: "lisa.chen@company.com",
    position: "Picker",
    superUser: false,
    active: true,
    warehouses: [mockWarehouses[0], mockWarehouses[2]],
    authorizationGroupId: "ag-003",
    authorizationGroupName: "Picking Operator",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: "u-005",
    fullName: "Robert Brown",
    email: "robert.brown@company.com",
    position: "Inventory Counter",
    superUser: false,
    active: false,
    warehouses: [mockWarehouses[1]],
    authorizationGroupId: "ag-004",
    authorizationGroupName: "Counting Operator",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-10")
  },
  {
    id: "u-006",
    fullName: "Anna Rodriguez", 
    email: "anna.rodriguez@company.com",
    position: "Transfer Specialist",
    superUser: false,
    active: true,
    warehouses: [mockWarehouses[2]],
    authorizationGroupId: "ag-005",
    authorizationGroupName: "Transfer Operator",
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05")
  }
];