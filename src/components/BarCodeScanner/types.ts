import {LucideIcon} from 'lucide-react';
import {ObjectType, UnitType} from '@/features/shared/data';
import {ItemInfoResponse} from "@/features/items/data/items";

export interface AddItemValue {
  item: ItemInfoResponse;
  unit: UnitType;
}

export interface BarCodeScannerProps {
  enabled: boolean;
  unit?: boolean;
  item?: boolean;
  onAddItem: (addItem: AddItemValue) => void;
  onAddAction?: () => void;
  addActionLabel?: string;
  addActionIcon?: LucideIcon;
  pickPackOnly?: boolean;
  objectType?: ObjectType;
}

export interface BarCodeScannerRef {
  clear: () => void;
  focus: () => void;
  getValue: () => string;
}
