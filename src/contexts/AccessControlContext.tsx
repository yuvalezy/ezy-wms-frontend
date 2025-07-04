import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AccessControlRule, 
  AccessControlConfig, 
  AccessControlState, 
  AccessDeniedInfo,
  DEFAULT_ACCESS_CONTROL_CONFIG 
} from '../types/accessControl';
import { AccessLevel } from '../types/license';
import { accessControlService } from '../services/accessControlService';
import { useLicense } from './LicenseContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface AccessControlContextType {
  // State
  isInitialized: boolean;
  currentAccessLevel: AccessLevel;
  isLoading: boolean;
  error: string | null;
  
  // Access control methods
  canAccess: (rule: AccessControlRule) => boolean;
  canAccessFeature: (featureName: string) => boolean;
  canAccessRoute: (routeName: string) => boolean;
  getAccessLevel: () => AccessLevel;
  getBlockedReasons: (rule: AccessControlRule) => string[];
  getAccessDeniedInfo: (rule: AccessControlRule) => AccessDeniedInfo;
  isFeatureEnabled: (featureName: string) => boolean;
  
  // Utility methods
  hasValidLicense: () => boolean;
  isInGracePeriod: () => boolean;
  isDemoMode: () => boolean;
  isOfflineMode: () => boolean;
  
  // Actions
  refresh: () => Promise<void>;
  updateConfig: (config: Partial<AccessControlConfig>) => void;
  clearCache: () => void;
}

export const AccessControlContext = createContext<AccessControlContextType | null>(null);

export const useAccessControl = (): AccessControlContextType => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

interface AccessControlProviderProps {
  config?: Partial<AccessControlConfig>;
  children: React.ReactNode;
}

export const AccessControlProvider: React.FC<AccessControlProviderProps> = ({ 
  config = {}, 
  children 
}) => {
  const [state, setState] = useState<AccessControlState>({
    isInitialized: false,
    currentAccessLevel: 'none',
    enabledFeatures: [],
    blockedFeatures: [],
    accessRules: {},
    lastCheck: null,
    isOnline: true,
    gracePeriodEnd: null,
    offlineGracePeriodEnd: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { licenseInfo, isLoading: licenseLoading } = useLicense();
  const { isOnline } = useOnlineStatus();

  // Initialize service with config
  useEffect(() => {
    const fullConfig = { ...DEFAULT_ACCESS_CONTROL_CONFIG, ...config };
    accessControlService.updateConfig(fullConfig);
  }, [config]);

  // Initialize access control
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentAccessLevel = accessControlService.getAccessLevel(licenseInfo);
      const enabledFeatures = licenseInfo?.featuresEnabled || [];
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        currentAccessLevel,
        enabledFeatures,
        lastCheck: new Date(),
        isOnline,
        gracePeriodEnd: licenseInfo?.gracePeriodEnd || null,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize access control';
      setError(errorMessage);
      console.error('Access control initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [licenseInfo, isOnline]);

  // Initialize when license info is available
  useEffect(() => {
    if (!licenseLoading && licenseInfo) {
      initialize();
    }
  }, [licenseLoading, licenseInfo, initialize]);

  // Update online status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isOnline
    }));
  }, [isOnline]);

  // Access control methods
  const canAccess = useCallback((rule: AccessControlRule): boolean => {
    if (!state.isInitialized) {
      return false;
    }
    
    return accessControlService.canAccess(rule, licenseInfo, isOnline);
  }, [state.isInitialized, licenseInfo, isOnline]);

  const canAccessFeature = useCallback((featureName: string): boolean => {
    if (!state.isInitialized) {
      return false;
    }
    
    return accessControlService.canAccessFeature(featureName, licenseInfo, isOnline);
  }, [state.isInitialized, licenseInfo, isOnline]);

  const canAccessRoute = useCallback((routeName: string): boolean => {
    if (!state.isInitialized) {
      return false;
    }
    
    return accessControlService.canAccessRoute(routeName, licenseInfo, isOnline);
  }, [state.isInitialized, licenseInfo, isOnline]);

  const getAccessLevel = useCallback((): AccessLevel => {
    return accessControlService.getAccessLevel(licenseInfo);
  }, [licenseInfo]);

  const getBlockedReasons = useCallback((rule: AccessControlRule): string[] => {
    return accessControlService.getBlockedReasons(rule, licenseInfo, isOnline);
  }, [licenseInfo, isOnline]);

  const getAccessDeniedInfo = useCallback((rule: AccessControlRule): AccessDeniedInfo => {
    return accessControlService.getAccessDeniedInfo(rule, licenseInfo, isOnline);
  }, [licenseInfo, isOnline]);

  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    return accessControlService.isFeatureEnabled(featureName, licenseInfo);
  }, [licenseInfo]);

  // Utility methods
  const hasValidLicense = useCallback((): boolean => {
    return accessControlService.hasValidLicense(licenseInfo);
  }, [licenseInfo]);

  const isInGracePeriod = useCallback((): boolean => {
    return accessControlService.isInGracePeriodMode(licenseInfo);
  }, [licenseInfo]);

  const isDemoMode = useCallback((): boolean => {
    return accessControlService.isDemoMode(licenseInfo);
  }, [licenseInfo]);

  const isOfflineMode = useCallback((): boolean => {
    return accessControlService.isOfflineMode(isOnline);
  }, [isOnline]);

  // Actions
  const refresh = useCallback(async (): Promise<void> => {
    await initialize();
  }, [initialize]);

  const updateConfig = useCallback((newConfig: Partial<AccessControlConfig>): void => {
    accessControlService.updateConfig(newConfig);
    // Re-initialize with new config
    initialize();
  }, [initialize]);

  const clearCache = useCallback((): void => {
    accessControlService.clearCache();
  }, []);

  // Auto-refresh when license or online status changes
  useEffect(() => {
    if (state.isInitialized) {
      const timer = setTimeout(() => {
        refresh();
      }, 100); // Small delay to avoid rapid refreshes

      return () => clearTimeout(timer);
    }
  }, [licenseInfo, isOnline, state.isInitialized, refresh]);

  const contextValue: AccessControlContextType = {
    // State
    isInitialized: state.isInitialized,
    currentAccessLevel: state.currentAccessLevel,
    isLoading,
    error,
    
    // Access control methods
    canAccess,
    canAccessFeature,
    canAccessRoute,
    getAccessLevel,
    getBlockedReasons,
    getAccessDeniedInfo,
    isFeatureEnabled,
    
    // Utility methods
    hasValidLicense,
    isInGracePeriod,
    isDemoMode,
    isOfflineMode,
    
    // Actions
    refresh,
    updateConfig,
    clearCache,
  };

  return (
    <AccessControlContext.Provider value={contextValue}>
      {children}
    </AccessControlContext.Provider>
  );
};