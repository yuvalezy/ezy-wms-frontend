export type CloudSyncStatus = 
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'syncing'
  | 'error'
  | 'unknown';

export type SyncOperationType = 
  | 'device_registration'
  | 'license_validation'
  | 'status_update'
  | 'queue_retry'
  | 'manual_sync';

export interface CloudSyncInfo {
  status: CloudSyncStatus;
  lastSyncTime: Date;
  nextSyncTime: Date;
  isManualSyncAvailable: boolean;
  queuedOperations: number;
  failedOperations: number;
  connectionLatency?: number;
  errorMessage?: string;
  syncInProgress: boolean;
  syncProgress?: number;
}

export interface SyncQueueItem {
  id: string;
  operation: SyncOperationType;
  data: any;
  createdAt: Date;
  lastAttempt: Date;
  attemptCount: number;
  maxAttempts: number;
  nextRetry: Date;
  errorMessage?: string;
  status: 'pending' | 'retrying' | 'failed' | 'processing';
}

export interface SyncHistoryItem {
  id: string;
  operation: SyncOperationType;
  timestamp: Date;
  duration: number;
  success: boolean;
  errorMessage?: string;
  details?: any;
}

export interface CloudSyncResponse {
  status: CloudSyncStatus;
  lastSyncTime: string;
  nextSyncTime: string;
  isManualSyncAvailable: boolean;
  queuedOperations: number;
  failedOperations: number;
  connectionLatency?: number;
  errorMessage?: string;
  syncInProgress: boolean;
  syncProgress?: number;
}

export interface SyncQueueResponse {
  id: string;
  operation: SyncOperationType;
  data: any;
  createdAt: string;
  lastAttempt: string;
  attemptCount: number;
  maxAttempts: number;
  nextRetry: string;
  errorMessage?: string;
  status: 'pending' | 'retrying' | 'failed' | 'processing';
}

export interface SyncHistoryResponse {
  id: string;
  operation: SyncOperationType;
  timestamp: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
  details?: any;
}