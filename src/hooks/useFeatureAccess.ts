import { useCallback, useMemo } from 'react';
import { useAccessControl } from '../contexts/AccessControlContext';
import { AccessControlRule } from '../types/accessControl';

export const useFeatureAccess = (featureName: string, rule?: AccessControlRule) => {
  const { 
    canAccessFeature, 
    canAccess, 
    getAccessDeniedInfo, 
    isFeatureEnabled,
    isInitialized,
    isLoading 
  } = useAccessControl();

  const hasAccess = useMemo(() => {
    if (!isInitialized || isLoading) {
      return false;
    }
    
    return rule ? canAccess(rule) : canAccessFeature(featureName);
  }, [isInitialized, isLoading, rule, canAccess, canAccessFeature, featureName]);

  const isEnabled = useMemo(() => {
    if (!isInitialized || isLoading) {
      return false;
    }
    
    return isFeatureEnabled(featureName);
  }, [isInitialized, isLoading, isFeatureEnabled, featureName]);

  const deniedInfo = useMemo(() => {
    if (!rule || hasAccess) {
      return null;
    }
    
    return getAccessDeniedInfo(rule);
  }, [rule, hasAccess, getAccessDeniedInfo]);

  const checkAccess = useCallback(() => {
    return rule ? canAccess(rule) : canAccessFeature(featureName);
  }, [rule, canAccess, canAccessFeature, featureName]);

  return {
    hasAccess,
    isEnabled,
    deniedInfo,
    checkAccess,
    isLoading: isLoading || !isInitialized
  };
};