import { AccessControlConfig, AccessControlRule } from '../types/accessControl';

// Define access control rules for different features and routes
export const ACCESS_CONTROL_RULES: Record<string, AccessControlRule> = {
  // Core WMS Features
  GOODS_RECEIPT: {
    id: 'GOODS_RECEIPT',
    name: 'Goods Receipt',
    description: 'Access to goods receipt functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['goods_receipt'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  GOODS_RECEIPT_SUPERVISOR: {
    id: 'GOODS_RECEIPT_SUPERVISOR',
    name: 'Goods Receipt Supervisor',
    description: 'Access to goods receipt supervisor features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['goods_receipt', 'supervisor_tools'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  PICKING: {
    id: 'PICKING',
    name: 'Picking',
    description: 'Access to picking functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['picking'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  PICKING_SUPERVISOR: {
    id: 'PICKING_SUPERVISOR',
    name: 'Picking Supervisor',
    description: 'Access to picking supervisor features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['picking', 'supervisor_tools'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  COUNTING: {
    id: 'COUNTING',
    name: 'Counting',
    description: 'Access to counting functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['counting'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  COUNTING_SUPERVISOR: {
    id: 'COUNTING_SUPERVISOR',
    name: 'Counting Supervisor',
    description: 'Access to counting supervisor features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['counting', 'supervisor_tools'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  TRANSFER: {
    id: 'TRANSFER',
    name: 'Transfer',
    description: 'Access to transfer functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['transfer'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  TRANSFER_SUPERVISOR: {
    id: 'TRANSFER_SUPERVISOR',
    name: 'Transfer Supervisor',
    description: 'Access to transfer supervisor features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['transfer', 'supervisor_tools'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  // Check Features
  ITEM_CHECK: {
    id: 'ITEM_CHECK',
    name: 'Item Check',
    description: 'Access to item checking functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['item_check'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  BIN_CHECK: {
    id: 'BIN_CHECK',
    name: 'Bin Check',
    description: 'Access to bin checking functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['bin_check'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  PACKAGE_CHECK: {
    id: 'PACKAGE_CHECK',
    name: 'Package Check',
    description: 'Access to package checking functionality',
    requiredAccountStatus: ['Active', 'Demo'],
    requiredAccessLevel: 'limited',
    requiredFeatures: ['package_check'],
    gracePeriodAllowed: true,
    demoAllowed: true,
    offlineAllowed: true
  },

  // Advanced Features
  ADVANCED_REPORTING: {
    id: 'ADVANCED_REPORTING',
    name: 'Advanced Reporting',
    description: 'Access to advanced reporting features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['advanced_reporting'],
    gracePeriodAllowed: false,
    demoAllowed: false,
    offlineAllowed: false
  },

  ANALYTICS: {
    id: 'ANALYTICS',
    name: 'Analytics',
    description: 'Access to analytics and insights',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['analytics'],
    gracePeriodAllowed: false,
    demoAllowed: false,
    offlineAllowed: false
  },

  API_ACCESS: {
    id: 'API_ACCESS',
    name: 'API Access',
    description: 'Access to API endpoints',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['api_access'],
    gracePeriodAllowed: false,
    demoAllowed: false,
    offlineAllowed: false
  },

  // Settings and Administration
  SETTINGS: {
    id: 'SETTINGS',
    name: 'Settings',
    description: 'Access to application settings',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['settings'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  USER_MANAGEMENT: {
    id: 'USER_MANAGEMENT',
    name: 'User Management',
    description: 'Access to user management features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['user_management'],
    gracePeriodAllowed: false,
    demoAllowed: false,
    offlineAllowed: false
  },

  // Device and License Management
  DEVICE_MANAGEMENT: {
    id: 'DEVICE_MANAGEMENT',
    name: 'Device Management',
    description: 'Access to device management features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['device_management'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  LICENSE_MANAGEMENT: {
    id: 'LICENSE_MANAGEMENT',
    name: 'License Management',
    description: 'Access to license management features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['license_management'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: true
  },

  // Cloud and Sync Features
  CLOUD_SYNC: {
    id: 'CLOUD_SYNC',
    name: 'Cloud Sync',
    description: 'Access to cloud synchronization features',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['cloud_sync'],
    gracePeriodAllowed: true,
    demoAllowed: false,
    offlineAllowed: false
  },

  BACKUP_RESTORE: {
    id: 'BACKUP_RESTORE',
    name: 'Backup & Restore',
    description: 'Access to backup and restore functionality',
    requiredAccountStatus: ['Active'],
    requiredAccessLevel: 'full',
    requiredFeatures: ['backup_restore'],
    gracePeriodAllowed: false,
    demoAllowed: false,
    offlineAllowed: false
  }
};

// Define route-specific access control rules
export const ROUTE_ACCESS_RULES: Record<string, AccessControlRule> = {
  // Core Routes
  '/goodsReceipt': ACCESS_CONTROL_RULES.GOODS_RECEIPT,
  '/goodsReceiptSupervisor': ACCESS_CONTROL_RULES.GOODS_RECEIPT_SUPERVISOR,
  '/goodsReceiptConfirmation': ACCESS_CONTROL_RULES.GOODS_RECEIPT,
  '/goodsReceiptConfirmationSupervisor': ACCESS_CONTROL_RULES.GOODS_RECEIPT_SUPERVISOR,
  
  '/pick': ACCESS_CONTROL_RULES.PICKING,
  '/pickSupervisor': ACCESS_CONTROL_RULES.PICKING_SUPERVISOR,
  
  '/counting': ACCESS_CONTROL_RULES.COUNTING,
  '/countingSupervisor': ACCESS_CONTROL_RULES.COUNTING_SUPERVISOR,
  
  '/transfer': ACCESS_CONTROL_RULES.TRANSFER,
  '/transferSupervisor': ACCESS_CONTROL_RULES.TRANSFER_SUPERVISOR,
  '/transferRequest': ACCESS_CONTROL_RULES.TRANSFER,
  
  // Check Routes
  '/itemCheck': ACCESS_CONTROL_RULES.ITEM_CHECK,
  '/binCheck': ACCESS_CONTROL_RULES.BIN_CHECK,
  '/packageCheck': ACCESS_CONTROL_RULES.PACKAGE_CHECK,
  
  // Settings Routes
  '/settings': ACCESS_CONTROL_RULES.SETTINGS,
  '/settings/users': ACCESS_CONTROL_RULES.USER_MANAGEMENT,
  '/settings/authorizationGroups': ACCESS_CONTROL_RULES.USER_MANAGEMENT,
  '/settings/cancelReasons': ACCESS_CONTROL_RULES.SETTINGS,
  
  // Device and License Routes
  '/device': ACCESS_CONTROL_RULES.DEVICE_MANAGEMENT,
  '/device/register': ACCESS_CONTROL_RULES.DEVICE_MANAGEMENT,
  '/device/status': ACCESS_CONTROL_RULES.DEVICE_MANAGEMENT,
  '/license': ACCESS_CONTROL_RULES.LICENSE_MANAGEMENT,
  '/license/status': ACCESS_CONTROL_RULES.LICENSE_MANAGEMENT,
  
  // Cloud Sync Routes
  '/sync': ACCESS_CONTROL_RULES.CLOUD_SYNC,
  '/sync/status': ACCESS_CONTROL_RULES.CLOUD_SYNC,
};

// Main access control configuration
export const ACCESS_CONTROL_CONFIG: AccessControlConfig = {
  routes: ROUTE_ACCESS_RULES,
  features: ACCESS_CONTROL_RULES,
  defaultAccessLevel: 'limited',
  gracePeriodDays: 7,
  strictMode: false,
  offlineGracePeriodHours: 24,
};

// Helper function to get rule by name
export const getAccessControlRule = (ruleName: string): AccessControlRule | undefined => {
  return ACCESS_CONTROL_RULES[ruleName];
};

// Helper function to get route rule
export const getRouteAccessRule = (routePath: string): AccessControlRule | undefined => {
  return ROUTE_ACCESS_RULES[routePath];
};

// Helper function to check if a feature is available in demo mode
export const isFeatureAvailableInDemo = (featureName: string): boolean => {
  const rule = ACCESS_CONTROL_RULES[featureName];
  return rule ? rule.demoAllowed : false;
};

// Helper function to check if a feature works offline
export const isFeatureAvailableOffline = (featureName: string): boolean => {
  const rule = ACCESS_CONTROL_RULES[featureName];
  return rule ? rule.offlineAllowed : false;
};

// Helper function to get features by access level
export const getFeaturesByAccessLevel = (accessLevel: string): string[] => {
  return Object.entries(ACCESS_CONTROL_RULES)
    .filter(([, rule]) => {
      const accessLevels = ['none', 'readonly', 'limited', 'full'];
      const ruleIndex = accessLevels.indexOf(rule.requiredAccessLevel);
      const currentIndex = accessLevels.indexOf(accessLevel);
      return currentIndex >= ruleIndex;
    })
    .map(([name]) => name);
};