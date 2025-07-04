import React from 'react';
import { AccessControlRule } from '../../types/accessControl';
import { useAccessControl } from '../../contexts/AccessControlContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FeatureGuardProps {
  featureName?: string;
  rule?: AccessControlRule;
  fallback?: React.ReactNode;
  showError?: boolean;
  showUpgrade?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FeatureGuard = ({
  featureName,
  rule,
  fallback,
  showError = true,
  showUpgrade = true,
  className,
  children
}: FeatureGuardProps): React.ReactElement | null => {
  const { 
    canAccess, 
    canAccessFeature, 
    getAccessDeniedInfo,
    isDemoMode,
    isInitialized,
    isLoading 
  } = useAccessControl();

  // Show loading while access control is initializing
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check access based on rule or feature name
  const hasAccess = rule ? canAccess(rule) : (featureName ? canAccessFeature(featureName) : true);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showError) {
      return null;
    }

    // Get access denied info for better error messages
    const deniedInfo = rule ? getAccessDeniedInfo(rule) : null;
    const isDemo = isDemoMode();

    return (
      <div className={className}>
        <Alert className="border-yellow-200 bg-yellow-50">
          <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2">
              <p className="font-medium">
                {deniedInfo?.message || 'This feature is not available with your current license.'}
              </p>
              
              {isDemo && (
                <p className="text-sm">
                  You are using a demo version. Some features may be limited.
                </p>
              )}
              
              {showUpgrade && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => window.open('/upgrade', '_blank')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Upgrade Now
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/support', '_blank')}
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    Contact Support
                  </Button>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};