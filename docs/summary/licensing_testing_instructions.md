# Frontend Licensing System - Testing Instructions

## Overview

This document provides comprehensive testing instructions for the frontend licensing system. Follow these step-by-step procedures to validate all licensing functionality, from device registration through access control and error handling.

## Prerequisites

### Environment Setup
1. **Backend Server**: Ensure the .NET licensing backend is running
2. **Database**: Licensing database should be accessible
3. **Browser**: Use Chrome/Firefox with Developer Tools
4. **Network**: Test both online and offline scenarios

### Test Data Requirements
- Valid license accounts (Active, Demo, PaymentDue, etc.)
- Multiple device registrations
- Various feature configurations
- Test payment scenarios

---

## Test Categories

### 🔍 **Category 1: Device Management & Registration**
### 🔍 **Category 2: License Validation & Status**
### 🔍 **Category 3: Cloud Sync & Offline Mode**
### 🔍 **Category 4: Access Control & Error Handling**
### 🔍 **Category 5: Integration & Edge Cases**

---

# Category 1: Device Management & Registration

## Test 1.1: First-Time Device Registration

### Objective
Verify automatic device registration on first application load.

### Steps
1. **Clear Browser Data**
   ```
   - Open Developer Tools (F12)
   - Go to Application/Storage tab
   - Clear all localStorage data
   - Clear all cookies for the domain
   ```

2. **Launch Application**
   ```
   - Navigate to application URL
   - Monitor Network tab for API calls
   - Check Console for any errors
   ```

3. **Verify Device Registration**
   ```
   - Check localStorage for 'device_uuid' key
   - Verify UUID format (36 characters with hyphens)
   - Confirm POST request to /api/device/register
   - Check response contains device registration data
   ```

### Expected Results
- ✅ Unique device UUID generated and stored
- ✅ API call to register device succeeds
- ✅ Device status shows as 'pending' or 'active'
- ✅ No console errors during registration

### Verification Points
- **localStorage**: `device_uuid` exists and is valid
- **Network**: Registration API call successful (200/201)
- **UI**: No error messages displayed

---

## Test 1.2: Device Status Monitoring

### Objective
Verify device status updates and monitoring functionality.

### Steps
1. **Navigate to Device Status**
   ```
   - Go to /device/status route
   - Verify DeviceStatusCard component loads
   ```

2. **Check Status Information**
   ```
   - Device UUID displayed correctly
   - Registration date shown
   - Current status (active/pending/disabled)
   - Last validation timestamp
   ```

3. **Test Status Refresh**
   ```
   - Click refresh button (if available)
   - Monitor network calls for status updates
   - Verify UI updates with new information
   ```

### Expected Results
- ✅ Device information displays correctly
- ✅ Status updates in real-time
- ✅ Refresh functionality works

---

## Test 1.3: Multiple Device Scenarios

### Objective
Test device limit enforcement and multiple device handling.

### Steps
1. **Register Multiple Devices**
   ```
   - Open application in multiple browsers/incognito tabs
   - Each should get unique device UUID
   - Monitor device count in license info
   ```

2. **Test Device Limit**
   ```
   - Register devices up to license limit
   - Attempt to register one more device
   - Verify appropriate error/warning messages
   ```

3. **Verify Device Management**
   ```
   - Check if older devices can be deactivated
   - Test device status updates across browsers
   ```

### Expected Results
- ✅ Each browser gets unique device UUID
- ✅ Device limit enforcement works
- ✅ Appropriate warnings when limit approached/exceeded

---

# Category 2: License Validation & Status

## Test 2.1: License Information Display

### Objective
Verify license information is correctly fetched and displayed.

### Steps
1. **Navigate to License Dashboard**
   ```
   - Go to /license/status route
   - Verify LicenseStatusDashboard loads
   ```

2. **Check License Information**
   ```
   - Account status (Active/Demo/PaymentDue/etc.)
   - Device count (current vs maximum)
   - Expiration dates (license/demo/grace period)
   - Enabled features list
   - Last validation timestamp
   ```

3. **Verify Real-time Updates**
   ```
   - Leave page open for validation interval
   - Monitor network calls for license refresh
   - Check if UI updates automatically
   ```

### Expected Results
- ✅ All license information displays correctly
- ✅ Automatic refresh occurs at specified intervals
- ✅ UI updates reflect current license status

---

## Test 2.2: License Warning System

### Objective
Test license warning banners and notifications.

### Steps
1. **Test Payment Due Scenario**
   ```
   - Configure account with PaymentDue status
   - Navigate to application
   - Verify warning banner appears
   - Check warning message content
   - Test "Update Payment" button functionality
   ```

2. **Test Demo Expiration**
   ```
   - Configure demo account near expiration
   - Check expiration countdown display
   - Verify "Upgrade Now" button works
   ```

3. **Test Device Limit Warnings**
   ```
   - Register devices near limit
   - Verify warning appears when limit approached
   - Test "Manage Devices" button
   ```

4. **Test Grace Period**
   ```
   - Configure account in grace period
   - Verify grace period countdown
   - Check limited functionality warnings
   ```

### Expected Results
- ✅ Appropriate warnings display for each scenario
- ✅ Warning messages are clear and actionable
- ✅ Action buttons redirect to correct pages
- ✅ Warnings dismiss properly when resolved

---

## Test 2.3: License Validation Error Handling

### Objective
Test license validation failure scenarios and recovery.

### Steps
1. **Test Network Failure During Validation**
   ```
   - Disconnect internet during license check
   - Verify graceful degradation to cached data
   - Check error messages are user-friendly
   ```

2. **Test Invalid License Response**
   ```
   - Mock invalid license API response
   - Verify error handling and recovery options
   - Test retry functionality
   ```

3. **Test License Expiration**
   ```
   - Configure expired license
   - Verify access restrictions apply
   - Check renewal prompts appear
   ```

### Expected Results
- ✅ Graceful handling of network failures
- ✅ Clear error messages with recovery actions
- ✅ Proper fallback to cached license data
- ✅ Retry mechanisms work correctly

---

# Category 3: Cloud Sync & Offline Mode

## Test 3.1: Online/Offline Detection

### Objective
Verify network status detection and UI updates.

### Steps
1. **Test Online Status**
   ```
   - Ensure internet connection is active
   - Navigate to /sync/status
   - Verify "Connected" status shows
   - Check last sync timestamp
   ```

2. **Test Offline Detection**
   ```
   - Disconnect internet connection
   - Wait for offline detection (usually 5-10 seconds)
   - Verify offline overlay appears
   - Check sync status shows "Disconnected"
   ```

3. **Test Reconnection**
   ```
   - Reconnect internet
   - Wait for online detection
   - Verify offline overlay disappears
   - Check sync resumes automatically
   ```

### Expected Results
- ✅ Online/offline status detected accurately
- ✅ UI updates reflect connection status
- ✅ Automatic reconnection handling works
- ✅ Offline overlay provides clear information

---

## Test 3.2: Offline Mode Functionality

### Objective
Test application functionality when offline.

### Steps
1. **Go Offline with Valid License**
   ```
   - Ensure license is cached and valid
   - Disconnect internet
   - Navigate through application
   - Test core WMS functions (goods receipt, picking, etc.)
   ```

2. **Test Offline Restrictions**
   ```
   - Try to access online-only features
   - Verify appropriate blocking messages
   - Check offline grace period behavior
   ```

3. **Test Queue Management**
   ```
   - Perform operations while offline
   - Check operations are queued
   - Verify queue status in sync dashboard
   - Reconnect and verify operations sync
   ```

### Expected Results
- ✅ Core functions work with cached license
- ✅ Online-only features properly blocked
- ✅ Operations queued for later sync
- ✅ Clear messaging about offline limitations

---

## Test 3.3: Sync Recovery

### Objective
Test sync recovery after extended offline periods.

### Steps
1. **Extended Offline Period**
   ```
   - Go offline for extended period (hours/days if possible)
   - Perform various operations
   - Check queue accumulation
   ```

2. **Reconnection and Sync**
   ```
   - Reconnect to internet
   - Monitor sync process
   - Verify all queued operations process
   - Check for any sync conflicts
   ```

3. **Conflict Resolution**
   ```
   - Create conflicting data scenarios
   - Test conflict resolution UI
   - Verify data integrity after resolution
   ```

### Expected Results
- ✅ Extended offline operation supported
- ✅ Large queue syncs successfully
- ✅ Conflicts detected and resolved properly
- ✅ Data integrity maintained

---

# Category 4: Access Control & Error Handling

## Test 4.1: Feature-Level Access Control

### Objective
Verify granular feature access based on license status.

### Steps
1. **Test Demo Mode Restrictions**
   ```
   - Configure demo license
   - Navigate to various features
   - Verify demo-restricted features show upgrade prompts
   - Test features allowed in demo mode work normally
   ```

2. **Test Payment Due Restrictions**
   ```
   - Configure PaymentDue account status
   - Check which features remain accessible
   - Verify payment prompts appear for restricted features
   - Test grace period functionality
   ```

3. **Test Feature Guards**
   ```
   - Navigate to Home page
   - Check FeatureGuard component behavior
   - Verify advanced features section visibility
   - Test upgrade prompts and buttons
   ```

### Expected Results
- ✅ Demo mode restrictions enforced correctly
- ✅ Payment due restrictions appropriate
- ✅ Feature guards block/allow access properly
- ✅ Upgrade prompts are clear and functional

---

## Test 4.2: Route-Level Protection

### Objective
Test route access control and protected routes.

### Steps
1. **Test Route Access with Different License Types**
   ```
   - Active License: Access all routes
   - Demo License: Test route restrictions
   - Disabled License: Verify route blocking
   ```

2. **Test Protected Route Component**
   ```
   - Navigate to protected routes with insufficient permissions
   - Verify redirect to access denied page
   - Check access denied screen content and actions
   ```

3. **Test Enhanced Protection**
   ```
   - Routes with both role-based and license-based protection
   - Verify both systems work together
   - Test fallback behavior
   ```

### Expected Results
- ✅ Routes properly protected based on license
- ✅ Access denied screens are informative
- ✅ Recovery actions work correctly
- ✅ Combined protection systems function properly

---

## Test 4.3: Error Handling and Recovery

### Objective
Test comprehensive error handling and user recovery options.

### Steps
1. **Test License Error Handler**
   ```
   - Trigger various license errors (network, validation, etc.)
   - Verify LicenseErrorHandler component appears
   - Test error message clarity and helpfulness
   - Check recovery action buttons
   ```

2. **Test Access Denied Scenarios**
   ```
   - Access restricted features with insufficient license
   - Verify AccessDeniedScreen appears
   - Test different denial reasons and messages
   - Check upgrade/contact support buttons
   ```

3. **Test Error Recovery Actions**
   ```
   - Click "Try Again" buttons
   - Test "Contact Support" links
   - Verify "Upgrade Now" redirects
   - Check error dismissal functionality
   ```

### Expected Results
- ✅ Errors are caught and displayed properly
- ✅ Error messages are user-friendly
- ✅ Recovery actions are functional
- ✅ Users can easily resolve issues

---

# Category 5: Integration & Edge Cases

## Test 5.1: Full User Workflow Testing

### Objective
Test complete user workflows from start to finish.

### Steps
1. **New User Workflow**
   ```
   - Clear all browser data
   - Navigate to application
   - Complete device registration
   - LoginPage with demo account
   - Navigate through available features
   - Encounter demo restrictions
   - Follow upgrade prompts
   ```

2. **Existing User Workflow**
   ```
   - LoginPage with active license
   - Use various WMS features
   - Check license status periodically
   - Test offline functionality
   - Verify sync when reconnected
   ```

3. **Problem Resolution Workflow**
   ```
   - Simulate payment due scenario
   - Follow payment update process
   - Verify access restoration
   - Test grace period handling
   ```

### Expected Results
- ✅ Smooth onboarding for new users
- ✅ Seamless experience for existing users
- ✅ Clear problem resolution paths
- ✅ No dead ends or confusing states

---

## Test 5.2: Edge Cases and Boundary Conditions

### Objective
Test unusual scenarios and boundary conditions.

### Steps
1. **Device Limit Edge Cases**
   ```
   - Exactly at device limit
   - Register one device over limit
   - Deactivate and reactivate devices
   - Multiple simultaneous registrations
   ```

2. **Date/Time Edge Cases**
   ```
   - License expiration at midnight
   - Demo expiration edge cases
   - Grace period boundaries
   - Timezone handling
   ```

3. **Network Edge Cases**
   ```
   - Intermittent connectivity
   - Very slow network responses
   - Partial API responses
   - Request timeouts
   ```

4. **Browser Edge Cases**
   ```
   - Multiple tabs open
   - Browser refresh during operations
   - localStorage quota exceeded
   - Cookies disabled
   ```

### Expected Results
- ✅ Graceful handling of all edge cases
- ✅ No application crashes or errors
- ✅ Consistent behavior across scenarios
- ✅ Clear user guidance in unusual situations

---

## Test 5.3: Performance and Load Testing

### Objective
Verify system performance under various conditions.

### Steps
1. **Response Time Testing**
   ```
   - Measure license validation response times
   - Check UI rendering performance
   - Test with large numbers of devices
   - Monitor memory usage
   ```

2. **Cache Performance**
   ```
   - Test cache hit/miss ratios
   - Verify cache expiration behavior
   - Check cache size limitations
   - Test cache cleanup
   ```

3. **Concurrent User Testing**
   ```
   - Multiple users with same license
   - Simultaneous device registrations
   - Concurrent license validations
   - Resource contention scenarios
   ```

### Expected Results
- ✅ Acceptable response times (<2 seconds)
- ✅ Efficient cache utilization
- ✅ Stable performance with multiple users
- ✅ No memory leaks or resource issues

---

# Testing Checklist

## Before Testing
- [ ] Backend licensing service is running
- [ ] Test database is populated with test data
- [ ] Browser developer tools are open
- [ ] Network simulation tools available (if needed)
- [ ] Test accounts configured for various scenarios

## During Testing
- [ ] Document all bugs and issues found
- [ ] Take screenshots of error states
- [ ] Record network activity for analysis
- [ ] Note performance measurements
- [ ] Test on multiple browsers if possible

## After Testing
- [ ] Verify all critical paths work
- [ ] Confirm error handling is comprehensive
- [ ] Check that user experience is smooth
- [ ] Validate security measures are effective
- [ ] Document any configuration changes needed

---

# Common Issues and Troubleshooting

## Issue: Device Registration Fails
**Symptoms**: No device UUID in localStorage, registration API fails
**Troubleshooting**:
1. Check backend licensing service is running
2. Verify API endpoint configuration
3. Check browser console for CORS errors
4. Validate request/response format

## Issue: License Validation Errors
**Symptoms**: License status shows as invalid, validation API fails
**Troubleshooting**:
1. Check device UUID is valid and registered
2. Verify license account exists in backend
3. Check API authentication headers
4. Validate license data format

## Issue: Access Control Not Working
**Symptoms**: Users can access restricted features
**Troubleshooting**:
1. Verify access control context is properly initialized
2. Check license information is loaded correctly
3. Validate access control rules configuration
4. Check component protection implementation

## Issue: Offline Mode Problems
**Symptoms**: Application doesn't work offline, cache issues
**Troubleshooting**:
1. Check localStorage has cached license data
2. Verify offline detection is working
3. Check network request handling
4. Validate cache expiration logic

## Issue: Sync Problems
**Symptoms**: Operations don't sync when reconnected
**Troubleshooting**:
1. Check sync queue in localStorage
2. Verify cloud sync context is running
3. Check API endpoints for sync operations
4. Validate network reconnection detection

---

# Success Criteria

## Functional Requirements Met
- ✅ Device registration works automatically
- ✅ License validation is real-time and cached
- ✅ Access control enforces license restrictions
- ✅ Offline mode provides limited functionality
- ✅ Error handling guides users to resolution
- ✅ Sync maintains data consistency

## Non-Functional Requirements Met
- ✅ Performance is acceptable (<2s response times)
- ✅ UI is intuitive and user-friendly
- ✅ Error messages are clear and actionable
- ✅ System is reliable and stable
- ✅ Security measures are effective
- ✅ Caching optimizes user experience

## User Experience Goals Achieved
- ✅ Seamless onboarding for new users
- ✅ Transparent licensing for existing users
- ✅ Clear guidance when issues occur
- ✅ Minimal disruption from licensing system
- ✅ Obvious upgrade paths when needed

---

# Conclusion

Following these comprehensive testing instructions will ensure the frontend licensing system works correctly in all scenarios. The tests cover device management, license validation, access control, error handling, and edge cases.

Regular execution of these tests during development and before releases will maintain system quality and user experience. Any failures should be documented and addressed before considering the implementation complete.

For additional support or questions about the testing process, refer to the licensing summary documentation or contact the development team.