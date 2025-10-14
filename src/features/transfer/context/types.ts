import {RefObject} from "react";
import {AddItemValue, BarCodeScannerRef, PackageValue, ProcessAlertValue, ProcessesRef} from "@/components";
import {BinLocation} from "@/features/items/data/items";
import {SourceTarget, TransferContent, TransferDocument} from "@/features/transfer/data/transfer";
import {UserInfo} from "@/features/login/data/login";

export interface TransferProcessContextType {
  // Transfer document state
  id: string | null;
  scanCode: string | undefined;
  info: TransferDocument | null;

  // Bin location state (shared across source and target)
  binLocation: BinLocation | null;
  onBinChanged: (bin: BinLocation, type: SourceTarget) => void;
  onBinClear: () => void;

  // Items/rows state
  rows: TransferContent[] | null;
  loadRows: (type: SourceTarget, binEntry?: number) => void;

  // Alert and process state
  currentAlert: ProcessAlertValue | null;
  handleQuantityChanged: (quantity: number) => void;
  handleCancel: (comment: string, cancel: boolean) => void;

  // Item operations
  isProcessingItem: boolean;
  handleAddItem: (type: SourceTarget, value: AddItemValue) => void;
  handleAddPackage: (type: SourceTarget, value: PackageValue) => void;

  // Refs
  barcodeRef: RefObject<BarCodeScannerRef | null>;
  processesRef: RefObject<ProcessesRef | null>;
  processAlertRef: RefObject<HTMLDivElement | null>;

  // User info
  user: UserInfo | null;

  // Loading state
  isLoading: boolean;

  // Enable state for barcode scanner
  enable: boolean;
  setEnable: (enable: boolean) => void;

  // Finish operation (for main process page)
  finish: () => void;
}
