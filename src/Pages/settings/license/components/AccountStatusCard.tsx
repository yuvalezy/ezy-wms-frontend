import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useLicense } from '../../contexts/LicenseContext';
import { AccountStatus } from '../../types/license';

export const AccountStatusCard: React.FC = () => {
  const { licenseInfo } = useLicense();

  if (!licenseInfo) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No license information available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = (status: AccountStatus) => {
    switch (status) {
      case 'Active':
        return {
          color: 'green',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          title: 'Active License',
          description: 'Your license is active and all features are available.'
        };
      case 'PaymentDue':
        return {
          color: 'yellow',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          title: 'Payment Due',
          description: 'Payment is required to maintain full access to features.'
        };
      case 'PaymentDueUnknown':
        return {
          color: 'orange',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
          borderColor: 'border-orange-200',
          title: 'Connection Issues',
          description: 'Unable to verify payment status. Operating in grace period.'
        };
      case 'Disabled':
        return {
          color: 'red',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          title: 'Account Disabled',
          description: 'Your account has been disabled. Contact support for assistance.'
        };
      case 'Demo':
        return {
          color: 'blue',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          title: 'Demo Account',
          description: 'You are using a demo account with limited features.'
        };
      case 'DemoExpired':
        return {
          color: 'gray',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          title: 'Demo Expired',
          description: 'Your demo period has ended. Upgrade to continue using the service.'
        };
      default:
        return {
          color: 'gray',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: 'Account status is unknown.'
        };
    }
  };

  const config = getStatusConfig(licenseInfo.accountStatus);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysUntil = (date: Date) => {
    const diffMs = date.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className={config.textColor}>
            {config.icon}
          </span>
          <div className="flex-1">
            <div className={`font-semibold ${config.textColor}`}>
              {config.title}
            </div>
            <div className="text-sm text-gray-600 font-normal">
              {config.description}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Status</span>
              <div className={`font-semibold ${config.textColor}`}>
                {licenseInfo.accountStatus}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Devices</span>
              <div className="text-gray-900">
                {licenseInfo.currentDeviceCount} / {licenseInfo.maxDevices}
              </div>
            </div>
          </div>

          {licenseInfo.expirationDate && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">License Expires</span>
              <div className="text-gray-900">
                {formatDate(licenseInfo.expirationDate)}
                {getDaysUntil(licenseInfo.expirationDate) <= 30 && (
                  <span className={`ml-2 font-medium ${config.textColor}`}>
                    ({getDaysUntil(licenseInfo.expirationDate)} days)
                  </span>
                )}
              </div>
            </div>
          )}
          
          {licenseInfo.demoExpirationDate && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Demo Expires</span>
              <div className="text-gray-900">
                {formatDate(licenseInfo.demoExpirationDate)}
                <span className={`ml-2 font-medium ${config.textColor}`}>
                  ({getDaysUntil(licenseInfo.demoExpirationDate)} days)
                </span>
              </div>
            </div>
          )}
          
          {licenseInfo.gracePeriodEnd && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Grace Period Ends</span>
              <div className="text-gray-900">
                {formatDate(licenseInfo.gracePeriodEnd)}
                <span className={`ml-2 font-medium ${config.textColor}`}>
                  ({getDaysUntil(licenseInfo.gracePeriodEnd)} days)
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {licenseInfo.accountStatus === 'PaymentDue' && (
              <Button 
                size="sm" 
                onClick={() => window.open('/billing', '_blank')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Update Payment
              </Button>
            )}
            
            {(licenseInfo.accountStatus === 'Demo' || licenseInfo.accountStatus === 'DemoExpired') && (
              <Button 
                size="sm" 
                onClick={() => window.open('/upgrade', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade Now
              </Button>
            )}
            
            {licenseInfo.accountStatus === 'Disabled' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('/support', '_blank')}
              >
                Contact Support
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};