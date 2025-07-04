import { useMemo } from 'react';
import { useAccessControl } from '../contexts/AccessControlContext';
import { useLicense } from '../contexts/LicenseContext';

export const useLicenseStatus = () => {
  const { 
    hasValidLicense, 
    isInGracePeriod, 
    isDemoMode, 
    isOfflineMode,
    currentAccessLevel,
    isInitialized 
  } = useAccessControl();
  
  const { licenseInfo } = useLicense();

  const status = useMemo(() => {
    if (!isInitialized || !licenseInfo) {
      return {
        isValid: false,
        isActive: false,
        isDemo: false,
        isExpired: false,
        isDisabled: false,
        isPaymentDue: false,
        isInGracePeriod: false,
        isOffline: false,
        accessLevel: 'none' as const,
        daysUntilExpiration: null,
        gracePeriodDays: null,
        accountStatus: null
      };
    }

    const accountStatus = licenseInfo.accountStatus;
    const isValid = hasValidLicense();
    const isActive = accountStatus === 'Active';
    const isDemo = isDemoMode();
    const isExpired = accountStatus === 'DemoExpired';
    const isDisabled = accountStatus === 'Disabled';
    const isPaymentDue = accountStatus === 'PaymentDue' || accountStatus === 'PaymentDueUnknown';
    const isInGrace = isInGracePeriod();
    const isOffline = isOfflineMode();

    const getDaysUntilExpiration = () => {
      if (!licenseInfo.expirationDate) return null;
      
      const now = new Date();
      const expiration = licenseInfo.expirationDate;
      const diffTime = expiration.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    };

    const getGracePeriodDays = () => {
      if (!licenseInfo.gracePeriodEnd) return null;
      
      const now = new Date();
      const gracePeriodEnd = licenseInfo.gracePeriodEnd;
      const diffTime = gracePeriodEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    };

    return {
      isValid,
      isActive,
      isDemo,
      isExpired,
      isDisabled,
      isPaymentDue,
      isInGracePeriod: isInGrace,
      isOffline,
      accessLevel: currentAccessLevel,
      daysUntilExpiration: getDaysUntilExpiration(),
      gracePeriodDays: getGracePeriodDays(),
      accountStatus
    };
  }, [
    isInitialized,
    licenseInfo,
    hasValidLicense,
    isDemoMode,
    isInGracePeriod,
    isOfflineMode,
    currentAccessLevel
  ]);

  const getStatusMessage = () => {
    if (!status.isValid) {
      if (status.isDisabled) return 'Account disabled';
      if (status.isExpired) return 'License expired';
      return 'Invalid license';
    }

    if (status.isDemo) {
      return 'Demo mode';
    }

    if (status.isPaymentDue) {
      if (status.isInGracePeriod && status.gracePeriodDays) {
        return `Payment due - ${status.gracePeriodDays} days remaining`;
      }
      return 'Payment required';
    }

    if (status.isActive) {
      if (status.daysUntilExpiration !== null && status.daysUntilExpiration <= 30) {
        return `Expires in ${status.daysUntilExpiration} days`;
      }
      return 'Active';
    }

    if (status.isOffline) {
      return 'Offline mode';
    }

    return 'Unknown status';
  };

  const getStatusColor = () => {
    if (!status.isValid) return 'red';
    if (status.isDemo) return 'blue';
    if (status.isPaymentDue) return 'yellow';
    if (status.isActive) return 'green';
    if (status.isOffline) return 'orange';
    return 'gray';
  };

  const needsAttention = () => {
    return status.isPaymentDue || 
           status.isExpired || 
           status.isDisabled || 
           (status.daysUntilExpiration !== null && status.daysUntilExpiration <= 7);
  };

  return {
    ...status,
    statusMessage: getStatusMessage(),
    statusColor: getStatusColor(),
    needsAttention: needsAttention()
  };
};