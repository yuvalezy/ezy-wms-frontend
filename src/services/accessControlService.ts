import { 
  AccessControlRule, 
  AccessControlConfig, 
  AccessDeniedReason, 
  AccessDeniedInfo,
  DEFAULT_ACCESS_CONTROL_CONFIG,
  ACCESS_CONTROL_STORAGE_KEY,
  ACCESS_CONTROL_CACHE_DURATION
} from '../types/accessControl';
import { AccessLevel, AccountStatus, LicenseInfo } from '../types/license';

export class AccessControlService {
  private config: AccessControlConfig;
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();

  constructor(config: AccessControlConfig = DEFAULT_ACCESS_CONTROL_CONFIG) {
    this.config = { ...DEFAULT_ACCESS_CONTROL_CONFIG, ...config };
  }

  updateConfig(config: Partial<AccessControlConfig>): void {
    this.config = { ...this.config, ...config };
    this.clearCache();
  }

  canAccess(rule: AccessControlRule, licenseInfo: LicenseInfo | null, isOnline: boolean): boolean {
    const cacheKey = this.getCacheKey(rule, licenseInfo, isOnline);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ACCESS_CONTROL_CACHE_DURATION) {
      return cached.result;
    }

    const result = this.checkAccess(rule, licenseInfo, isOnline);
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    
    return result;
  }

  private checkAccess(rule: AccessControlRule, licenseInfo: LicenseInfo | null, isOnline: boolean): boolean {
    if (!licenseInfo) {
      return false;
    }

    // Check account status
    if (!this.isAccountStatusAllowed(rule, licenseInfo.accountStatus)) {
      return false;
    }

    // Check offline access
    if (!isOnline && !rule.offlineAllowed) {
      return false;
    }

    // Check demo mode
    if (licenseInfo.accountStatus === 'Demo' && !rule.demoAllowed) {
      return false;
    }

    // Check grace period
    if (this.isInGracePeriod(licenseInfo) && !rule.gracePeriodAllowed) {
      return false;
    }

    // Check required features
    if (!this.hasRequiredFeatures(rule, licenseInfo)) {
      return false;
    }

    // Check access level
    if (!this.hasRequiredAccessLevel(rule, licenseInfo)) {
      return false;
    }

    return true;
  }

  private isAccountStatusAllowed(rule: AccessControlRule, accountStatus: AccountStatus): boolean {
    return rule.requiredAccountStatus.includes(accountStatus);
  }

  private hasRequiredFeatures(rule: AccessControlRule, licenseInfo: LicenseInfo): boolean {
    return rule.requiredFeatures.every(feature => 
      licenseInfo.featuresEnabled.includes(feature)
    );
  }

  private hasRequiredAccessLevel(rule: AccessControlRule, licenseInfo: LicenseInfo): boolean {
    const accessLevels: AccessLevel[] = ['none', 'readonly', 'limited', 'full'];
    const currentLevel = this.getAccessLevel(licenseInfo);
    const requiredLevel = rule.requiredAccessLevel;
    
    return accessLevels.indexOf(currentLevel) >= accessLevels.indexOf(requiredLevel);
  }

  getAccessLevel(licenseInfo: LicenseInfo | null): AccessLevel {
    if (!licenseInfo) {
      return 'none';
    }

    switch (licenseInfo.accountStatus) {
      case 'Active':
        return 'full';
      case 'Demo':
        return 'limited';
      case 'PaymentDue':
        return this.isInGracePeriod(licenseInfo) ? 'limited' : 'readonly';
      case 'PaymentDueUnknown':
        return 'readonly';
      case 'Disabled':
      case 'DemoExpired':
        return 'none';
      default:
        return this.config.defaultAccessLevel;
    }
  }

  private isInGracePeriod(licenseInfo: LicenseInfo): boolean {
    if (!licenseInfo.gracePeriodEnd) {
      return false;
    }
    
    return new Date() < licenseInfo.gracePeriodEnd;
  }

  getBlockedReasons(rule: AccessControlRule, licenseInfo: LicenseInfo | null, isOnline: boolean): string[] {
    const reasons: string[] = [];

    if (!licenseInfo) {
      reasons.push('No license information available');
      return reasons;
    }

    if (!this.isAccountStatusAllowed(rule, licenseInfo.accountStatus)) {
      reasons.push(`Account status '${licenseInfo.accountStatus}' not allowed`);
    }

    if (!isOnline && !rule.offlineAllowed) {
      reasons.push('Offline access not allowed');
    }

    if (licenseInfo.accountStatus === 'Demo' && !rule.demoAllowed) {
      reasons.push('Demo mode not allowed');
    }

    if (this.isInGracePeriod(licenseInfo) && !rule.gracePeriodAllowed) {
      reasons.push('Grace period access not allowed');
    }

    const missingFeatures = rule.requiredFeatures.filter(
      feature => !licenseInfo.featuresEnabled.includes(feature)
    );
    if (missingFeatures.length > 0) {
      reasons.push(`Missing required features: ${missingFeatures.join(', ')}`);
    }

    if (!this.hasRequiredAccessLevel(rule, licenseInfo)) {
      reasons.push(`Insufficient access level. Required: ${rule.requiredAccessLevel}, Current: ${this.getAccessLevel(licenseInfo)}`);
    }

    return reasons;
  }

  getAccessDeniedInfo(rule: AccessControlRule, licenseInfo: LicenseInfo | null, isOnline: boolean): AccessDeniedInfo {
    const reasons = this.getBlockedReasons(rule, licenseInfo, isOnline);
    
    if (!licenseInfo) {
      return {
        reason: 'UNKNOWN_ERROR',
        message: 'License information not available',
        canRetry: true,
        retryAction: 'Refresh license information',
        contactSupport: true,
        upgradeAvailable: false
      };
    }

    return this.mapToAccessDeniedInfo(licenseInfo, reasons, isOnline);
  }

  private mapToAccessDeniedInfo(licenseInfo: LicenseInfo, reasons: string[], isOnline: boolean): AccessDeniedInfo {
    const accountStatus = licenseInfo.accountStatus;

    switch (accountStatus) {
      case 'Disabled':
        return {
          reason: 'ACCOUNT_DISABLED',
          message: 'Your account has been disabled. Please contact support to reactivate.',
          canRetry: false,
          contactSupport: true,
          upgradeAvailable: false
        };

      case 'PaymentDue':
        return {
          reason: 'PAYMENT_REQUIRED',
          message: 'Payment is required to access this feature. Please update your payment method.',
          canRetry: true,
          retryAction: 'Update payment method',
          contactSupport: true,
          upgradeAvailable: false,
          gracePeriodRemaining: this.getGracePeriodDays(licenseInfo)
        };

      case 'DemoExpired':
        return {
          reason: 'DEMO_EXPIRED',
          message: 'Your demo period has expired. Please upgrade to continue using this feature.',
          canRetry: false,
          contactSupport: true,
          upgradeAvailable: true
        };

      case 'Demo':
        return {
          reason: 'FEATURE_NOT_ENABLED',
          message: 'This feature is not available in demo mode. Please upgrade to access all features.',
          canRetry: false,
          contactSupport: true,
          upgradeAvailable: true
        };

      default:
        if (!isOnline) {
          return {
            reason: 'OFFLINE_NOT_ALLOWED',
            message: 'This feature requires an internet connection.',
            canRetry: true,
            retryAction: 'Check internet connection',
            contactSupport: false,
            upgradeAvailable: false
          };
        }

        return {
          reason: 'INSUFFICIENT_ACCESS_LEVEL',
          message: 'You do not have sufficient permissions to access this feature.',
          canRetry: false,
          contactSupport: true,
          upgradeAvailable: true
        };
    }
  }

  private getGracePeriodDays(licenseInfo: LicenseInfo): number | undefined {
    if (!licenseInfo.gracePeriodEnd) {
      return undefined;
    }

    const now = new Date();
    const gracePeriodEnd = licenseInfo.gracePeriodEnd;
    const diffTime = gracePeriodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  canAccessFeature(featureName: string, licenseInfo: LicenseInfo | null, isOnline: boolean): boolean {
    const rule = this.config.features[featureName];
    if (!rule) {
      return true; // Allow access if no rule is defined
    }

    return this.canAccess(rule, licenseInfo, isOnline);
  }

  canAccessRoute(routeName: string, licenseInfo: LicenseInfo | null, isOnline: boolean): boolean {
    const rule = this.config.routes[routeName];
    if (!rule) {
      return true; // Allow access if no rule is defined
    }

    return this.canAccess(rule, licenseInfo, isOnline);
  }

  isFeatureEnabled(featureName: string, licenseInfo: LicenseInfo | null): boolean {
    if (!licenseInfo) {
      return false;
    }

    return licenseInfo.featuresEnabled.includes(featureName);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getCacheKey(rule: AccessControlRule, licenseInfo: LicenseInfo | null, isOnline: boolean): string {
    const licenseKey = licenseInfo ? 
      `${licenseInfo.accountStatus}-${licenseInfo.currentDeviceCount}-${licenseInfo.maxDevices}-${licenseInfo.featuresEnabled.join(',')}` : 
      'null';
    
    return `${rule.id}-${licenseKey}-${isOnline}`;
  }

  // Utility methods for common access checks
  hasValidLicense(licenseInfo: LicenseInfo | null): boolean {
    if (!licenseInfo) {
      return false;
    }

    return !['Disabled', 'DemoExpired'].includes(licenseInfo.accountStatus);
  }

  isDemoMode(licenseInfo: LicenseInfo | null): boolean {
    return licenseInfo?.accountStatus === 'Demo';
  }

  isInGracePeriodMode(licenseInfo: LicenseInfo | null): boolean {
    if (!licenseInfo) {
      return false;
    }

    return this.isInGracePeriod(licenseInfo);
  }

  isOfflineMode(isOnline: boolean): boolean {
    return !isOnline;
  }

  // Storage methods
  saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`${ACCESS_CONTROL_STORAGE_KEY}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save access control data to storage:', error);
    }
  }

  loadFromStorage(key: string): any {
    try {
      const data = localStorage.getItem(`${ACCESS_CONTROL_STORAGE_KEY}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load access control data from storage:', error);
      return null;
    }
  }

  clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(ACCESS_CONTROL_STORAGE_KEY)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear access control storage:', error);
    }
  }
}

export const accessControlService = new AccessControlService();