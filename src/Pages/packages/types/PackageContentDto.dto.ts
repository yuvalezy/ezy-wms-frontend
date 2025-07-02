import { UnitType } from './UnitType.enum';

export interface PackageContentDto {
  id: string;
  packageId: string;
  itemCode: string;
  itemName?: string;
  quantity: number;
  unitType: UnitType;
  whsCode: string;
  binCode?: string;
  createdAt: Date;
  createdBy: string;
}