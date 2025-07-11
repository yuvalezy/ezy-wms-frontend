import {ItemDataResponse, UnitType, UserAuditResponse} from "@/assets";

export interface PackageContentDto {
  id: string;
  packageId: string;
  itemCode: string;
  itemData?: ItemDataResponse;
  quantity: number;
  unitType: UnitType;
  whsCode: string;
  binCode?: string;
  createdAt: Date;
  createdBy?: UserAuditResponse;
}