import {LucideIcon} from 'lucide-react';
import {UnitType} from '@/features/shared/data';
import {ObjectType} from '@/features/packages/types';
import {ItemInfoResponse} from "@/features/items/data/items";

export interface PackageValue {
  id: string;
  barcode: string;
}

export interface PackageStockValue extends PackageValue{
  quantity: number;
}

export interface AddItemValue {
  item: ItemInfoResponse;
  unit: UnitType;
  createPackage: boolean;
  package?: PackageValue | null;
}

export interface BarCodeScannerProps {
  enabled: boolean;
  unit?: boolean;
  item?: boolean;
  onAddItem: (addItem: AddItemValue) => void;
  onAddPackage?: (value: PackageValue) => void;
  onPackageChanged?: (value: PackageValue) => void;
  onAddAction?: () => void;
  addActionLabel?: string;
  addActionIcon?: LucideIcon;
  pickPackOnly?: boolean;
  enablePackage?: boolean;
  enablePackageCreate?: boolean;
  isEphemeralPackage?: boolean;
  currentPackage?: PackageValue | null;
  objectType?: ObjectType;
  objectId?: string;
  objectNumber?: number;
  binEntry?: number | undefined;
}

export interface BarCodeScannerRef {
  clear: () => void;
  focus: () => void;
  getValue: () => string;
}