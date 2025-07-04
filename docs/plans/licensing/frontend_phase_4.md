# Phase 4: Access Control & Error Handling - Frontend

## Overview

Phase 4 completes the frontend licensing system by implementing comprehensive access control, error handling, and user guidance. This phase ensures that users have appropriate access based on their license status while providing clear feedback and recovery paths when issues occur.

## Objectives

- Implement license-based route protection and access control
- Create comprehensive error handling with user-friendly messages
- Build feature-level access control and UI restrictions
- Provide guided recovery flows for license issues
- Implement graceful degradation for offline scenarios
- Create comprehensive user feedback and notification systems

## Technical Implementation

### 1. Access Control Types and Interfaces

#### Access Control Types
```typescript
// src/types/accessControl.ts
export type AccessLevel = 'full' | 'limited' | 'readonly' | 'none';

export interface FeatureAccess {
  featureId: string;
  featureName: string;
  accessLevel: AccessLevel;
  isEnabled: boolean;
  requiresUpgrade: boolean;
  description?: string;
  upgradeMessage?: string;
}

export interface RouteAccess {
  path: string;
  accessLevel: AccessLevel;
  requiresLicense: boolean;
  allowedStates: AccountStatus[];
  redirectPath?: string;
  errorMessage?: string;
}

export interface AccessControlConfig {
  features: FeatureAccess[];
  routes: RouteAccess[];
  defaultAccess: AccessLevel;
  gracePeriodAccess: AccessLevel;
  demoAccess: AccessLevel;
}

export interface LicenseError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  recoveryActions?: LicenseRecoveryAction[];
}

export interface LicenseRecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<void>;
  isPrimary: boolean;
  isDestructive: boolean;
}
```

#### Access Control Service
```typescript
// src/services/accessControlService.ts
export class AccessControlService {
  private config: AccessControlConfig;
  private licenseInfo: LicenseInfo | null = null;

  constructor(config: AccessControlConfig) {
    this.config = config;
  }

  updateLicenseInfo(licenseInfo: LicenseInfo | null) {
    this.licenseInfo = licenseInfo;
  }

  canAccessRoute(path: string): boolean {
    const routeConfig = this.config.routes.find(route => 
      path.startsWith(route.path)
    );

    if (!routeConfig) {
      return true; // Allow access to unconfigured routes
    }

    if (!routeConfig.requiresLicense) {
      return true;
    }

    if (!this.licenseInfo) {
      return false;
    }

    return routeConfig.allowedStates.includes(this.licenseInfo.accountStatus);
  }

  canAccessFeature(featureId: string): FeatureAccess {
    const defaultFeature: FeatureAccess = {
      featureId,
      featureName: featureId,
      accessLevel: 'none',
      isEnabled: false,
      requiresUpgrade: true,
      description: 'Feature not configured',
      upgradeMessage: 'Please upgrade your license to access this feature'
    };

    const featureConfig = this.config.features.find(f => f.featureId === featureId);
    if (!featureConfig) {
      return defaultFeature;
    }

    if (!this.licenseInfo) {
      return {
        ...featureConfig,
        isEnabled: false,
        accessLevel: 'none',
        requiresUpgrade: true
      };
    }

    const accessLevel = this.calculateAccessLevel(featureConfig);
    
    return {
      ...featureConfig,
      accessLevel,
      isEnabled: accessLevel !== 'none',
      requiresUpgrade: accessLevel === 'none' || accessLevel === 'readonly'
    };
  }

  getAccessLevel(): AccessLevel {
    if (!this.licenseInfo) {
      return 'none';
    }

    switch (this.licenseInfo.accountStatus) {
      case 'Active':
        return 'full';
      case 'PaymentDue':
        return 'limited';
      case 'PaymentDueUnknown':
        return this.config.gracePeriodAccess;
      case 'Demo':
        return this.config.demoAccess;
      case 'DemoExpired':
        return 'readonly';
      case 'Disabled':
        return 'none';
      default:
        return this.config.defaultAccess;
    }
  }

  private calculateAccessLevel(feature: FeatureAccess): AccessLevel {
    if (!this.licenseInfo) {
      return 'none';
    }

    const globalAccess = this.getAccessLevel();
    
    // If global access is none, feature access is none
    if (globalAccess === 'none') {
      return 'none';
    }

    // If feature is explicitly enabled in license
    if (this.licenseInfo.featuresEnabled.includes(feature.featureId)) {
      return globalAccess;
    }

    // Feature not in license - check if it's a demo feature
    if (this.licenseInfo.accountStatus === 'Demo' && feature.featureId.includes('demo')) {
      return globalAccess;
    }

    return 'none';
  }
}
```

### 2. Access Control Context and Provider

#### Access Control Context
```typescript
// src/contexts/AccessControlContext.tsx
export interface AccessControlContextType {
  accessLevel: AccessLevel;
  canAccess: (resource: string) => boolean;
  getFeatureAccess: (featureId: string) => FeatureAccess;
  getRouteAccess: (path: string) => RouteAccess | null;
  isFeatureEnabled: (featureId: string) => boolean;
  hasFullAccess: boolean;
  hasLimitedAccess: boolean;
  isReadOnly: boolean;
  isBlocked: boolean;
  refreshAccess: () => void;
}

export const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { licenseInfo } = useLicense();
  const [accessControlService] = useState(() => new AccessControlService(accessControlConfig));

  const accessLevel = useMemo(() => {
    accessControlService.updateLicenseInfo(licenseInfo);
    return accessControlService.getAccessLevel();
  }, [licenseInfo]);

  const canAccess = useCallback((resource: string) => {
    return accessControlService.canAccessRoute(resource);
  }, [accessControlService]);

  const getFeatureAccess = useCallback((featureId: string) => {
    return accessControlService.canAccessFeature(featureId);
  }, [accessControlService]);

  const getRouteAccess = useCallback((path: string) => {
    return accessControlConfig.routes.find(route => path.startsWith(route.path)) || null;
  }, []);

  const isFeatureEnabled = useCallback((featureId: string) => {
    return getFeatureAccess(featureId).isEnabled;
  }, [getFeatureAccess]);

  const refreshAccess = useCallback(() => {
    accessControlService.updateLicenseInfo(licenseInfo);
  }, [licenseInfo]);

  const value: AccessControlContextType = {
    accessLevel,
    canAccess,
    getFeatureAccess,
    getRouteAccess,
    isFeatureEnabled,
    hasFullAccess: accessLevel === 'full',
    hasLimitedAccess: accessLevel === 'limited',
    isReadOnly: accessLevel === 'readonly',
    isBlocked: accessLevel === 'none',
    refreshAccess
  };

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};
```

### 3. Route Protection Components

#### Protected Route Component
```typescript
// src/components/license/ProtectedRoute.tsx
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAccess?: AccessLevel;
  allowedStates?: AccountStatus[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  featureId?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredAccess = 'full',
  allowedStates,
  fallback,
  redirectTo,
  featureId
}) => {
  const { accessLevel, canAccess, isFeatureEnabled } = useAccessControl();
  const { licenseInfo } = useLicense();
  const location = useLocation();
  const navigate = useNavigate();

  const hasAccess = useMemo(() => {
    // Check general access level
    if (requiredAccess === 'full' && accessLevel !== 'full') {
      return false;
    }

    if (requiredAccess === 'limited' && !['full', 'limited'].includes(accessLevel)) {
      return false;
    }

    if (requiredAccess === 'readonly' && accessLevel === 'none') {
      return false;
    }

    // Check specific feature access
    if (featureId && !isFeatureEnabled(featureId)) {
      return false;
    }

    // Check route-specific access
    if (!canAccess(location.pathname)) {
      return false;
    }

    // Check allowed states
    if (allowedStates && licenseInfo) {
      return allowedStates.includes(licenseInfo.accountStatus);
    }

    return true;
  }, [accessLevel, requiredAccess, featureId, isFeatureEnabled, canAccess, location.pathname, allowedStates, licenseInfo]);

  useEffect(() => {
    if (!hasAccess && redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [hasAccess, redirectTo, navigate]);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
};
```

#### Access Denied Screen
```typescript
// src/components/license/AccessDeniedScreen.tsx
export const AccessDeniedScreen: React.FC = () => {
  const { licenseInfo } = useLicense();
  const { accessLevel } = useAccessControl();
  const navigate = useNavigate();

  const getAccessMessage = () => {
    if (!licenseInfo) {
      return {
        title: 'License Required',
        message: 'A valid license is required to access this feature.',
        actions: [
          { label: 'Register Device', action: () => navigate('/license/register') },
          { label: 'Contact Support', action: () => window.open('/support', '_blank') }
        ]
      };
    }

    switch (licenseInfo.accountStatus) {
      case 'Disabled':
        return {
          title: 'Account Disabled',
          message: 'Your account has been disabled. Please contact support to resolve this issue.',
          actions: [
            { label: 'Contact Support', action: () => window.open('/support', '_blank') }
          ]
        };
      
      case 'PaymentDue':
        return {
          title: 'Payment Required',
          message: 'Your payment is overdue. Please update your payment method to continue.',
          actions: [
            { label: 'Update Payment', action: () => window.open('/billing', '_blank') },
            { label: 'Contact Support', action: () => window.open('/support', '_blank') }
          ]
        };
      
      case 'DemoExpired':
        return {
          title: 'Demo Expired',
          message: 'Your demo period has ended. Upgrade to continue using all features.',
          actions: [
            { label: 'Upgrade Now', action: () => window.open('/upgrade', '_blank') },
            { label: 'Contact Sales', action: () => window.open('/sales', '_blank') }
          ]
        };
      
      default:
        return {
          title: 'Access Restricted',
          message: 'You don\'t have permission to access this feature.',
          actions: [
            { label: 'Upgrade License', action: () => window.open('/upgrade', '_blank') },
            { label: 'Go Back', action: () => navigate(-1) }
          ]
        };
    }
  };

  const accessMessage = getAccessMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="space-y-6">
            <div className="mx-auto h-24 w-24 flex items-center justify-center bg-red-100 rounded-full">
              <Lock className="h-12 w-12 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{accessMessage.title}</h2>
              <p className="text-gray-600">{accessMessage.message}</p>
            </div>
            
            <div className="space-y-2">
              {accessMessage.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant={index === 0 ? "default" : "outline"}
                  className="w-full"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 4. Feature-Level Access Control

#### Feature Guard Component
```typescript
// src/components/license/FeatureGuard.tsx
export interface FeatureGuardProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  requiredAccess?: AccessLevel;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  featureId,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredAccess = 'full'
}) => {
  const { getFeatureAccess } = useAccessControl();
  const featureAccess = getFeatureAccess(featureId);

  const hasAccess = useMemo(() => {
    if (!featureAccess.isEnabled) {
      return false;
    }

    switch (requiredAccess) {
      case 'full':
        return featureAccess.accessLevel === 'full';
      case 'limited':
        return ['full', 'limited'].includes(featureAccess.accessLevel);
      case 'readonly':
        return featureAccess.accessLevel !== 'none';
      default:
        return true;
    }
  }, [featureAccess, requiredAccess]);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt && featureAccess.requiresUpgrade) {
      return <UpgradePrompt featureAccess={featureAccess} />;
    }

    return null;
  }

  return <>{children}</>;
};

const UpgradePrompt: React.FC<{ featureAccess: FeatureAccess }> = ({ featureAccess }) => {
  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800">
            {featureAccess.featureName} - Premium Feature
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            {featureAccess.upgradeMessage || 'Upgrade your license to access this feature'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            onClick={() => window.open('/upgrade', '_blank')}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### 5. Error Handling Components

#### License Error Handler
```typescript
// src/components/license/LicenseErrorHandler.tsx
export interface LicenseErrorHandlerProps {
  error: LicenseError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const LicenseErrorHandler: React.FC<LicenseErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR': return WifiOff;
      case 'INVALID_LICENSE': return XCircle;
      case 'EXPIRED_LICENSE': return Clock;
      case 'DEVICE_LIMIT_EXCEEDED': return Smartphone;
      case 'PAYMENT_REQUIRED': return CreditCard;
      default: return AlertCircle;
    }
  };

  const ErrorIcon = getErrorIcon(error.code);

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ErrorIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-800">License Error</h4>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          
          {error.recoveryActions && error.recoveryActions.length > 0 && (
            <div className="mt-3 space-y-2">
              {error.recoveryActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={action.action}
                  variant={action.isPrimary ? "default" : "outline"}
                  size="sm"
                  className={action.isDestructive ? "border-red-300 text-red-800" : ""}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            {onRetry && error.recoverable && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-800 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-100"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 6. Custom Hooks

#### useAccessControl Hook
```typescript
// src/hooks/useAccessControl.ts
export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};
```

#### useFeatureAccess Hook
```typescript
// src/hooks/useFeatureAccess.ts
export const useFeatureAccess = (featureId: string) => {
  const { getFeatureAccess, isFeatureEnabled } = useAccessControl();
  
  const featureAccess = useMemo(() => {
    return getFeatureAccess(featureId);
  }, [getFeatureAccess, featureId]);

  const isEnabled = useMemo(() => {
    return isFeatureEnabled(featureId);
  }, [isFeatureEnabled, featureId]);

  return {
    ...featureAccess,
    isEnabled
  };
};
```

#### useLicenseError Hook
```typescript
// src/hooks/useLicenseError.ts
export const useLicenseError = () => {
  const [errors, setErrors] = useState<LicenseError[]>([]);

  const addError = useCallback((error: LicenseError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const removeError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const createError = useCallback((
    code: string,
    message: string,
    recoverable: boolean = true,
    recoveryActions: LicenseRecoveryAction[] = []
  ): LicenseError => {
    return {
      code,
      message,
      recoverable,
      recoveryActions
    };
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    createError,
    hasErrors: errors.length > 0
  };
};
```

### 7. Configuration

#### Access Control Configuration
```typescript
// src/config/accessControlConfig.ts
export const accessControlConfig: AccessControlConfig = {
  defaultAccess: 'none',
  gracePeriodAccess: 'limited',
  demoAccess: 'limited',
  
  features: [
    {
      featureId: 'goods_receipt',
      featureName: 'Goods Receipt',
      accessLevel: 'full',
      isEnabled: true,
      requiresUpgrade: false
    },
    {
      featureId: 'advanced_picking',
      featureName: 'Advanced Picking',
      accessLevel: 'full',
      isEnabled: true,
      requiresUpgrade: true,
      upgradeMessage: 'Advanced picking features require a premium license'
    },
    {
      featureId: 'inventory_reports',
      featureName: 'Inventory Reports',
      accessLevel: 'full',
      isEnabled: true,
      requiresUpgrade: true,
      upgradeMessage: 'Detailed inventory reports are available with premium licenses'
    },
    {
      featureId: 'multi_location',
      featureName: 'Multi-Location Management',
      accessLevel: 'full',
      isEnabled: true,
      requiresUpgrade: true,
      upgradeMessage: 'Multi-location features require an enterprise license'
    }
  ],
  
  routes: [
    {
      path: '/dashboard',
      accessLevel: 'readonly',
      requiresLicense: true,
      allowedStates: ['Active', 'PaymentDue', 'PaymentDueUnknown', 'Demo'],
      redirectPath: '/license/register'
    },
    {
      path: '/goods-receipt',
      accessLevel: 'limited',
      requiresLicense: true,
      allowedStates: ['Active', 'PaymentDue', 'Demo'],
      redirectPath: '/access-denied'
    },
    {
      path: '/picking',
      accessLevel: 'full',
      requiresLicense: true,
      allowedStates: ['Active'],
      redirectPath: '/upgrade'
    },
    {
      path: '/reports',
      accessLevel: 'full',
      requiresLicense: true,
      allowedStates: ['Active'],
      redirectPath: '/upgrade'
    }
  ]
};
```

## Integration Points

### 1. App.tsx Integration
```typescript
// src/App.tsx (modifications)
import { AccessControlProvider } from './contexts/AccessControlContext';

function App() {
  return (
    <DeviceProvider>
      <LicenseProvider>
        <CloudSyncProvider>
          <AccessControlProvider>
            <AuthProvider>
              <ThemeProvider>
                <Routes>
                  <Route path="/license/register" element={<DeviceRegistration />} />
                  <Route path="/access-denied" element={<AccessDeniedScreen />} />
                  <Route path="/upgrade" element={<UpgradeScreen />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredAccess="readonly">
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/goods-receipt/*" element={
                    <ProtectedRoute requiredAccess="limited" featureId="goods_receipt">
                      <GoodsReceiptModule />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/picking/*" element={
                    <ProtectedRoute requiredAccess="full" featureId="advanced_picking">
                      <PickingModule />
                    </ProtectedRoute>
                  } />
                </Routes>
              </ThemeProvider>
            </AuthProvider>
          </AccessControlProvider>
        </CloudSyncProvider>
      </LicenseProvider>
    </DeviceProvider>
  );
}
```

### 2. Feature Integration Examples
```typescript
// In component files, wrap features with FeatureGuard
<FeatureGuard featureId="advanced_picking">
  <AdvancedPickingPanel />
</FeatureGuard>

<FeatureGuard featureId="inventory_reports" showUpgradePrompt={true}>
  <DetailedReportsSection />
</FeatureGuard>
```

## Testing Requirements

### Unit Tests
- Access control service logic
- Route protection functionality
- Feature guard behavior
- Error handling components

### Integration Tests
- End-to-end access control flows
- License state transitions
- Error recovery scenarios
- User guidance workflows

## Performance Considerations

- Efficient access control checks
- Memoized permission calculations
- Optimized route protection
- Minimal re-renders on state changes

## Success Criteria

- [ ] Route protection works correctly
- [ ] Feature-level access control is enforced
- [ ] Error handling provides clear guidance
- [ ] User experience is smooth and intuitive
- [ ] Performance impact is minimal
- [ ] Recovery flows are effective

## Next Steps

1. Implement access control service and context
2. Create route protection components
3. Build feature-level access controls
4. Develop comprehensive error handling
5. Add user guidance and recovery flows
6. Create extensive test coverage
7. Optimize performance
8. Document access control patterns

This Phase 4 implementation completes the frontend licensing system with robust access control, comprehensive error handling, and excellent user experience throughout all license states and scenarios.