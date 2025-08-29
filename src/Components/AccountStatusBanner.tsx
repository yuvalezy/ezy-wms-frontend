import React from 'react';
import { AlertTriangle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AccountState } from '@/features/account/data/account';

interface AccountStatusBannerProps {
  accountStatus: AccountState;
  className?: string;
}

const AccountStatusBanner: React.FC<AccountStatusBannerProps> = ({ 
  accountStatus, 
  className = '' 
}) => {
  const { t } = useTranslation();

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
          message: t('accountStatusBanner.paymentDue', 'Payment is due for your account. Please update your payment method.')
        };
      case AccountState.PaymentDueUnknown:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertCircle,
          message: t('accountStatusBanner.paymentDueUnknown', 'Payment status is unknown. Please contact support to verify your account.')
        };
      case AccountState.Demo:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Clock,
          message: t('accountStatusBanner.demo', 'You are using a demo account with limited features.')
        };
      case AccountState.DemoExpired:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: XCircle,
          message: t('accountStatusBanner.demoExpired', 'Your demo account has expired. Please contact support to upgrade.')
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