import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Item, UnitType } from '@/assets';
import { ObjectType } from '@/pages/packages/types';

export interface PackageValue {
  id: string;
  barcode: string;
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
  addActionIcon?: IconProp;
  pickPackOnly?: boolean;
  enablePackage?: boolean;
  currentPackage?: PackageValue | null;
  objectType?: ObjectType;
  objectId?: string;
  objectNumber?: number;
}

export interface BarCodeScannerRef {
  clear: () => void;
  focus: () => void;
  getValue: () => string;
}