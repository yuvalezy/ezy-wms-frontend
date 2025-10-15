export enum ObjectType {
  GoodsReceipt = "GoodsReceipt",
  InventoryCounting = "InventoryCounting",
  Transfer = "Transfer",
  Picking = "Picking",
  Package = "Package"
}

export type ObjectAction = "approve" | "reject" | "cancel" | "process";