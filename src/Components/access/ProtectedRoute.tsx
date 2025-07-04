import React from 'react';
import { Navigate } from 'react-router-dom';
import { AccessControlRule } from '../../types/accessControl';
import { useAccessControl } from '../../contexts/AccessControlContext';
import { AccessDeniedScreen } from './AccessDeniedScreen';

interface ProtectedRouteProps {
  routeName?: string;
  rule?: AccessControlRule;
  redirectTo?: string;
  showAccessDenied?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  routeName,
  rule,
  redirectTo = '/unauthorized',
  showAccessDenied = true,
  fallback,
  children
}: ProtectedRouteProps): React.ReactElement => {
  const { 
    canAccess, 
    canAccessRoute, 
    getAccessDeniedInfo,
    isInitialized,
    isLoading 
  } = useAccessControl();

  // Show loading while access control is initializing
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check access based on rule or route name
  const hasAccess = rule ? canAccess(rule) : (routeName ? canAccessRoute(routeName) : true);

  if (!hasAccess) {
    if (showAccessDenied && rule) {
      const deniedInfo = getAccessDeniedInfo(rule);
      return <AccessDeniedScreen deniedInfo={deniedInfo} />;
    }
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};