import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLicense } from '../../contexts/LicenseContext';
import { useAccessControl } from '../../contexts/AccessControlContext';
import { LicenseError } from '../../types/license';

interface LicenseErrorHandlerProps {
  error?: LicenseError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
  className?: string;
}

export const LicenseErrorHandler: React.FC<LicenseErrorHandlerProps> = ({
  error: propError,
  onRetry,
  onDismiss,
  showDismiss = true,
  className
}) => {
  const { error: licenseError, refreshLicense } = useLicense();
  const { error: accessError, refresh: refreshAccess } = useAccessControl();
  const [isDismissed, setIsDismissed] = useState(false);

  const error = propError || licenseError || accessError;

  useEffect(() => {
    setIsDismissed(false);
  }, [error]);

  if (!error || isDismissed) {
    return null;
  }

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      try {
        await refreshLicense();
        await refreshAccess();
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getErrorType = () => {
    if (typeof error === 'string') {
      return 'general';
    }
    
    if ('code' in error) {
      return error.code;
    }
    
    return 'unknown';
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    
    if ('message' in error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return null;
    }
    
    if ('details' in error) {
      return error.details;
    }
    
    return null;
  };

  const isRecoverable = () => {
    if (typeof error === 'string') {
      return true;
    }
    
    if ('recoverable' in error) {
      return error.recoverable;
    }
    
    return true;
  };

  const getRecoveryActions = () => {
    if (typeof error === 'string') {
      return [];
    }
    
    if ('recoveryActions' in error) {
      return error.recoveryActions || [];
    }
    
    return [];
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'NETWORK_ERROR':
        return (
          <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case 'LICENSE_VALIDATION_ERROR':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'DEVICE_REGISTRATION_ERROR':
        return (
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorColor = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'border-orange-200 bg-orange-50';
      case 'LICENSE_VALIDATION_ERROR':
        return 'border-red-200 bg-red-50';
      case 'DEVICE_REGISTRATION_ERROR':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const recoveryActions = getRecoveryActions();
  const errorDetails = getErrorDetails();

  return (
    <div className={className}>
      <Alert className={`${getErrorColor()} border`}>
        <div className="flex items-start gap-3">
          {getErrorIcon()}
          
          <div className="flex-1 min-w-0">
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">License Error</p>
                  <p className="text-sm text-gray-700 mt-1">{getErrorMessage()}</p>
                </div>

                {errorDetails && (
                  <div className="text-xs text-gray-600 bg-white rounded p-2">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(errorDetails, null, 2)}</pre>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {isRecoverable() && (
                    <Button
                      size="sm"
                      onClick={handleRetry}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Try Again
                    </Button>
                  )}

                  {recoveryActions.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant={action.isPrimary ? "default" : "outline"}
                      onClick={action.action}
                      className={action.isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    >
                      {action.label}
                    </Button>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/support', '_blank')}
                  >
                    Contact Support
                  </Button>

                  {showDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};