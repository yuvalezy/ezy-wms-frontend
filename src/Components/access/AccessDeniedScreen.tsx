import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessDeniedInfo } from '../../types/accessControl';

interface AccessDeniedScreenProps {
  deniedInfo: AccessDeniedInfo;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  deniedInfo,
  onRetry,
  onGoBack
}) => {
  const getIconForReason = () => {
    switch (deniedInfo.reason) {
      case 'PAYMENT_REQUIRED':
        return (
          <svg className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'DEMO_EXPIRED':
      case 'LICENSE_EXPIRED':
        return (
          <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ACCOUNT_DISABLED':
        return (
          <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      case 'OFFLINE_NOT_ALLOWED':
        return (
          <svg className="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case 'FEATURE_NOT_ENABLED':
        return (
          <svg className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  const getColorScheme = () => {
    switch (deniedInfo.reason) {
      case 'PAYMENT_REQUIRED':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'DEMO_EXPIRED':
      case 'LICENSE_EXPIRED':
      case 'ACCOUNT_DISABLED':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'OFFLINE_NOT_ALLOWED':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'FEATURE_NOT_ENABLED':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const handleUpgrade = () => {
    window.open('/upgrade', '_blank');
  };

  const handleContactSupport = () => {
    window.open('/support', '_blank');
  };

  const colors = getColorScheme();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${colors.bg} ${colors.border}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIconForReason()}
          </div>
          <CardTitle className={`text-2xl font-bold ${colors.text}`}>
            Access Denied
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className={`${colors.bg} ${colors.border}`}>
            <AlertDescription className={colors.text}>
              {deniedInfo.message}
            </AlertDescription>
          </Alert>

          {deniedInfo.gracePeriodRemaining !== undefined && deniedInfo.gracePeriodRemaining > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                Grace period: {deniedInfo.gracePeriodRemaining} day{deniedInfo.gracePeriodRemaining !== 1 ? 's' : ''} remaining
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            {deniedInfo.canRetry && (
              <Button
                onClick={handleRetry}
                className={`w-full text-white ${colors.button}`}
              >
                {deniedInfo.retryAction || 'Retry'}
              </Button>
            )}

            {deniedInfo.upgradeAvailable && (
              <Button
                onClick={handleUpgrade}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Upgrade Now
              </Button>
            )}

            {deniedInfo.contactSupport && (
              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                Contact Support
              </Button>
            )}

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Need help? Contact our support team</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};