# Frontend Components & Services Summary

## Overview

This document provides a comprehensive summary of all frontend components, services, hooks, and utilities required for the Light WMS licensing system. It serves as a reference for developers implementing the licensing features and as a checklist for ensuring complete coverage.

## Directory Structure

```
src/
├── components/
│   ├── license/
│   │   ├── DeviceRegistration.tsx
│   │   ├── DeviceStatusCard.tsx
│   │   ├── LicenseStatusDashboard.tsx
│   │   ├── AccountStatusCard.tsx
│   │   ├── LicenseWarningBanner.tsx
│   │   ├── LicenseDetailsCard.tsx
│   │   ├── CloudStatusIndicator.tsx
│   │   ├── CloudSyncDashboard.tsx
│   │   ├── SyncQueueCard.tsx
│   │   ├── SyncHistoryTable.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AccessDeniedScreen.tsx
│   │   ├── FeatureGuard.tsx
│   │   ├── LicenseErrorHandler.tsx
│   │   └── LicenseValidationWrapper.tsx
│   └── ui/ (existing shadcn/ui components)
├── contexts/
│   ├── DeviceContext.tsx
│   ├── LicenseContext.tsx
│   ├── CloudSyncContext.tsx
│   └── AccessControlContext.tsx
├── services/
│   ├── deviceService.ts
│   ├── licenseService.ts
│   ├── cloudSyncService.ts
│   └── accessControlService.ts
├── hooks/
│   ├── useDevice.ts
│   ├── useLicense.ts
│   ├── useCloudSync.ts
│   ├── useAccessControl.ts
│   ├── useDeviceValidation.ts
│   ├── useLicenseValidation.ts
│   ├── useFeatureAccess.ts
│   ├── useOnlineStatus.ts
│   ├── useCountdown.ts
│   └── useLicenseError.ts
├── utils/
│   ├── deviceUtils.ts
│   ├── licenseUtils.ts
│   ├── storageUtils.ts
│   └── axios-instance.ts (modifications)
├── types/
│   ├── device.ts
│   ├── license.ts
│   ├── cloudSync.ts
│   └── accessControl.ts
└── config/
    └── accessControlConfig.ts
```

## Components Reference

### Device Management Components

#### DeviceRegistration.tsx
**Purpose**: Handles device registration flow
**Props**: None
**Key Features**:
- UUID generation and display
- Registration form submission
- Error handling and loading states
- Success confirmation display

#### DeviceStatusCard.tsx
**Purpose**: Shows current device status and information
**Props**: None
**Key Features**:
- Device status indicator (Active, Inactive, Disabled)
- Registration date display
- Last validation timestamp
- Status refresh functionality

### License Status Components

#### LicenseStatusDashboard.tsx
**Purpose**: Main dashboard for license information
**Props**: None
**Key Features**:
- Aggregates all license components
- Loading and error states
- Refresh functionality
- Responsive layout

#### AccountStatusCard.tsx
**Purpose**: Displays account status with appropriate styling
**Props**: None
**Key Features**:
- Status-specific icons and colors
- Expiration date display
- Device count information
- Action buttons for status-specific actions

#### LicenseWarningBanner.tsx
**Purpose**: Shows license-related warnings and notices
**Props**: None
**Key Features**:
- Dynamic warning messages
- Status-specific styling
- Action buttons (payment, upgrade)
- Dismissible notifications

#### LicenseDetailsCard.tsx
**Purpose**: Detailed license information display
**Props**: None
**Key Features**:
- Connection status indicator
- Last validation timestamp
- Enabled features list
- Manual refresh button

### Cloud Sync Components

#### CloudStatusIndicator.tsx
**Purpose**: Shows cloud connectivity status
**Props**: `{ compact?: boolean }`
**Key Features**:
- Real-time connection status
- Latency display
- Sync progress indicator
- Compact mode for navigation

#### CloudSyncDashboard.tsx
**Purpose**: Comprehensive cloud sync management
**Props**: None
**Key Features**:
- Sync status overview
- Manual sync triggers
- Queue management
- History access

#### SyncQueueCard.tsx
**Purpose**: Displays and manages sync queue
**Props**: None
**Key Features**:
- Queue item categorization
- Retry operations
- Clear queue functionality
- Item status indicators

#### SyncHistoryTable.tsx
**Purpose**: Shows sync operation history
**Props**: None
**Key Features**:
- Expandable history view
- Operation success/failure indicators
- Timestamp and duration display
- Filtering capabilities

### Access Control Components

#### ProtectedRoute.tsx
**Purpose**: Route-level access control
**Props**: 
```typescript
{
  children: React.ReactNode;
  requiredAccess?: AccessLevel;
  allowedStates?: AccountStatus[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  featureId?: string;
}
```
**Key Features**:
- License-based route protection
- Automatic redirects
- Custom fallback content
- Feature-specific validation

#### AccessDeniedScreen.tsx
**Purpose**: User-friendly access denied page
**Props**: None
**Key Features**:
- Context-aware messaging
- Recovery action buttons
- Status-specific guidance
- Support contact information

#### FeatureGuard.tsx
**Purpose**: Feature-level access control
**Props**: 
```typescript
{
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  requiredAccess?: AccessLevel;
}
```
**Key Features**:
- Granular feature protection
- Upgrade prompts
- Custom fallback content
- Access level validation

#### LicenseErrorHandler.tsx
**Purpose**: Centralized error handling for license issues
**Props**: 
```typescript
{
  error: LicenseError;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```
**Key Features**:
- Error-specific messaging
- Recovery action buttons
- Retry functionality
- Dismissible errors

## Services Reference

### DeviceService.ts
**Purpose**: Device registration and management API
**Key Methods**:
- `registerDevice(request: DeviceRegistrationRequest)`
- `getDeviceStatus(uuid: string)`
- `validateDevice(uuid: string)`

### LicenseService.ts
**Purpose**: License validation and status management
**Key Methods**:
- `getLicenseStatus()`
- `validateLicense()`
- `refreshLicenseCache()`

### CloudSyncService.ts
**Purpose**: Cloud synchronization operations
**Key Methods**:
- `getSyncStatus()`
- `triggerManualSync()`
- `getQueueStatus()`
- `retryFailedOperations()`
- `getSyncHistory()`

### AccessControlService.ts
**Purpose**: Access control logic and validation
**Key Methods**:
- `canAccessRoute(path: string)`
- `canAccessFeature(featureId: string)`
- `getAccessLevel()`

## Context Providers

### DeviceContext
**Purpose**: Global device state management
**State**: Device UUID, registration status, device info
**Actions**: Register device, validate device, refresh info

### LicenseContext
**Purpose**: License information and validation
**State**: License info, validation results, loading states
**Actions**: Refresh license, validate license, clear errors

### CloudSyncContext
**Purpose**: Cloud sync status and operations
**State**: Sync info, queue items, sync history
**Actions**: Manual sync, retry operations, clear queue

### AccessControlContext
**Purpose**: Access control state and permissions
**State**: Access level, feature permissions
**Actions**: Check access, validate features, refresh permissions

## Custom Hooks

### Core Hooks
- `useDevice()` - Device management operations
- `useLicense()` - License status and validation
- `useCloudSync()` - Cloud sync operations
- `useAccessControl()` - Access control checks

### Specialized Hooks
- `useDeviceValidation(intervalMinutes)` - Automated device validation
- `useLicenseValidation()` - License validation with caching
- `useFeatureAccess(featureId)` - Feature-specific access control
- `useOnlineStatus()` - Network connectivity monitoring
- `useCountdown(targetDate)` - Countdown timers for expiration
- `useLicenseError()` - Error state management

## Utility Functions

### deviceUtils.ts
```typescript
- generateDeviceUUID(): string
- getOrCreateDeviceUUID(): string
- validateDeviceUUID(uuid: string): boolean
- getDeviceFingerprint(): string
```

### licenseUtils.ts
```typescript
- calculateDaysUntilExpiration(date: Date): number
- formatLicenseExpiration(date: Date): string
- isLicenseValid(info: LicenseInfo): boolean
- getLicenseWarningMessage(info: LicenseInfo): string
```

### storageUtils.ts
```typescript
- getDeviceInfo(): DeviceInfo | null
- setDeviceInfo(info: DeviceInfo): void
- clearDeviceInfo(): void
- getLicenseCache(): LicenseInfo | null
- setLicenseCache(info: LicenseInfo): void
```

## Type Definitions

### device.ts
```typescript
interface DeviceInfo
interface DeviceRegistrationRequest
interface DeviceRegistrationResponse
enum DeviceStatus
```

### license.ts
```typescript
interface LicenseInfo
interface LicenseValidationResult
enum AccountStatus
enum AccessLevel
```

### cloudSync.ts
```typescript
interface CloudSyncInfo
interface SyncQueueItem
interface SyncHistoryItem
enum CloudSyncStatus
enum SyncOperationType
```

### accessControl.ts
```typescript
interface FeatureAccess
interface RouteAccess
interface AccessControlConfig
interface LicenseError
interface LicenseRecoveryAction
```

## Configuration

### accessControlConfig.ts
**Purpose**: Central configuration for access control
**Contents**:
- Feature definitions and requirements
- Route protection rules
- Default access levels
- Grace period configurations

## Integration Checklist

### Phase 1 - Device Management
- [ ] Device UUID generation and storage
- [ ] Device registration API integration
- [ ] Device status display components
- [ ] Registration form validation
- [ ] Error handling for registration failures

### Phase 2 - License Status
- [ ] License status API integration
- [ ] Status display components
- [ ] Warning banner implementation
- [ ] Account status indicators
- [ ] License validation flow

### Phase 3 - Cloud Sync
- [ ] Cloud sync status monitoring
- [ ] Manual sync functionality
- [ ] Queue management UI
- [ ] Sync history display
- [ ] Offline mode handling

### Phase 4 - Access Control
- [ ] Route protection implementation
- [ ] Feature-level access guards
- [ ] Access denied screens
- [ ] Error recovery flows
- [ ] User guidance systems

## Testing Strategy

### Unit Tests
- All service methods
- Context state management
- Utility functions
- Hook behavior
- Component rendering

### Integration Tests
- Complete user flows
- API integration
- Error scenarios
- State transitions
- Permission checks

### E2E Tests
- Registration process
- License validation
- Access control enforcement
- Error recovery
- User guidance

## Performance Considerations

### Optimization Points
- Efficient polling intervals
- Memoized calculations
- Lazy loading of components
- Debounced API calls
- Minimal re-renders

### Monitoring
- License validation times
- API response times
- Error rates
- User conversion rates
- Feature usage metrics

## Deployment Considerations

### Environment Variables
```typescript
VITE_LICENSE_API_ENDPOINT
VITE_DEVICE_UUID_KEY
VITE_VALIDATION_INTERVAL
VITE_SYNC_INTERVAL
VITE_GRACE_PERIOD_DAYS
```

### Build Configuration
- License validation in production
- Development mode bypasses
- Test environment settings
- Debug logging levels

## Documentation Requirements

### Developer Documentation
- API integration guide
- Component usage examples
- Hook documentation
- Configuration reference
- Testing guidelines

### User Documentation
- License management guide
- Error resolution steps
- Feature access information
- Support contact details
- Upgrade procedures

## Success Metrics

### Technical Metrics
- License validation success rate
- Device registration completion rate
- Error resolution time
- System availability
- Performance benchmarks

### User Experience Metrics
- User satisfaction scores
- Feature adoption rates
- Support ticket volume
- License renewal rates
- Upgrade conversion rates

This comprehensive summary provides all the necessary information for implementing, maintaining, and extending the frontend licensing system for Light WMS.