import {AccountState} from '@/features/account/data/account';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const LOGIN_ACCOUNT_STATUS_WARNING_DAYS = 3;
export const AUTHENTICATED_ACCOUNT_STATUS_WARNING_DAYS = 30;

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
  serverTime?: string | Date | null
) => {
  if (!accountStatus) return false;

  if (
    accountStatus === AccountState.Invalid ||
    accountStatus === AccountState.Disabled ||
    accountStatus === AccountState.DemoExpired
  ) {
    return true;
  }

  return (
    accountStatus === AccountState.PaymentDue ||
    accountStatus === AccountState.PaymentDueUnknown ||
    accountStatus === AccountState.Demo
  ) && isWithinWarningWindow(expirationDate, serverTime, LOGIN_ACCOUNT_STATUS_WARNING_DAYS);
};

export const shouldShowAuthenticatedAccountStatusBanner = (
  accountStatus: AccountState | undefined,
  expirationDate: string | Date | null | undefined,
  isSuperUser: boolean | undefined,
  serverTime?: string | Date | null
) => {
  if (!accountStatus || !isSuperUser) return false;

  if (
    accountStatus === AccountState.Invalid ||
    accountStatus === AccountState.Disabled ||
    accountStatus === AccountState.DemoExpired
  ) {
    return true;
  }

  return (
    accountStatus === AccountState.Active ||
    accountStatus === AccountState.PaymentDue ||
    accountStatus === AccountState.PaymentDueUnknown ||
    accountStatus === AccountState.Demo
  ) && isWithinWarningWindow(expirationDate, serverTime, AUTHENTICATED_ACCOUNT_STATUS_WARNING_DAYS);
};
