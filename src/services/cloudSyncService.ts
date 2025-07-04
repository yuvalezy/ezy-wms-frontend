import { AxiosInstance } from 'axios';
import { 
  CloudSyncInfo, 
  SyncQueueItem, 
  SyncHistoryItem, 
  CloudSyncResponse,
  SyncQueueResponse,
  SyncHistoryResponse 
} from '../types/cloudSync';

export class CloudSyncService {
  private axiosInstance: AxiosInstance;
  private deviceUUID: string;
  private syncInterval: NodeJS.Timeout | null = null;
  private statusUpdateCallbacks: ((status: CloudSyncInfo) => void)[] = [];

  constructor(axiosInstance: AxiosInstance, deviceUUID: string) {
    this.axiosInstance = axiosInstance;
    this.deviceUUID = deviceUUID;
  }

  async getSyncStatus(): Promise<CloudSyncInfo> {
    try {
      const response = await this.axiosInstance.get('/api/sync/status');
      return this.transformSyncResponse(response.data);
    } catch (error: any) {
      throw new Error(`Failed to get sync status: ${error.response?.data?.message || error.message}`);
    }
  }

  async triggerManualSync(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/manual');
    } catch (error: any) {
      throw new Error(`Manual sync failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getQueueStatus(): Promise<SyncQueueItem[]> {
    try {
      const response = await this.axiosInstance.get('/api/sync/queue');
      return response.data.map(this.transformQueueItem);
    } catch (error: any) {
      throw new Error(`Failed to get queue status: ${error.response?.data?.message || error.message}`);
    }
  }

  async retryFailedOperations(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/retry-failed');
    } catch (error: any) {
      throw new Error(`Failed to retry operations: ${error.response?.data?.message || error.message}`);
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/clear-queue');
    } catch (error: any) {
      throw new Error(`Failed to clear queue: ${error.response?.data?.message || error.message}`);
    }
  }

  async getSyncHistory(limit: number = 50): Promise<SyncHistoryItem[]> {
    try {
      const response = await this.axiosInstance.get(`/api/sync/history?limit=${limit}`);
      return response.data.map(this.transformHistoryItem);
    } catch (error: any) {
      throw new Error(`Failed to get sync history: ${error.response?.data?.message || error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; latency: number; message?: string }> {
    const startTime = Date.now();
    try {
      await this.axiosInstance.get('/api/sync/ping');
      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      return { 
        success: false, 
        latency, 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  startStatusPolling(intervalMs: number = 30000) {
    this.stopStatusPolling();
    
    this.syncInterval = setInterval(async () => {
      try {
        const status = await this.getSyncStatus();
        this.notifyStatusUpdate(status);
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, intervalMs);
  }

  stopStatusPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  onStatusUpdate(callback: (status: CloudSyncInfo) => void) {
    this.statusUpdateCallbacks.push(callback);
    return () => {
      this.statusUpdateCallbacks = this.statusUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatusUpdate(status: CloudSyncInfo) {
    this.statusUpdateCallbacks.forEach(callback => callback(status));
  }

  private transformSyncResponse(data: CloudSyncResponse): CloudSyncInfo {
    return {
      status: data.status,
      lastSyncTime: new Date(data.lastSyncTime),
      nextSyncTime: new Date(data.nextSyncTime),
      isManualSyncAvailable: data.isManualSyncAvailable,
      queuedOperations: data.queuedOperations,
      failedOperations: data.failedOperations,
      connectionLatency: data.connectionLatency,
      errorMessage: data.errorMessage,
      syncInProgress: data.syncInProgress,
      syncProgress: data.syncProgress
    };
  }

  private transformQueueItem(data: SyncQueueResponse): SyncQueueItem {
    return {
      id: data.id,
      operation: data.operation,
      data: data.data,
      createdAt: new Date(data.createdAt),
      lastAttempt: new Date(data.lastAttempt),
      attemptCount: data.attemptCount,
      maxAttempts: data.maxAttempts,
      nextRetry: new Date(data.nextRetry),
      errorMessage: data.errorMessage,
      status: data.status
    };
  }

  private transformHistoryItem(data: SyncHistoryResponse): SyncHistoryItem {
    return {
      id: data.id,
      operation: data.operation,
      timestamp: new Date(data.timestamp),
      duration: data.duration,
      success: data.success,
      errorMessage: data.errorMessage,
      details: data.details
    };
  }
}