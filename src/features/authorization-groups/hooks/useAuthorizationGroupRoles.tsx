import {RoleInfo, RoleType} from "@/features/authorization-groups/data/authorization-group";

export const useAuthorizationGroupRoles = () => {
  const roleInfoMap = new Map<RoleType, RoleInfo>([
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
    // [RoleType.TRANSFER_REQUEST, {
    //   role: RoleType.TRANSFER_REQUEST,
    //   displayName: "Transfer Request",
    //   description: "Create and manage transfer requests between locations",
    //   category: "Operations"
    // }]
  ]);


  const getRoleInfo = (): RoleInfo[] => {
    return Array.from(roleInfoMap.values());
  }

  return {roleInfoMap, getRoleInfo}
};

