# Phase 1: Device Management & Registration - Frontend

## Overview

Phase 1 establishes the foundation for frontend device management and registration, focusing on device UUID generation, storage, and basic license validation integration. This phase provides the core infrastructure needed for all subsequent licensing features.

## Objectives

- Implement device UUID generation and management
- Create device registration flow and UI
- Integrate basic license validation
- Establish localStorage management for device data
- Build foundational components and services

## Technical Implementation

### 1. Device UUID Management

#### Device UUID Generation
```typescript
// src/utils/deviceUtils.ts
export interface DeviceInfo {
  uuid: string;
  registrationDate: Date;
  lastValidation: Date;
  status: 'pending' | 'active' | 'inactive' | 'disabled';
}

export const generateDeviceUUID = (): string => {
  // Generate cryptographically secure UUID
  return crypto.randomUUID();
};

export const getOrCreateDeviceUUID = (): string => {
  const stored = localStorage.getItem('deviceUUID');
  if (stored) {
    return stored;
  }
  
  const newUUID = generateDeviceUUID();
  localStorage.setItem('deviceUUID', newUUID);
  return newUUID;
};
```

#### Device Storage Management
```typescript
// src/utils/storageUtils.ts
export const STORAGE_KEYS = {
  DEVICE_UUID: 'deviceUUID',
  DEVICE_INFO: 'deviceInfo',
  REGISTRATION_STATUS: 'registrationStatus'
} as const;

export const getDeviceInfo = (): DeviceInfo | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_INFO);
  return stored ? JSON.parse(stored) : null;
};

export const setDeviceInfo = (info: DeviceInfo): void => {
  localStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(info));
};
```

### 2. Device Registration Service

#### API Service Layer
```typescript
// src/services/deviceService.ts
export interface DeviceRegistrationRequest {
  uuid: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  userAgent: string;
  screenResolution: string;
  timezone: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  device: {
    id: string;
    uuid: string;
    status: DeviceStatus;
    registrationDate: string;
    lastSeen: string;
  };
  message?: string;
}

export class DeviceService {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async registerDevice(request: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    try {
      const response = await this.axiosInstance.post('/api/devices/register', request);
      return response.data;
    } catch (error) {
      throw new Error(`Device registration failed: ${error.message}`);
    }
  }

  async getDeviceStatus(uuid: string): Promise<DeviceStatus> {
    try {
      const response = await this.axiosInstance.get(`/api/devices/${uuid}/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get device status: ${error.message}`);
    }
  }

  async validateDevice(uuid: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post(`/api/devices/${uuid}/validate`);
      return response.data.isValid;
    } catch (error) {
      console.error('Device validation failed:', error);
      return false;
    }
  }
}
```

### 3. Device Context Provider

#### Context Implementation
```typescript
// src/contexts/DeviceContext.tsx
export interface DeviceContextType {
  deviceUUID: string;
  deviceInfo: DeviceInfo | null;
  registrationStatus: 'pending' | 'registered' | 'failed';
  isLoading: boolean;
  error: string | null;
  registerDevice: () => Promise<void>;
  validateDevice: () => Promise<boolean>;
  refreshDeviceInfo: () => Promise<void>;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceUUID] = useState(() => getOrCreateDeviceUUID());
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'registered' | 'failed'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const deviceService = new DeviceService(axiosInstance);

  const registerDevice = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const registrationRequest: DeviceRegistrationRequest = {
        uuid: deviceUUID,
        deviceType: 'web',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await deviceService.registerDevice(registrationRequest);
      
      if (response.success) {
        const newDeviceInfo: DeviceInfo = {
          uuid: deviceUUID,
          registrationDate: new Date(response.device.registrationDate),
          lastValidation: new Date(),
          status: response.device.status as DeviceInfo['status']
        };
        
        setDeviceInfo(newDeviceInfo);
        setDeviceInfo(newDeviceInfo);
        setRegistrationStatus('registered');
      } else {
        setRegistrationStatus('failed');
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      setRegistrationStatus('failed');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDevice = async (): Promise<boolean> => {
    try {
      const isValid = await deviceService.validateDevice(deviceUUID);
      
      if (deviceInfo) {
        const updatedInfo = {
          ...deviceInfo,
          lastValidation: new Date()
        };
        setDeviceInfo(updatedInfo);
        setDeviceInfo(updatedInfo);
      }
      
      return isValid;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const refreshDeviceInfo = async () => {
    try {
      const status = await deviceService.getDeviceStatus(deviceUUID);
      if (deviceInfo) {
        const updatedInfo = {
          ...deviceInfo,
          status: status as DeviceInfo['status'],
          lastValidation: new Date()
        };
        setDeviceInfo(updatedInfo);
        setDeviceInfo(updatedInfo);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const value: DeviceContextType = {
    deviceUUID,
    deviceInfo,
    registrationStatus,
    isLoading,
    error,
    registerDevice,
    validateDevice,
    refreshDeviceInfo
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};
```

### 4. Device Registration UI Components

#### Device Registration Component
```typescript
// src/components/license/DeviceRegistration.tsx
export const DeviceRegistration: React.FC = () => {
  const {
    deviceUUID,
    registrationStatus,
    isLoading,
    error,
    registerDevice
  } = useDevice();

  const handleRegister = async () => {
    await registerDevice();
  };

  if (registrationStatus === 'registered') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">Device Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Device UUID: <code className="text-xs bg-gray-100 px-1 rounded">{deviceUUID}</code>
            </p>
            <p className="text-sm text-green-600">
              ✓ Your device is registered and ready to use
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Device Registration</CardTitle>
        <CardDescription>
          Register this device to continue using Light WMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Device ID</label>
            <code className="block text-xs bg-gray-100 p-2 rounded break-all">
              {deviceUUID}
            </code>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Button 
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Registering...' : 'Register Device'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Device Status Display
```typescript
// src/components/license/DeviceStatusCard.tsx
export const DeviceStatusCard: React.FC = () => {
  const { deviceInfo, refreshDeviceInfo } = useDevice();

  if (!deviceInfo) return null;

  const getStatusColor = (status: DeviceInfo['status']) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'disabled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: DeviceInfo['status']) => {
    switch (status) {
      case 'active': return '✓';
      case 'inactive': return '⚠';
      case 'disabled': return '✗';
      default: return '○';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Device Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <span className={`text-sm font-medium ${getStatusColor(deviceInfo.status)}`}>
              {getStatusIcon(deviceInfo.status)} {deviceInfo.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Registered</span>
            <span className="text-sm text-gray-600">
              {deviceInfo.registrationDate.toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Validation</span>
            <span className="text-sm text-gray-600">
              {deviceInfo.lastValidation.toLocaleDateString()}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDeviceInfo}
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 5. Custom Hooks

#### useDevice Hook
```typescript
// src/hooks/useDevice.ts
export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
```

#### useDeviceValidation Hook
```typescript
// src/hooks/useDeviceValidation.ts
export const useDeviceValidation = (intervalMinutes: number = 60) => {
  const { validateDevice } = useDevice();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const runValidation = async () => {
      const valid = await validateDevice();
      setIsValid(valid);
      setLastCheck(new Date());
    };

    // Initial validation
    runValidation();

    // Set up interval
    const interval = setInterval(runValidation, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [validateDevice, intervalMinutes]);

  return { isValid, lastCheck };
};
```

### 6. Axios Instance Integration

#### Device UUID Header Interceptor
```typescript
// src/utils/axios-instance.ts (modifications)
import { getOrCreateDeviceUUID } from './deviceUtils';

// Add request interceptor for device UUID
axiosInstance.interceptors.request.use(
  (config) => {
    const deviceUUID = getOrCreateDeviceUUID();
    config.headers['X-Device-UUID'] = deviceUUID;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## Integration Points

### 1. App.tsx Integration
```typescript
// src/App.tsx (modifications)
import { DeviceProvider } from './contexts/DeviceContext';

function App() {
  return (
    <DeviceProvider>
      <AuthProvider>
        <ThemeProvider>
          {/* Rest of app */}
        </ThemeProvider>
      </AuthProvider>
    </DeviceProvider>
  );
}
```

### 2. First-Time Setup Flow
- Device UUID generation on first visit
- Automatic device registration on first API call
- Registration status display during loading
- Error handling for registration failures

## Testing Requirements

### Unit Tests
- Device UUID generation and storage
- Device registration service methods
- Context state management
- Hook functionality

### Integration Tests
- Device registration flow
- UUID persistence across sessions
- API integration with device headers
- Error handling scenarios

## Error Handling

### Registration Failures
- Network connectivity issues
- Server validation errors
- Invalid device information
- Duplicate device registration

### Runtime Errors
- Device validation failures
- Status check errors
- Context provider errors
- localStorage access issues

## Performance Considerations

- Lazy loading of device registration UI
- Efficient localStorage operations
- Minimal API calls for status checks
- Debounced validation requests

## Security Considerations

- Secure UUID generation
- Tamper-resistant device information
- Encrypted storage for sensitive data
- Audit trail for device operations

## Success Criteria

- [ ] Device UUID generated and persisted correctly
- [ ] Device registration completes successfully
- [ ] Device status displays accurately
- [ ] Error handling works for all scenarios
- [ ] Performance meets requirements
- [ ] Security measures implemented
- [ ] Tests achieve 90%+ coverage

## Next Steps

1. Implement device UUID management utilities
2. Create device registration service
3. Build device context provider
4. Develop registration UI components
5. Add custom hooks for device operations
6. Integrate with existing axios instance
7. Create comprehensive test suite
8. Document API integration requirements

This Phase 1 implementation provides the foundation for all subsequent licensing features, establishing secure device management and registration capabilities that will support the full licensing system.