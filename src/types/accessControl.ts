import { AccountStatus, AccessLevel } from './license';

export type AccessControlRule = {
  id: string;
  name: string;
  description: string;
  requiredAccountStatus: AccountStatus[];
  requiredAccessLevel: AccessLevel;
  requiredFeatures: string[];
  gracePeriodAllowed: boolean;
  demoAllowed: boolean;
  offlineAllowed: boolean;
};

export type AccessControlContext = {
  canAccess: (rule: AccessControlRule) => boolean;
  canAccessFeature: (featureName: string) => boolean;
  canAccessRoute: (routeName: string) => boolean;
  getAccessLevel: () => AccessLevel;
  getBlockedReasons: (rule: AccessControlRule) => string[];
  isFeatureEnabled: (featureName: string) => boolean;
  hasValidLicense: () => boolean;
  isInGracePeriod: () => boolean;
  isDemoMode: () => boolean;
  isOfflineMode: () => boolean;
};

export type AccessControlConfig = {
  routes: Record<string, AccessControlRule>;
  features: Record<string, AccessControlRule>;
  defaultAccessLevel: AccessLevel;
  gracePeriodDays: number;
  strictMode: boolean;
  offlineGracePeriodHours: number;
};

export type AccessDeniedReason = 
  | 'ACCOUNT_DISABLED'
  | 'PAYMENT_REQUIRED'
  | 'DEMO_EXPIRED'
  | 'LICENSE_EXPIRED'
  | 'FEATURE_NOT_ENABLED'
  | 'DEVICE_LIMIT_EXCEEDED'
  | 'OFFLINE_NOT_ALLOWED'
  | 'INSUFFICIENT_ACCESS_LEVEL'
  | 'UNKNOWN_ERROR';

export type AccessDeniedInfo = {
  reason: AccessDeniedReason;
  message: string;
  canRetry: boolean;
  retryAction?: string;
  contactSupport: boolean;
  upgradeAvailable: boolean;
  gracePeriodRemaining?: number;
};

export type FeatureGuardProps = {
  featureName: string;
  fallback?: React.ReactNode;
  showError?: boolean;
  children: React.ReactNode;
};

export type RouteGuardProps = {
  routeName: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
  children: React.ReactNode;
};

export type AccessControlHookResult = {
  canAccess: (rule: AccessControlRule) => boolean;
  canAccessFeature: (featureName: string) => boolean;
  canAccessRoute: (routeName: string) => boolean;
  getAccessLevel: () => AccessLevel;
  getBlockedReasons: (rule: AccessControlRule) => string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export interface AccessControlState {
  isInitialized: boolean;
  currentAccessLevel: AccessLevel;
  enabledFeatures: string[];
  blockedFeatures: string[];
  accessRules: Record<string, AccessControlRule>;
  lastCheck: Date | null;
  isOnline: boolean;
  gracePeriodEnd: Date | null;
  offlineGracePeriodEnd: Date | null;
}

export interface AccessControlActions {
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  checkAccess: (rule: AccessControlRule) => Promise<boolean>;
  updateOnlineStatus: (isOnline: boolean) => void;
  setGracePeriod: (endDate: Date | null) => void;
  clearCache: () => void;
}

export const DEFAULT_ACCESS_CONTROL_CONFIG: AccessControlConfig = {
  routes: {},
  features: {},
  defaultAccessLevel: 'limited',
  gracePeriodDays: 7,
  strictMode: false,
  offlineGracePeriodHours: 24,
};

export const ACCESS_CONTROL_STORAGE_KEY = 'accessControl';
export const ACCESS_CONTROL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes