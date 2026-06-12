import React from 'react';
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {AlertCircle, CheckCircle, Clock, RefreshCw, Shield, X} from "lucide-react";
import {LicenseStatusResponse, LicenseWarning, LicenseWarningType} from "../data/license";
import {AccountStatus} from "@/features/account/data/account";

interface LicenseStatusProps {
  data: LicenseStatusResponse;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const LicenseStatus: React.FC<LicenseStatusProps> = ({
  data,
  onRefresh,
  isLoading = false
}) => {
  const {t} = useTranslation();

  const getStatusConfig = (status: AccountStatus) => {
    switch (status.status) {
      case 'Active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeClassName: 'border-green-200 bg-green-50 text-green-700',
          icon: <CheckCircle className="h-5 w-5"/>
        };
      case 'PaymentDue':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeClassName: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          icon: <Clock className="h-5 w-5"/>
        };
      case 'PaymentDueUnknown':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeClassName: 'border-orange-200 bg-orange-50 text-orange-700',
          icon: <AlertCircle className="h-5 w-5"/>
        };
      case 'Disabled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeClassName: 'border-red-200 bg-red-50 text-red-700',
          icon: <X className="h-5 w-5"/>
        };
      case 'Demo':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeClassName: 'border-blue-200 bg-blue-50 text-blue-700',
          icon: <Shield className="h-5 w-5"/>
        };
      case 'DemoExpired':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeClassName: 'border-gray-200 bg-gray-50 text-gray-700',
          icon: <Clock className="h-5 w-5"/>
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeClassName: 'border-gray-200 bg-gray-50 text-gray-700',
          icon: <AlertCircle className="h-5 w-5"/>
        };
    }
  };

  const parseDate = (value?: Date | string | null) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value?: Date | string | null) => {
    const date = parseDate(value);
    return date ? date.toLocaleDateString() : '-';
  };

  const formatDateTime = (value?: Date | string | null) => {
    const date = parseDate(value);
    return date ? date.toLocaleString() : '-';
  };

  const getWarningMessage = (warning: LicenseWarning) => {
    switch (warning.type) {
      case LicenseWarningType.PaymentDue:
        return t('license.warning.paymentDue');
      case LicenseWarningType.PaymentStatusUnknown:
        return t('license.warning.paymentStatusUnknown', {days: data.daysUntilExpiration});
      case LicenseWarningType.AccountExpiresIn:
        return t('license.warning.accountExpiresIn', {days: data.daysUntilExpiration});
      case LicenseWarningType.LicenseIssueDetected:
        return t('license.warning.licenseIssueDetected');
      default:
        return t('license.warning.unknown');
    }
  };

  const config = getStatusConfig(data.accountStatus);
  const expirationStatus = !data.expirationDate ?
    t('license.expirationUnknown', 'Unknown') :
    data.daysUntilExpiration > 0 ?
      t('license.daysRemaining', {days: data.daysUntilExpiration}) :
      t('expired');

  const DetailItem = ({label, value}: { label: string; value: React.ReactNode }) => (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-gray-950">{value}</dd>
    </div>
  );

  return (
    <Card className="gap-0 overflow-hidden rounded-lg py-0">
      <CardHeader className="border-b bg-white px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor} ${config.color}`}>
              {config.icon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-gray-950">{t('license.status')}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={config.badgeClassName}>{data.accountStatus.status}</Badge>
                <span className="text-xs font-medium text-gray-500">
                  {data.isValid ? t('valid') : t('invalid')}
                </span>
              </div>
            </div>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
            {isLoading ? t('loading') : t('refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-4 py-4 md:px-5">
        <dl className="grid overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.daysUntilExpiration')}
              value={expirationStatus}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.validity')}
              value={data.isValid ? t('valid') : t('invalid')}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.gracePeriod')}
              value={data.isInGracePeriod ? t('yes') : t('no')}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.lastValidation')}
              value={formatDateTime(data.accountStatus.lastValidationTimestamp)}
            />
          </div>
        </dl>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label={t('license.accountStatus')}
            value={<Badge variant="outline" className={config.badgeClassName}>{data.accountStatus.status}</Badge>}
          />

          {data.expirationDate && (
            <DetailItem
              label={t('license.expirationDate')}
              value={formatDate(data.expirationDate)}
            />
          )}

          {data.accountStatus.demoExpirationDate && (
            <DetailItem
              label={t('license.demoExpirationDate')}
              value={formatDate(data.accountStatus.demoExpirationDate)}
            />
          )}
        </dl>

        {data.showWarning && data.warning && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600"/>
              <div>
                <p className="text-sm font-semibold text-yellow-900">{t('warning')}</p>
                <p className="mt-1 text-sm text-yellow-800">
                  {getWarningMessage(data.warning)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
