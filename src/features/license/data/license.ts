import {AccountStatus} from "@/features/account/data/account";

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
