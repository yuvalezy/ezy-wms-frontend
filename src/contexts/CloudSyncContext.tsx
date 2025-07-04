import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CloudSyncInfo, SyncQueueItem, SyncHistoryItem } from '../types/cloudSync';
import { CloudSyncService } from '../services/cloudSyncService';
import { useDevice } from './DeviceContext';
import { axiosInstance } from '../utils/axios-instance';

export interface CloudSyncContextType {
  syncInfo: CloudSyncInfo | null;
  queueItems: SyncQueueItem[];
  syncHistory: SyncHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  triggerManualSync: () => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  clearQueue: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  testConnection: () => Promise<void>;
  clearError: () => void;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export const useCloudSync = () => {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error('useCloudSync must be used within a CloudSyncProvider');
  }
  return context;
};

interface CloudSyncProviderProps {
  children: ReactNode;
}

export const CloudSyncProvider: React.FC<CloudSyncProviderProps> = ({ children }) => {
  const [syncInfo, setSyncInfo] = useState<CloudSyncInfo | null>(null);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deviceUUID, registrationStatus } = useDevice();
  const cloudSyncService = new CloudSyncService(axiosInstance, deviceUUID);

  const refreshStatus = async () => {
    if (registrationStatus !== 'registered') {
      return; // Don't fetch sync info if device isn't registered
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const [status, queue] = await Promise.all([
        cloudSyncService.getSyncStatus(),
        cloudSyncService.getQueueStatus()
      ]);
      
      setSyncInfo(status);
      setQueueItems(queue);

      // Cache sync info in localStorage
      localStorage.setItem('cloudSyncInfo', JSON.stringify({
        ...status,
        lastSyncTime: status.lastSyncTime.toISOString(),
        nextSyncTime: status.nextSyncTime.toISOString()
      }));
    } catch (error: any) {
      setError(error.message);
      
      // Try to load from localStorage if available
      const cached = localStorage.getItem('cloudSyncInfo');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          const cachedInfo: CloudSyncInfo = {
            ...parsedCache,
            lastSyncTime: new Date(parsedCache.lastSyncTime),
            nextSyncTime: new Date(parsedCache.nextSyncTime),
            status: 'disconnected' // Mark as disconnected since we're using cache
          };
          setSyncInfo(cachedInfo);
        } catch (cacheError) {
          console.error('Failed to parse cached sync info:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    if (registrationStatus !== 'registered') {
      setError('Device must be registered before syncing');
      return;
    }

    setError(null);
    
    try {
      await cloudSyncService.triggerManualSync();
      await refreshStatus();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const retryFailedOperations = async () => {
    setError(null);
    
    try {
      await cloudSyncService.retryFailedOperations();
      await refreshStatus();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const clearQueue = async () => {
    setError(null);
    
    try {
      await cloudSyncService.clearQueue();
      await refreshStatus();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const refreshHistory = async () => {
    if (registrationStatus !== 'registered') {
      return;
    }

    try {
      const history = await cloudSyncService.getSyncHistory();
      setSyncHistory(history);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const testConnection = async () => {
    setError(null);
    
    try {
      const result = await cloudSyncService.testConnection();
      if (!result.success) {
        setError(result.message || 'Connection test failed');
      }
      // Update connection latency if sync info exists
      if (syncInfo) {
        setSyncInfo({
          ...syncInfo,
          connectionLatency: result.latency,
          status: result.success ? 'connected' : 'disconnected'
        });
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Initialize and set up polling when device is registered
  useEffect(() => {
    if (registrationStatus === 'registered') {
      refreshStatus();
      refreshHistory();
      
      const unsubscribe = cloudSyncService.onStatusUpdate(setSyncInfo);
      cloudSyncService.startStatusPolling(30000); // 30 seconds
      
      return () => {
        unsubscribe();
        cloudSyncService.stopStatusPolling();
      };
    }
  }, [registrationStatus]);

  // Monitor network status and update sync status accordingly
  useEffect(() => {
    const handleOnline = () => {
      if (registrationStatus === 'registered') {
        refreshStatus();
      }
    };

    const handleOffline = () => {
      if (syncInfo) {
        setSyncInfo({
          ...syncInfo,
          status: 'disconnected'
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [registrationStatus, syncInfo]);

  const value: CloudSyncContextType = {
    syncInfo,
    queueItems,
    syncHistory,
    isLoading,
    error,
    refreshStatus,
    triggerManualSync,
    retryFailedOperations,
    clearQueue,
    refreshHistory,
    testConnection,
    clearError
  };

  return (
    <CloudSyncContext.Provider value={value}>
      {children}
    </CloudSyncContext.Provider>
  );
};