import {AlertSeverity} from "@/components";
import {User} from "@/features/users/data/user";

export interface BaseEntity {
  id: string;
  createdAt?: Date;
  createdByUser?: User;
  updatedAt?: Date;
  updatedByUser?: User;
  deleted: boolean;
  deletedAt?: Date;
}

export interface UpdateLineParameters {
  id: string;
  lineId: string;
  comment?: string;
  userName?: string;
  quantity?: number;
  reason?: number;
}

export enum UpdateLineReturnValue {
  Status = "Status",
  LineStatus = "LineStatus",
  CloseReason = "CloseReason",
  Ok = "Ok",
  SupervisorPassword = "SupervisorPassword",
  NotSupervisor = "NotSupervisor",
  QuantityMoreThenAvailable = "QuantityMoreThenAvailable",
}

export enum Status {
  Open = "Open",
  Processing = "Processing",
  Finished = "Finished",
  Cancelled = "Cancelled",
  InProgress = "InProgress",
  WaitingForApproval = "WaitingForApproval",
}

export type AddItemResponseMultipleValue = {
  message: string;
  severity: AlertSeverity;
};

export type DetailUpdateParameters = {
  id: string;
  removeRows: string[];
  quantityChanges: { [key: string]: number }
};

export enum UnitType {
  Unit = 'Unit',
  Dozen = 'Dozen',
  Pack = 'Pack'
}

export enum ProcessType {
  Regular = 'regular',
  Confirmation = 'confirmation',
  TransferConfirmation = 'transferConfirmation'
}

export enum LineStatus {
  Open = 0,
  Closed = 1,
  Processing = 2,
  Finished = 3
}

export enum AddItemReturnValueType {
  Ok = 0,
  ItemCodeNotFound = -1,
  ItemCodeBarCodeMismatch = -2,
  TransactionIDNotExists = -3,
  NotAdded = -4,
  NotPurchaseItem = -5,
  ItemWasNotFoundInTransactionSpecificDocuments = -6,
  QuantityMoreThenReleased = -7,
  NotStockItem = -8,
  ItemNotInWarehouse = -9,
  BinNotExists = -10,
  BinNotInWarehouse = -11,
  BinMissing = -12,
  QuantityMoreAvailable = -13,
  PackageBinLocation = -14,
}
