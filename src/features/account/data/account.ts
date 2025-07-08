export enum AccountState {
  Invalid = 'Invalid',
  Active = 'Active',
  PaymentDue = 'PaymentDue',
  PaymentDueUnknown = 'PaymentDueUnknown',
  Disabled = 'Disabled',
  Demo = 'Demo',
  DemoExpired = 'DemoExpired',
}

export interface AccountStatus {
  status: AccountState;
  expirationDate?: Date;
  paymentCycleDate?: Date;
  demoExpirationDate?: Date;
  inactiveReason?: string;
  lastValidationTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

