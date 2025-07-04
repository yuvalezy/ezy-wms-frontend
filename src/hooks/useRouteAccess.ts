import { useCallback, useMemo } from 'react';
import { useAccessControl } from '../contexts/AccessControlContext';
import { AccessControlRule } from '../types/accessControl';

export const useRouteAccess = (routeName: string, rule?: AccessControlRule) => {
  const { 
    canAccessRoute, 
    canAccess, 
    getAccessDeniedInfo,
    isInitialized,
    isLoading 
  } = useAccessControl();

  const hasAccess = useMemo(() => {
    if (!isInitialized || isLoading) {
      return false;
    }
    
    return rule ? canAccess(rule) : canAccessRoute(routeName);
  }, [isInitialized, isLoading, rule, canAccess, canAccessRoute, routeName]);

  const deniedInfo = useMemo(() => {
    if (!rule || hasAccess) {
      return null;
    }
    
    return getAccessDeniedInfo(rule);
  }, [rule, hasAccess, getAccessDeniedInfo]);

  const checkAccess = useCallback(() => {
    return rule ? canAccess(rule) : canAccessRoute(routeName);
  }, [rule, canAccess, canAccessRoute, routeName]);

  return {
    hasAccess,
    deniedInfo,
    checkAccess,
    isLoading: isLoading || !isInitialized
  };
};