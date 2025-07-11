import { LucideIcon } from 'lucide-react';
import { UnitType } from '@/assets';
import { ObjectType } from '@/features/packages/types';
import {Item} from "@/features/items/data/items";

export interface PackageValue {
  id: string;
  barcode: string;
}

export interface PackageStockValue extends PackageValue{
  quantity: number;
}

export interface AddItemValue {
  item: Item;
  unit: UnitType;
  createPackage: boolean;
  package?: PackageValue | null;
}

export interface BarCodeScannerProps {
  enabled: boolean;
  unit?: boolean;
  item?: boolean;
  onAddItem: (addItem: AddItemValue) => void;
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