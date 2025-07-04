# Frontend Licensing Plan - Light WMS

## Overview

This document outlines the frontend implementation plan for the Light WMS licensing system. The frontend will integrate with the backend device-based licensing system to provide a seamless user experience while enforcing license restrictions and managing device registration.

## Architecture Overview

### Core Components

1. **Device Management** - Handle device UUID generation, storage, and registration
2. **License Status Management** - Display license status, warnings, and expiration notices
3. **Access Control** - Enforce UI restrictions based on license status
4. **License Validation** - Validate license status and handle grace periods
5. **Error Handling** - Graceful handling of license-related errors

### Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components for consistent UI
- **React Context API** for license state management
- **Axios** for API communication
- **React Hook Form** for license-related forms
- **LocalStorage** for device UUID persistence

## Implementation Phases

### Phase 1: Device Management & Registration
- Device UUID generation and localStorage management
- Device registration flow
- Basic license validation integration
- Device status display components

### Phase 2: License Status & Validation UI
- License status dashboard
- Warning and notification system
- Account status display
- Grace period handling

### Phase 3: Cloud Integration & Sync UI
- Sync status indicators
- Cloud connectivity monitoring
- Queue status display
- Manual sync triggers

### Phase 4: Access Control & Error Handling
- License-based route protection
- Feature access control
- Comprehensive error handling
- User feedback and guidance

## Key Features

### Device States Display
- **Active**: Full functionality, green status indicator
- **Inactive**: Limited functionality, yellow status indicator
- **Disabled**: No access, red status indicator with guidance

### Account States UI
- **Active**: Normal operation with full feature access
- **PaymentDue**: Warning banner with payment reminder
- **PaymentDueUnknown**: Offline mode indicator with grace period countdown
- **Disabled**: Access blocked screen with support contact
- **Demo**: Demo mode indicator with trial countdown
- **DemoExpired**: Trial expired screen with upgrade options

### License Validation Features
- Real-time license status checking
- Automatic token refresh with license validation
- Grace period countdown timers
- License warning notifications

## Integration Points

### Backend Communication
- Device UUID header (`X-Device-UUID`) in all API requests
- License status endpoint integration
- Authentication with license validation
- Error response handling for license issues

### localStorage Management
- Device UUID persistence (`deviceUUID`)
- License cache for offline validation
- User preferences for license notifications

### Context API State
- Global license status management
- Device registration state
- Account status tracking
- Error state management

## User Experience Considerations

### Registration Flow
1. First-time user device UUID generation
2. Automatic device registration on first API call
3. License status check and display
4. Guidance for license issues

### Ongoing Usage
1. Periodic license validation
2. Graceful degradation for license issues
3. Clear communication of license status
4. Easy access to license management

### Error Scenarios
1. License expired - Clear upgrade path
2. Device limit reached - Device management options
3. Payment issues - Payment reminder and links
4. Cloud connectivity issues - Offline mode indicators

## Development Guidelines

### Code Organization
```
src/
├── contexts/
│   ├── LicenseContext.tsx
│   └── DeviceContext.tsx
├── components/
│   ├── license/
│   │   ├── LicenseStatusBanner.tsx
│   │   ├── DeviceRegistration.tsx
│   │   ├── AccountStatusCard.tsx
│   │   └── LicenseValidationWrapper.tsx
│   └── ui/ (existing shadcn components)
├── services/
│   ├── licenseService.ts
│   ├── deviceService.ts
│   └── licenseValidationService.ts
├── hooks/
│   ├── useLicenseStatus.ts
│   ├── useDeviceRegistration.ts
│   └── useLicenseValidation.ts
├── utils/
│   ├── deviceUtils.ts
│   ├── licenseUtils.ts
│   └── storageUtils.ts
└── types/
    ├── license.ts
    └── device.ts
```

### State Management Pattern
- Use React Context for global license state
- Custom hooks for license operations
- LocalStorage utilities for persistence
- Service layer for API communication

### Error Handling Strategy
- Graceful degradation for license issues
- User-friendly error messages
- Clear action paths for resolution
- Fallback UI for offline scenarios

## Security Considerations

### Device UUID Management
- Secure UUID generation
- Tamper detection
- Secure storage practices
- Regular validation

### License Data Protection
- No sensitive license data in localStorage
- Encrypted communication with backend
- Secure token handling
- Audit trail for license actions

## Testing Strategy

### Unit Tests
- Device UUID generation and validation
- License status calculations
- Error handling scenarios
- Utility functions

### Integration Tests
- License validation flow
- Device registration process
- Error recovery scenarios
- Offline mode handling

### E2E Tests
- Complete registration flow
- License expiration scenarios
- Payment due workflows
- Device limit scenarios

## Deployment Considerations

### Environment Configuration
```typescript
interface LicenseConfig {
  apiEndpoint: string;
  deviceUUIDKey: string;
  validationInterval: number;
  gracePeriodDays: number;
  demoExpirationDays: number;
}
```

### Build Process
- License validation in production builds
- Development mode bypass options
- Test environment configurations
- Staging environment setup

## Success Metrics

### User Experience
- Registration completion rate
- License renewal conversion rate
- Error resolution time
- User satisfaction scores

### Technical Performance
- License validation response times
- Device registration success rate
- Error handling effectiveness
- System availability during license issues

## Next Steps

1. Implement Phase 1 components and services
2. Create comprehensive testing suite
3. Develop user documentation
4. Plan rollout strategy
5. Monitor and optimize performance

This frontend licensing plan provides a comprehensive foundation for implementing a user-friendly, secure, and robust licensing system that integrates seamlessly with the backend infrastructure while maintaining excellent user experience throughout the license lifecycle.