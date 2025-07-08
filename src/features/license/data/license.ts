import {AccountStatus} from "@/features/account/data/account";

// export interface LicenseInfo {
//   accountStatus: AccountStatus;
//   deviceStatus: string;
//   expirationDate?: Date;
//   gracePeriodEnd?: Date;
//   demoExpirationDate?: Date;
//   featuresEnabled: string[];
//   maxDevices: number;
//   currentDeviceCount: number;
//   lastValidation: Date;
//   nextValidation: Date;
//   isOnline: boolean;
//   warningMessage?: string;
//   errorMessage?: string;
// }

// export interface LicenseValidationResult {
//   isValid: boolean;
//   hasWarning: boolean;
//   canContinue: boolean;
//   message?: string;
//   details?: {
//     accountStatus: AccountStatus;
//     deviceStatus: string;
//     daysUntilExpiration?: number;
//     gracePeriodDays?: number;
//   };
// }

export interface LicenseStatusResponse {
  isValid: boolean;
  accountStatus: AccountStatus;
  expirationDate?: Date;
  daysUntilExpiration: number;
  isInGracePeriod: boolean;
  warning?: LicenseWarning;
  showWarning: boolean;
}

export interface QueueStatusResponse {
  pendingEventCount: number;
  cloudServiceAvailable: boolean;
  lastChecked: Date;
}

// export interface LicenseError {
//   code: string;
//   message: string;
//   details?: any;
//   recoverable: boolean;
//   recoveryActions?: LicenseRecoveryAction[];
// }

// export interface LicenseRecoveryAction {
//   id: string;
//   label: string;
//   description: string;
//   action: () => Promise<void>;
//   isPrimary: boolean;
//   isDestructive: boolean;
// }

export interface LicenseWarning {
  type: LicenseWarningType;
  data: any[];
}


export enum LicenseWarningType {
  LicenseIssueDetected = 'LicenseIssueDetected',
  PaymentDue           = 'PaymentDue', // "Payment is due. Please contact support."
  PaymentStatusUnknown = 'PaymentStatusUnknown', //$"Payment status unknown. System will be disabled in {result.DaysUntilExpiration} days."
  AccountExpiresIn     = 'AccountExpiresIn', //$"Account expires in {result.DaysUntilExpiration} days. Please renew."
}
