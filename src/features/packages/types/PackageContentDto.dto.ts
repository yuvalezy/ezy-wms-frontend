import {UnitType} from "@/features/shared/data";
import {ItemDataResponse} from "@/features/packages/types/ItemDataResponse.dto";
import {UserAuditResponse} from "@/features/packages/types/UserAuditResponse.dto";

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