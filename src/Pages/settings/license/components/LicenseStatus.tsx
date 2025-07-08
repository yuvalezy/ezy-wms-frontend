import React from 'react';
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Shield, AlertCircle, CheckCircle, Clock, X, RefreshCw} from "lucide-react";
import {LicenseStatusResponse, LicenseWarning, LicenseWarningType} from "../data/license";
import {AccountStatus} from "@/pages/settings/account/data/account";

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
          badgeVariant: 'default' as const,
          icon: <CheckCircle className="h-5 w-5"/>
        };
      case 'PaymentDue':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const,
          icon: <Clock className="h-5 w-5"/>
        };
      case 'PaymentDueUnknown':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'outline' as const,
          icon: <AlertCircle className="h-5 w-5"/>
        };
      case 'Disabled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          icon: <X className="h-5 w-5"/>
        };
      case 'Demo':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'outline' as const,
          icon: <Shield className="h-5 w-5"/>
        };
      case 'DemoExpired':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const,
          icon: <Clock className="h-5 w-5"/>
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const,
          icon: <AlertCircle className="h-5 w-5"/>
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
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

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={config.color}>
              {config.icon}
            </span>
            <span>{t('license.status')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
            {isLoading ? t('loading') : t('refresh')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.accountStatus')}</label>
              <div className="mt-1">
                <Badge variant={config.badgeVariant}>{data.accountStatus.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.validity')}</label>
              <div className="mt-1 text-sm text-gray-900">
                {data.isValid ? t('valid') : t('invalid')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.daysUntilExpiration')}</label>
              <div className="mt-1 text-sm text-gray-900">
                {data.daysUntilExpiration > 0 ? 
                  t('license.daysRemaining', {days: data.daysUntilExpiration}) : 
                  t('expired')
                }
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.gracePeriod')}</label>
              <div className="mt-1 text-sm text-gray-900">
                {data.isInGracePeriod ? t('yes') : t('no')}
              </div>
            </div>
          </div>

          {data.expirationDate && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.expirationDate')}</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(data.expirationDate.toString())}</div>
            </div>
          )}

          {data.accountStatus.demoExpirationDate && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.demoExpirationDate')}</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(data.accountStatus.demoExpirationDate.toString())}</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">{t('license.lastValidation')}</label>
            <div className="mt-1 text-sm text-gray-900">{formatDateTime(data.accountStatus.lastValidationTimestamp.toString())}</div>
          </div>


          {data.showWarning && data.warning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-sm font-medium text-yellow-800">{t('warning')}</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {getWarningMessage(data.warning)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};