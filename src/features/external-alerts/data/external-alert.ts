export interface ExternalSystemAlert {
  id: string;
  objectType: AlertableObjectType;
  externalUserId: string;
  externalUserName?: string;
  enabled: boolean;
  createdAt: string;
  createdByUserId?: string;
  updatedAt?: string;
  updatedByUserId?: string;
}

export interface ExternalSystemUser {
  userId: string;
  userName: string;
}

export interface ExternalSystemAlertRequest {
  objectType: AlertableObjectType;
  externalUserId: string;
  enabled: boolean;
}

export interface ExternalSystemAlertUpdateRequest {
  enabled: boolean;
}

export enum AlertableObjectType {
  Transfer = 0,
  GoodsReceipt = 1,
  InventoryCounting = 2,
  PickList = 3,
  ConfirmationAdjustments = 4,
  PickListCancellation = 5,
}
