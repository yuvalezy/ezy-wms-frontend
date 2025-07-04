export type AccountStatus = 
  | 'Active'
  | 'PaymentDue'
  | 'PaymentDueUnknown'
  | 'Disabled'
  | 'Demo'
  | 'DemoExpired';

export type AccessLevel = 'full' | 'limited' | 'readonly' | 'none';

export interface LicenseInfo {
  accountStatus: AccountStatus;
  deviceStatus: string;
  expirationDate?: Date;
  gracePeriodEnd?: Date;
  demoExpirationDate?: Date;
  featuresEnabled: string[];
  maxDevices: number;
  currentDeviceCount: number;
  lastValidation: Date;
  nextValidation: Date;
  isOnline: boolean;
  warningMessage?: string;
  errorMessage?: string;
}

export interface LicenseValidationResult {
  isValid: boolean;
  hasWarning: boolean;
  canContinue: boolean;
  message?: string;
  details?: {
    accountStatus: AccountStatus;
    deviceStatus: string;
    daysUntilExpiration?: number;
    gracePeriodDays?: number;
  };
}

export interface LicenseStatusResponse {
  accountStatus: AccountStatus;
  deviceStatus: string;
  expirationDate?: string;
  gracePeriodEnd?: string;
  demoExpirationDate?: string;
  featuresEnabled: string[];
  maxDevices: number;
  currentDeviceCount: number;
  lastValidation: string;
  nextValidation: string;
  isOnline: boolean;
  warningMessage?: string;
  errorMessage?: string;
}

export interface LicenseError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  recoveryActions?: LicenseRecoveryAction[];
}

export interface LicenseRecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<void>;
  isPrimary: boolean;
  isDestructive: boolean;
}