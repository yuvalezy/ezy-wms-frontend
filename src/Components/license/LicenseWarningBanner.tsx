import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { useLicense } from '../../contexts/LicenseContext';

export const LicenseWarningBanner: React.FC = () => {
  const { licenseInfo, validationResult, hasWarnings } = useLicense();
  const [isDismissed, setIsDismissed] = useState(false);

  const getWarningMessage = (): string | null => {
    if (validationResult?.hasWarning && validationResult.message) {
      return validationResult.message;
    }
    
    if (licenseInfo?.warningMessage) {
      return licenseInfo.warningMessage;
    }
    
    // Generate warning based on status
    if (licenseInfo?.accountStatus === 'PaymentDue') {
      return 'Payment is due. Please update your payment method to avoid service interruption.';
    }
    
    if (licenseInfo?.accountStatus === 'PaymentDueUnknown') {
      return 'Unable to verify payment status. Operating in offline mode with limited functionality.';
    }
    
    if (licenseInfo?.accountStatus === 'Demo') {
      const daysLeft = licenseInfo.demoExpirationDate 
        ? Math.ceil((licenseInfo.demoExpirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      if (daysLeft <= 7) {
        return `Demo expires in ${daysLeft} days. Upgrade to continue using all features.`;
      }
    }

    if (licenseInfo && licenseInfo.currentDeviceCount >= licenseInfo.maxDevices) {
      return 'Device limit reached. Remove unused devices or upgrade your license to add more devices.';
    }

    // Check for license expiration
    if (licenseInfo?.expirationDate) {
      const daysUntilExpiration = Math.ceil((licenseInfo.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        return `License expires in ${daysUntilExpiration} days. Renew your license to avoid service interruption.`;
      }
    }
    
    return null;
  };

  const getWarningStyle = () => {
    if (licenseInfo?.accountStatus === 'PaymentDue') {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
      };
    }
    
    if (licenseInfo?.accountStatus === 'PaymentDueUnknown') {
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600'
      };
    }

    if (licenseInfo?.accountStatus === 'Demo') {
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
      };
    }
    
    return {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    };
  };

  const warningMessage = getWarningMessage();

  if (!hasWarnings || !warningMessage || isDismissed) {
    return null;
  }

  const styles = getWarningStyle();

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const getActionButton = () => {
    if (licenseInfo?.accountStatus === 'PaymentDue') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => window.open('/billing', '_blank')}
        >
          Update Payment Method
        </Button>
      );
    }
    
    if (licenseInfo?.accountStatus === 'Demo') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-blue-300 text-blue-800 hover:bg-blue-100"
          onClick={() => window.open('/upgrade', '_blank')}
        >
          Upgrade Now
        </Button>
      );
    }

    if (licenseInfo && licenseInfo.currentDeviceCount >= licenseInfo.maxDevices) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => window.open('/devices', '_blank')}
        >
          Manage Devices
        </Button>
      );
    }

    if (licenseInfo?.expirationDate) {
      const daysUntilExpiration = Math.ceil((licenseInfo.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            onClick={() => window.open('/renew', '_blank')}
          >
            Renew License
          </Button>
        );
      }
    }

    return null;
  };

  return (
    <div className={`border rounded-lg p-4 ${styles.bgColor} ${styles.borderColor}`}>
      <div className="flex items-start gap-3">
        <svg 
          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`font-medium text-sm ${styles.textColor}`}>
                License Warning
              </p>
              <p className={`text-sm mt-1 ${styles.textColor}`}>
                {warningMessage}
              </p>
            </div>
            
            <button
              onClick={handleDismiss}
              className={`ml-4 flex-shrink-0 ${styles.textColor} hover:opacity-70`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {getActionButton() && (
            <div className="mt-3">
              {getActionButton()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};