import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AppContext';
import { RoleType } from '@/assets';
import { AccessControlRule } from '../types/accessControl';
import { useAccessControl } from '../contexts/AccessControlContext';
import { ProtectedRoute as AccessControlProtectedRoute } from './access/ProtectedRoute';

interface EnhancedProtectedRouteProps {
  element: React.ReactElement;
  authorization?: RoleType;
  authorizations?: RoleType[];
  superUser?: boolean;
  accessRule?: AccessControlRule;
  routeName?: string;
  enableAccessControl?: boolean;
}

const EnhancedProtectedRoute: React.FC<EnhancedProtectedRouteProps> = ({
  element,
  authorization,
  authorizations,
  superUser,
  accessRule,
  routeName,
  enableAccessControl = true,
  ...rest
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isInitialized: accessControlInitialized } = useAccessControl();

  if (isLoading) {
    return <div>Loading...</div>; // Or spinner
  }

  if (!isAuthenticated) {
    // If not authenticated, return a Navigate component to redirect to the login page
    return <Navigate to="/login" />;
  }

  // Check traditional role-based authorization first
  const hasRoleAccess = 
    (authorization !== undefined && (user?.roles.includes(authorization) || user?.superUser)) ||
    (authorizations !== undefined && (authorizations.some(auth => user?.roles.includes(auth)) || user?.superUser)) ||
    (superUser && user?.superUser) ||
    (authorization === undefined && authorizations === undefined && !superUser);

  if (!hasRoleAccess) {
    return <Navigate to="/unauthorized" />;
  }

  // If access control is enabled and initialized, use the access control system
  if (enableAccessControl && accessControlInitialized) {
    return (
      <AccessControlProtectedRoute
        rule={accessRule}
        routeName={routeName}
        showAccessDenied={true}
        fallback={<Navigate to="/unauthorized" />}
      >
        {React.cloneElement(element, rest)}
      </AccessControlProtectedRoute>
    );
  }

  // If access control is not enabled or not initialized, use traditional authorization
  return React.cloneElement(element, rest);
};

export default EnhancedProtectedRoute;