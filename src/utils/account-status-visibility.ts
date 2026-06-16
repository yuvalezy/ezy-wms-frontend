import {AccountState} from '@/features/account/data/account';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Fallback defaults — used only when the backend does not deliver a `paymentAlert`
// spec on the CompanyInfo payload (older backend). When the spec is present these
// constants are ignored in favor of the configured windows / audience / enabled.
export const LOGIN_ACCOUNT_STATUS_WARNING_DAYS = 3;
export const AUTHENTICATED_ACCOUNT_STATUS_WARNING_DAYS = 30;

/**
 * Configurable payment-alert spec delivered by the backend on the CompanyInfo
 * response. Optional/partial-tolerant: any absent field falls back to today's
 * hardcoded behavior so an older backend (no spec) is behavior-identical.
 */
export interface PaymentAlertSpec {
  enabled?: boolean;
  loginWarnDays?: number;
  authenticatedWarnDays?: number;
  audience?: 'superuser' | 'all';
  showPaymentDetailAtLogin?: boolean;
}

export const getDaysUntilExpiration = (
  expirationDate?: string | Date | null,
  serverTime?: string | Date | null
) => {
  if (!expirationDate) return null;

  const expiration = new Date(expirationDate);
  if (Number.isNaN(expiration.getTime())) return null;

  const reference = serverTime ? new Date(serverTime) : new Date();
  if (Number.isNaN(reference.getTime())) return null;

  return Math.ceil((expiration.getTime() - reference.getTime()) / MS_PER_DAY);
};

const isWithinWarningWindow = (
  expirationDate: string | Date | null | undefined,
  serverTime: string | Date | null | undefined,
  warningDays: number
) => {
  const daysUntilExpiration = getDaysUntilExpiration(expirationDate, serverTime);
  return daysUntilExpiration !== null && daysUntilExpiration <= warningDays;
};

export const shouldShowLoginAccountStatusBanner = (
  accountStatus?: AccountState,
  expirationDate?: string | Date | null,
  serverTime?: string | Date | null,
  spec?: PaymentAlertSpec | null
) => {
  if (!accountStatus) return false;

  // Master switch: hard / blocking states still surface, but soft payment/demo
  // warnings are suppressed when alerting is disabled.
  const enabled = spec?.enabled !== false;

  if (
    accountStatus === AccountState.Invalid ||
    accountStatus === AccountState.Disabled ||
    accountStatus === AccountState.DemoExpired
  ) {
    return true;
  }

  if (!enabled) return false;

  const loginWarnDays = spec?.loginWarnDays ?? LOGIN_ACCOUNT_STATUS_WARNING_DAYS;

  return (
    accountStatus === AccountState.PaymentDue ||
    accountStatus === AccountState.PaymentDueUnknown ||
    accountStatus === AccountState.Demo
  ) && isWithinWarningWindow(expirationDate, serverTime, loginWarnDays);
};

export const shouldShowAuthenticatedAccountStatusBanner = (
  accountStatus: AccountState | undefined,
  expirationDate: string | Date | null | undefined,
  isSuperUser: boolean | undefined,
  serverTime?: string | Date | null,
  spec?: PaymentAlertSpec | null
) => {
  if (!accountStatus) return false;

  // Audience gate: by default only super users see the authenticated banner
  // (today's behavior). When configured `audience: 'all'`, regular warehouse
  // operators see it too — closes gap W-3.
  const audienceAllowsAll = spec?.audience === 'all';
  if (!audienceAllowsAll && !isSuperUser) return false;

  const enabled = spec?.enabled !== false;

  if (
    accountStatus === AccountState.Invalid ||
    accountStatus === AccountState.Disabled ||
    accountStatus === AccountState.DemoExpired
  ) {
    return true;
  }

  if (!enabled) return false;

  const authenticatedWarnDays =
    spec?.authenticatedWarnDays ?? AUTHENTICATED_ACCOUNT_STATUS_WARNING_DAYS;

  return (
    accountStatus === AccountState.Active ||
    accountStatus === AccountState.PaymentDue ||
    accountStatus === AccountState.PaymentDueUnknown ||
    accountStatus === AccountState.Demo
  ) && isWithinWarningWindow(expirationDate, serverTime, authenticatedWarnDays);
};
