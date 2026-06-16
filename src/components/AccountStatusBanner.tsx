import React from 'react';
import {AlertCircle, AlertTriangle, CalendarClock, Clock, XCircle} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {AccountState} from '@/features/account/data/account';

interface AccountStatusBannerProps {
  accountStatus: AccountState;
  /** License/demo expiry or payment-due grace deadline (ISO string or Date). */
  expirationDate?: string | Date | null;
  variant?: 'authenticated' | 'login';
  showExpirationDate?: boolean;
  /**
   * When true on the login variant, payment states use the specific payment
   * message instead of the vague generic warning. Driven by the configurable
   * `paymentAlert.showPaymentDetailAtLogin` spec; defaults to today's vague text.
   */
  showPaymentDetailAtLogin?: boolean;
  className?: string;
}

const AccountStatusBanner: React.FC<AccountStatusBannerProps> = ({
  accountStatus,
  expirationDate,
  variant = 'authenticated',
  showExpirationDate = true,
  showPaymentDetailAtLogin = false,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const isLoginVariant = variant === 'login';
  // On login, payment states show the vague generic warning by default; when the
  // operator opts in via `showPaymentDetailAtLogin`, show the specific message.
  const useVagueLoginText = isLoginVariant && !showPaymentDetailAtLogin;

  const formattedExpiry = (() => {
    if (!expirationDate) return null;
    const date = new Date(expirationDate);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(i18n.language || undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  })();

  // Suffix appended to states where a *future* deadline is meaningful (demo,
  // payment-due grace). Empty when there is no usable date.
  const expirySuffix = showExpirationDate && formattedExpiry
    ? ' ' + t('accountStatusBanner.expiresOn', 'It expires on {{date}}.', { date: formattedExpiry })
    : '';

  const getBannerConfig = (status: AccountState) => {
    switch (status) {
      case AccountState.Invalid:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: XCircle,
          message: t('accountStatusBanner.invalid', 'Your account status is invalid. Please contact support.')
        };
      case AccountState.PaymentDue:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          message: useVagueLoginText
            ? t('accountStatusBanner.loginWarning', 'Your account needs attention soon. Please contact an administrator.')
            : t('accountStatusBanner.paymentDue', 'Payment is due for your account. Please update your payment method.') + expirySuffix
        };
      case AccountState.PaymentDueUnknown:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertCircle,
          message: useVagueLoginText
            ? t('accountStatusBanner.loginWarning', 'Your account needs attention soon. Please contact an administrator.')
            : t('accountStatusBanner.paymentDueUnknown', 'Payment status is unknown. Please contact support to verify your account.')
        };
      case AccountState.Demo:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Clock,
          message: useVagueLoginText
            ? t('accountStatusBanner.loginWarning', 'Your account needs attention soon. Please contact an administrator.')
            : t('accountStatusBanner.demo', 'You are using a demo license for testing purposes.') + expirySuffix
        };
      case AccountState.DemoExpired:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: XCircle,
          message: t('accountStatusBanner.demoExpired', 'Your demo license has expired. Please contact support to upgrade.')
        };
      case AccountState.Disabled:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: XCircle,
          message: t('accountStatusBanner.disabled', 'Your account has been disabled. Please contact support.')
        };
      case AccountState.Active:
        // A non-demo license can still carry an expiry date — surface it as a
        // neutral, informational strip (no banner at all if there is no date).
        if (!formattedExpiry) return null;
        return {
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          iconColor: 'text-slate-500',
          icon: CalendarClock,
          message: t('accountStatusBanner.licenseExpiresOn', 'Your license is valid until {{date}}.', { date: formattedExpiry })
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig(accountStatus);

  if (!config) {
    return null;
  }

  const { icon: Icon } = config;

  return (
    <div className={`flex items-center p-4 ${config.bgColor} border ${config.borderColor} rounded-lg ${className}`}>
      <Icon className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0`} />
      <p className={`text-sm font-medium ${config.textColor}`}>
        {config.message}
      </p>
    </div>
  );
};

export default AccountStatusBanner;
