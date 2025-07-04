import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LicenseInfo, LicenseValidationResult, LicenseError } from '../types/license';
import { LicenseService } from '../services/licenseService';
import { useDevice } from './DeviceContext';
import { axiosInstance } from '../utils/axios-instance';

export interface LicenseContextType {
  licenseInfo: LicenseInfo | null;
  validationResult: LicenseValidationResult | null;
  isLoading: boolean;
  error: string | null;
  isValidating: boolean;
  refreshLicense: () => Promise<void>;
  validateLicense: () => Promise<LicenseValidationResult>;
  clearError: () => void;
  isLicenseValid: boolean;
  hasWarnings: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

interface LicenseProviderProps {
  children: ReactNode;
}

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [validationResult, setValidationResult] = useState<LicenseValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { deviceUUID, registrationStatus } = useDevice();
  const licenseService = new LicenseService(axiosInstance, deviceUUID);

  const refreshLicense = async () => {
    if (registrationStatus !== 'registered') {
      return; // Don't fetch license info if device isn't registered
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const info = await licenseService.getLicenseStatus();
      setLicenseInfo(info);
      
      // Store in localStorage for offline access
      localStorage.setItem('licenseInfo', JSON.stringify({
        ...info,
        lastValidation: info.lastValidation.toISOString(),
        nextValidation: info.nextValidation.toISOString(),
        expirationDate: info.expirationDate?.toISOString(),
        gracePeriodEnd: info.gracePeriodEnd?.toISOString(),
        demoExpirationDate: info.demoExpirationDate?.toISOString()
      }));
    } catch (error: any) {
      setError(error.message);
      
      // Try to load from localStorage if available
      const cached = localStorage.getItem('licenseInfo');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          const cachedInfo: LicenseInfo = {
            ...parsedCache,
            lastValidation: new Date(parsedCache.lastValidation),
            nextValidation: new Date(parsedCache.nextValidation),
            expirationDate: parsedCache.expirationDate ? new Date(parsedCache.expirationDate) : undefined,
            gracePeriodEnd: parsedCache.gracePeriodEnd ? new Date(parsedCache.gracePeriodEnd) : undefined,
            demoExpirationDate: parsedCache.demoExpirationDate ? new Date(parsedCache.demoExpirationDate) : undefined,
            isOnline: false // Mark as offline since we're using cache
          };
          setLicenseInfo(cachedInfo);
        } catch (cacheError) {
          console.error('Failed to parse cached license info:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateLicense = async (): Promise<LicenseValidationResult> => {
    if (registrationStatus !== 'registered') {
      const fallbackResult: LicenseValidationResult = {
        isValid: false,
        hasWarning: true,
        canContinue: false,
        message: 'Device must be registered before license validation'
      };
      setValidationResult(fallbackResult);
      return fallbackResult;
    }

    setIsValidating(true);
    
    try {
      const result = await licenseService.validateLicense();
      setValidationResult(result);
      return result;
    } catch (error: any) {
      setError(error.message);
      const fallbackResult: LicenseValidationResult = {
        isValid: false,
        hasWarning: true,
        canContinue: false,
        message: 'Unable to validate license. Please check your connection.'
      };
      setValidationResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsValidating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Calculate derived state
  const isLicenseValid = React.useMemo(() => {
    return licenseInfo?.accountStatus === 'Active' && 
           licenseInfo?.deviceStatus === 'active';
  }, [licenseInfo]);

  const hasWarnings = React.useMemo(() => {
    if (!licenseInfo) return false;
    
    return licenseInfo.accountStatus === 'PaymentDue' ||
           licenseInfo.accountStatus === 'PaymentDueUnknown' ||
           (licenseInfo.accountStatus === 'Demo' && 
            licenseInfo.demoExpirationDate &&
            licenseInfo.demoExpirationDate.getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000) ||
           !!licenseInfo.warningMessage;
  }, [licenseInfo]);

  // Auto-refresh license info periodically when device is registered
  useEffect(() => {
    if (registrationStatus === 'registered') {
      refreshLicense();
      
      const interval = setInterval(refreshLicense, 10 * 60 * 1000); // 10 minutes
      
      return () => clearInterval(interval);
    }
  }, [registrationStatus]);

  // Validate license on mount and periodically
  useEffect(() => {
    if (registrationStatus === 'registered' && licenseInfo) {
      validateLicense();
      
      const interval = setInterval(validateLicense, 60 * 60 * 1000); // 1 hour
      
      return () => clearInterval(interval);
    }
  }, [registrationStatus, licenseInfo]);

  const value: LicenseContextType = {
    licenseInfo,
    validationResult,
    isLoading,
    error,
    isValidating,
    refreshLicense,
    validateLicense,
    clearError,
    isLicenseValid,
    hasWarnings
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};