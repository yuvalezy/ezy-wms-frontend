# Phase 2: License Status & Validation UI - Frontend

## Overview

Phase 2 focuses on building comprehensive license status management and validation UI components. This phase creates the user interface for displaying license information, account status, warnings, and validation results, while handling various license states gracefully.

## Objectives

- Implement license status dashboard and display components
- Create warning and notification system for license issues
- Build account status display with state-specific UI
- Implement grace period handling and countdown timers
- Create license validation integration with real-time updates

## Technical Implementation

### 1. License Status Management

#### License Types and States
```typescript
// src/types/license.ts
export type AccountStatus = 
  | 'Active'
  | 'PaymentDue'
  | 'PaymentDueUnknown'
  | 'Disabled'
  | 'Demo'
  | 'DemoExpired';

export type DeviceStatus = 
  | 'Active'
  | 'Inactive'
  | 'Disabled';

export interface LicenseInfo {
  accountStatus: AccountStatus;
  deviceStatus: DeviceStatus;
  expirationDate?: Date;
  gracePeriodEnd?: Date;
  demoExpirationDate?: Date;
  featuresEnabled: string[];
  maxDevices: number;
  currentDeviceCount: number;
  lastValidation: Date;
  nextValidation: Date;
  isOnline: boolean;
  warningMessage?: string;
  errorMessage?: string;
}

export interface LicenseValidationResult {
  isValid: boolean;
  hasWarning: boolean;
  canContinue: boolean;
  message?: string;
  details?: {
    accountStatus: AccountStatus;
    deviceStatus: DeviceStatus;
    daysUntilExpiration?: number;
    gracePeriodDays?: number;
  };
}
```

#### License Service
```typescript
// src/services/licenseService.ts
export class LicenseService {
  private axiosInstance: AxiosInstance;
  private deviceUUID: string;

  constructor(axiosInstance: AxiosInstance, deviceUUID: string) {
    this.axiosInstance = axiosInstance;
    this.deviceUUID = deviceUUID;
  }

  async getLicenseStatus(): Promise<LicenseInfo> {
    try {
      const response = await this.axiosInstance.get('/api/license/status');
      return this.transformLicenseResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to get license status: ${error.message}`);
    }
  }

  async validateLicense(): Promise<LicenseValidationResult> {
    try {
      const response = await this.axiosInstance.post('/api/license/validate');
      return response.data;
    } catch (error) {
      throw new Error(`License validation failed: ${error.message}`);
    }
  }

  async refreshLicenseCache(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/license/refresh');
    } catch (error) {
      throw new Error(`Failed to refresh license cache: ${error.message}`);
    }
  }

  private transformLicenseResponse(data: any): LicenseInfo {
    return {
      accountStatus: data.accountStatus,
      deviceStatus: data.deviceStatus,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      gracePeriodEnd: data.gracePeriodEnd ? new Date(data.gracePeriodEnd) : undefined,
      demoExpirationDate: data.demoExpirationDate ? new Date(data.demoExpirationDate) : undefined,
      featuresEnabled: data.featuresEnabled || [],
      maxDevices: data.maxDevices || 0,
      currentDeviceCount: data.currentDeviceCount || 0,
      lastValidation: new Date(data.lastValidation),
      nextValidation: new Date(data.nextValidation),
      isOnline: data.isOnline ?? true,
      warningMessage: data.warningMessage,
      errorMessage: data.errorMessage
    };
  }
}
```

### 2. License Context Provider

#### Context Implementation
```typescript
// src/contexts/LicenseContext.tsx
export interface LicenseContextType {
  licenseInfo: LicenseInfo | null;
  validationResult: LicenseValidationResult | null;
  isLoading: boolean;
  error: string | null;
  isValidating: boolean;
  refreshLicense: () => Promise<void>;
  validateLicense: () => Promise<LicenseValidationResult>;
  clearError: () => void;
}

export const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [validationResult, setValidationResult] = useState<LicenseValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { deviceUUID } = useDevice();
  const licenseService = new LicenseService(axiosInstance, deviceUUID);

  const refreshLicense = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await licenseService.getLicenseStatus();
      setLicenseInfo(info);
      
      // Store in localStorage for offline access
      localStorage.setItem('licenseInfo', JSON.stringify(info));
    } catch (error) {
      setError(error.message);
      
      // Try to load from localStorage if available
      const cached = localStorage.getItem('licenseInfo');
      if (cached) {
        setLicenseInfo(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateLicense = async (): Promise<LicenseValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = await licenseService.validateLicense();
      setValidationResult(result);
      return result;
    } catch (error) {
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

  // Auto-refresh license info periodically
  useEffect(() => {
    refreshLicense();
    
    const interval = setInterval(refreshLicense, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(interval);
  }, []);

  const value: LicenseContextType = {
    licenseInfo,
    validationResult,
    isLoading,
    error,
    isValidating,
    refreshLicense,
    validateLicense,
    clearError
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};
```

### 3. License Status Dashboard

#### Main Dashboard Component
```typescript
// src/components/license/LicenseStatusDashboard.tsx
export const LicenseStatusDashboard: React.FC = () => {
  const { licenseInfo, isLoading, error, refreshLicense } = useLicense();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading license information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">License Error</p>
            </div>
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={refreshLicense} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!licenseInfo) {
    return null;
  }

  return (
    <div className="space-y-4">
      <AccountStatusCard />
      <DeviceStatusCard />
      <LicenseDetailsCard />
      <LicenseWarningBanner />
    </div>
  );
};
```

#### Account Status Card
```typescript
// src/components/license/AccountStatusCard.tsx
export const AccountStatusCard: React.FC = () => {
  const { licenseInfo } = useLicense();

  if (!licenseInfo) return null;

  const getStatusConfig = (status: AccountStatus) => {
    switch (status) {
      case 'Active':
        return {
          color: 'green',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'PaymentDue':
        return {
          color: 'yellow',
          icon: Clock,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'PaymentDueUnknown':
        return {
          color: 'orange',
          icon: AlertTriangle,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-600',
          borderColor: 'border-orange-200'
        };
      case 'Disabled':
        return {
          color: 'red',
          icon: XCircle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      case 'Demo':
        return {
          color: 'blue',
          icon: Info,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      case 'DemoExpired':
        return {
          color: 'gray',
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          color: 'gray',
          icon: Info,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig(licenseInfo.accountStatus);
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
          Account Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status</span>
            <span className={`font-medium ${config.textColor}`}>
              {licenseInfo.accountStatus}
            </span>
          </div>
          
          {licenseInfo.expirationDate && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Expires</span>
              <span className="text-sm">
                {licenseInfo.expirationDate.toLocaleDateString()}
              </span>
            </div>
          )}
          
          {licenseInfo.demoExpirationDate && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Demo Ends</span>
              <span className="text-sm">
                {licenseInfo.demoExpirationDate.toLocaleDateString()}
              </span>
            </div>
          )}
          
          {licenseInfo.gracePeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Grace Period</span>
              <span className="text-sm">
                Until {licenseInfo.gracePeriodEnd.toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Devices</span>
            <span className="text-sm">
              {licenseInfo.currentDeviceCount} / {licenseInfo.maxDevices}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### License Warning Banner
```typescript
// src/components/license/LicenseWarningBanner.tsx
export const LicenseWarningBanner: React.FC = () => {
  const { licenseInfo, validationResult } = useLicense();
  
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
      
      if (daysLeft <= 3) {
        return `Demo expires in ${daysLeft} days. Upgrade to continue using all features.`;
      }
    }
    
    return null;
  };

  const warningMessage = getWarningMessage();

  if (!warningMessage) return null;

  const getWarningStyle = () => {
    if (licenseInfo?.accountStatus === 'PaymentDue') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    
    if (licenseInfo?.accountStatus === 'PaymentDueUnknown') {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    }
    
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${getWarningStyle()}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">{warningMessage}</p>
          {licenseInfo?.accountStatus === 'PaymentDue' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.open('/billing', '_blank')}
            >
              Update Payment Method
            </Button>
          )}
          {licenseInfo?.accountStatus === 'Demo' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.open('/upgrade', '_blank')}
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 4. Custom Hooks

#### useLicense Hook
```typescript
// src/hooks/useLicense.ts
export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};
```

#### useLicenseValidation Hook
```typescript
// src/hooks/useLicenseValidation.ts
export const useLicenseValidation = () => {
  const { validateLicense, licenseInfo } = useLicense();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateLicense();
      setLastValidation(new Date());
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const isLicenseValid = useMemo(() => {
    return licenseInfo?.accountStatus === 'Active' && 
           licenseInfo?.deviceStatus === 'Active';
  }, [licenseInfo]);

  const hasWarnings = useMemo(() => {
    return licenseInfo?.accountStatus === 'PaymentDue' ||
           licenseInfo?.accountStatus === 'PaymentDueUnknown' ||
           (licenseInfo?.accountStatus === 'Demo' && 
            licenseInfo?.demoExpirationDate &&
            licenseInfo.demoExpirationDate.getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000);
  }, [licenseInfo]);

  return {
    runValidation,
    isValidating,
    lastValidation,
    isLicenseValid,
    hasWarnings
  };
};
```

#### useCountdown Hook
```typescript
// src/hooks/useCountdown.ts
export const useCountdown = (targetDate: Date | null) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};
```

### 5. License Details Components

#### License Details Card
```typescript
// src/components/license/LicenseDetailsCard.tsx
export const LicenseDetailsCard: React.FC = () => {
  const { licenseInfo, refreshLicense } = useLicense();

  if (!licenseInfo) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>License Details</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshLicense}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Connection Status</label>
              <p className="text-sm mt-1">
                {licenseInfo.isOnline ? (
                  <span className="text-green-600">✓ Online</span>
                ) : (
                  <span className="text-red-600">✗ Offline</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Validation</label>
              <p className="text-sm mt-1">
                {licenseInfo.lastValidation.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Enabled Features</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {licenseInfo.featuresEnabled.map((feature) => (
                <span 
                  key={feature}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Integration Points

### 1. App.tsx Integration
```typescript
// src/App.tsx (modifications)
import { LicenseProvider } from './contexts/LicenseContext';

function App() {
  return (
    <DeviceProvider>
      <LicenseProvider>
        <AuthProvider>
          <ThemeProvider>
            {/* Rest of app */}
          </ThemeProvider>
        </AuthProvider>
      </LicenseProvider>
    </DeviceProvider>
  );
}
```

### 2. Dashboard Integration
Add license status to main dashboard or create dedicated license management page.

## Testing Requirements

### Unit Tests
- License service methods
- Context state management
- Status calculation logic
- Countdown functionality

### Integration Tests
- License status display
- Warning banner behavior
- Validation flow
- Error handling

## Performance Considerations

- Efficient polling for license status
- Cached license information
- Debounced validation requests
- Optimized re-renders

## Success Criteria

- [ ] License status displays correctly for all states
- [ ] Warning banners appear at appropriate times
- [ ] Countdown timers work accurately
- [ ] Error handling covers all scenarios
- [ ] Performance meets requirements
- [ ] UI is responsive and accessible

## Next Steps

1. Implement license service and context
2. Create status display components
3. Build warning and notification system
4. Add countdown timers for time-sensitive states
5. Integrate with existing authentication flow
6. Create comprehensive test suite
7. Add accessibility features
8. Document user workflows