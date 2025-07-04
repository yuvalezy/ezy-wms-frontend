# Phase 3: Cloud Integration & Sync UI - Frontend

## Overview

Phase 3 focuses on creating UI components and services for cloud integration and synchronization monitoring. This phase provides users with visibility into cloud connectivity status, sync operations, queue management, and the ability to manually trigger synchronization when needed.

## Objectives

- Implement cloud connectivity monitoring and display
- Create sync status indicators and progress tracking
- Build queue management UI for failed operations
- Provide manual sync triggers and controls
- Handle offline/online state transitions gracefully
- Create comprehensive sync history and logging

## Technical Implementation

### 1. Cloud Sync Types and Interfaces

#### Sync Status Types
```typescript
// src/types/cloudSync.ts
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
  | 'queue_retry';

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
```

#### Cloud Sync Service
```typescript
// src/services/cloudSyncService.ts
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
    } catch (error) {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }
  }

  async triggerManualSync(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/manual');
    } catch (error) {
      throw new Error(`Manual sync failed: ${error.message}`);
    }
  }

  async getQueueStatus(): Promise<SyncQueueItem[]> {
    try {
      const response = await this.axiosInstance.get('/api/sync/queue');
      return response.data.map(this.transformQueueItem);
    } catch (error) {
      throw new Error(`Failed to get queue status: ${error.message}`);
    }
  }

  async retryFailedOperations(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/retry-failed');
    } catch (error) {
      throw new Error(`Failed to retry operations: ${error.message}`);
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/sync/clear-queue');
    } catch (error) {
      throw new Error(`Failed to clear queue: ${error.message}`);
    }
  }

  async getSyncHistory(limit: number = 50): Promise<SyncHistoryItem[]> {
    try {
      const response = await this.axiosInstance.get(`/api/sync/history?limit=${limit}`);
      return response.data.map(this.transformHistoryItem);
    } catch (error) {
      throw new Error(`Failed to get sync history: ${error.message}`);
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

  private transformSyncResponse(data: any): CloudSyncInfo {
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

  private transformQueueItem(data: any): SyncQueueItem {
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

  private transformHistoryItem(data: any): SyncHistoryItem {
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
```

### 2. Cloud Sync Context Provider

#### Context Implementation
```typescript
// src/contexts/CloudSyncContext.tsx
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
}

export const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export const CloudSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncInfo, setSyncInfo] = useState<CloudSyncInfo | null>(null);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deviceUUID } = useDevice();
  const cloudSyncService = new CloudSyncService(axiosInstance, deviceUUID);

  const refreshStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [status, queue] = await Promise.all([
        cloudSyncService.getSyncStatus(),
        cloudSyncService.getQueueStatus()
      ]);
      
      setSyncInfo(status);
      setQueueItems(queue);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setError(null);
    
    try {
      await cloudSyncService.triggerManualSync();
      await refreshStatus();
    } catch (error) {
      setError(error.message);
    }
  };

  const retryFailedOperations = async () => {
    setError(null);
    
    try {
      await cloudSyncService.retryFailedOperations();
      await refreshStatus();
    } catch (error) {
      setError(error.message);
    }
  };

  const clearQueue = async () => {
    setError(null);
    
    try {
      await cloudSyncService.clearQueue();
      await refreshStatus();
    } catch (error) {
      setError(error.message);
    }
  };

  const refreshHistory = async () => {
    try {
      const history = await cloudSyncService.getSyncHistory();
      setSyncHistory(history);
    } catch (error) {
      setError(error.message);
    }
  };

  // Initialize and set up polling
  useEffect(() => {
    refreshStatus();
    refreshHistory();
    
    const unsubscribe = cloudSyncService.onStatusUpdate(setSyncInfo);
    cloudSyncService.startStatusPolling();
    
    return () => {
      unsubscribe();
      cloudSyncService.stopStatusPolling();
    };
  }, []);

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
    refreshHistory
  };

  return (
    <CloudSyncContext.Provider value={value}>
      {children}
    </CloudSyncContext.Provider>
  );
};
```

### 3. Cloud Sync Status Components

#### Cloud Status Indicator
```typescript
// src/components/license/CloudStatusIndicator.tsx
export const CloudStatusIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { syncInfo } = useCloudSync();

  if (!syncInfo) return null;

  const getStatusConfig = (status: CloudSyncStatus) => {
    switch (status) {
      case 'connected':
        return {
          color: 'green',
          icon: Wifi,
          text: 'Connected',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        };
      case 'connecting':
        return {
          color: 'yellow',
          icon: Loader,
          text: 'Connecting...',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600'
        };
      case 'disconnected':
        return {
          color: 'red',
          icon: WifiOff,
          text: 'Disconnected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600'
        };
      case 'syncing':
        return {
          color: 'blue',
          icon: RefreshCw,
          text: 'Syncing...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600'
        };
      case 'error':
        return {
          color: 'red',
          icon: AlertCircle,
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600'
        };
      default:
        return {
          color: 'gray',
          icon: HelpCircle,
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(syncInfo.status);
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-4 w-4 ${config.textColor} ${syncInfo.status === 'syncing' ? 'animate-spin' : ''}`} />
        <span className={`text-sm ${config.textColor}`}>{config.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${config.bgColor}`}>
      <StatusIcon className={`h-5 w-5 ${config.textColor} ${syncInfo.status === 'syncing' ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <div className={`font-medium ${config.textColor}`}>{config.text}</div>
        {syncInfo.connectionLatency && (
          <div className="text-xs text-gray-500">
            Latency: {syncInfo.connectionLatency}ms
          </div>
        )}
      </div>
      {syncInfo.syncInProgress && syncInfo.syncProgress && (
        <div className="w-16">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncInfo.syncProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Cloud Sync Dashboard
```typescript
// src/components/license/CloudSyncDashboard.tsx
export const CloudSyncDashboard: React.FC = () => {
  const { 
    syncInfo, 
    queueItems, 
    isLoading, 
    error, 
    refreshStatus, 
    triggerManualSync,
    retryFailedOperations
  } = useCloudSync();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin mr-2" />
          <span>Loading sync status...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <p className="text-red-600 font-medium">Sync Error</p>
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={refreshStatus} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncInfo) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cloud Synchronization</CardTitle>
            <Button variant="outline" size="sm" onClick={refreshStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <CloudStatusIndicator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Last Sync</label>
                <p className="text-sm">{syncInfo.lastSyncTime.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Next Sync</label>
                <p className="text-sm">{syncInfo.nextSyncTime.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={triggerManualSync}
                disabled={!syncInfo.isManualSyncAvailable || syncInfo.syncInProgress}
                size="sm"
              >
                {syncInfo.syncInProgress ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              
              {syncInfo.failedOperations > 0 && (
                <Button 
                  onClick={retryFailedOperations}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Failed ({syncInfo.failedOperations})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {queueItems.length > 0 && <SyncQueueCard />}
    </div>
  );
};
```

#### Sync Queue Management
```typescript
// src/components/license/SyncQueueCard.tsx
export const SyncQueueCard: React.FC = () => {
  const { queueItems, clearQueue } = useCloudSync();

  const getOperationIcon = (operation: SyncOperationType) => {
    switch (operation) {
      case 'device_registration': return Smartphone;
      case 'license_validation': return Key;
      case 'status_update': return RefreshCw;
      case 'queue_retry': return RotateCcw;
      default: return HelpCircle;
    }
  };

  const getStatusColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'retrying': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const failedItems = queueItems.filter(item => item.status === 'failed');
  const processingItems = queueItems.filter(item => item.status === 'processing');
  const pendingItems = queueItems.filter(item => item.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sync Queue</CardTitle>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">
              {queueItems.length} items
            </span>
            {queueItems.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearQueue}
              >
                Clear Queue
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {failedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Failed Operations</h4>
              <div className="space-y-2">
                {failedItems.map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {processingItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Processing</h4>
              <div className="space-y-2">
                {processingItems.map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {pendingItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-600">Pending</h4>
              <div className="space-y-2">
                {pendingItems.slice(0, 5).map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
                {pendingItems.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... and {pendingItems.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const QueueItemRow: React.FC<{ item: SyncQueueItem }> = ({ item }) => {
  const OperationIcon = getOperationIcon(item.operation);
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div className="flex items-center gap-2">
        <OperationIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">
          {item.operation.replace('_', ' ')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${getStatusColor(item.status)}`}>
          {item.status.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">
          {item.attemptCount}/{item.maxAttempts}
        </span>
      </div>
    </div>
  );
};
```

### 4. Custom Hooks

#### useCloudSync Hook
```typescript
// src/hooks/useCloudSync.ts
export const useCloudSync = () => {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error('useCloudSync must be used within a CloudSyncProvider');
  }
  return context;
};
```

#### useOnlineStatus Hook
```typescript
// src/hooks/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

### 5. Sync History Component

#### Sync History Table
```typescript
// src/components/license/SyncHistoryTable.tsx
export const SyncHistoryTable: React.FC = () => {
  const { syncHistory, refreshHistory } = useCloudSync();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      refreshHistory();
    }
  }, [isExpanded, refreshHistory]);

  if (!isExpanded) {
    return (
      <Card>
        <CardContent className="py-4">
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(true)}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            View Sync History
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sync History</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {syncHistory.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {item.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {item.operation.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {item.timestamp.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {item.duration}ms
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

## Integration Points

### 1. App.tsx Integration
```typescript
// src/App.tsx (modifications)
import { CloudSyncProvider } from './contexts/CloudSyncContext';

function App() {
  return (
    <DeviceProvider>
      <LicenseProvider>
        <CloudSyncProvider>
          <AuthProvider>
            <ThemeProvider>
              {/* Rest of app */}
            </ThemeProvider>
          </AuthProvider>
        </CloudSyncProvider>
      </LicenseProvider>
    </DeviceProvider>
  );
}
```

### 2. Navigation Integration
Add cloud sync status to navigation bar or create dedicated sync management page.

## Testing Requirements

### Unit Tests
- Cloud sync service methods
- Status polling functionality
- Queue management operations
- History tracking

### Integration Tests
- Online/offline state transitions
- Manual sync triggering
- Queue retry operations
- Error handling scenarios

## Performance Considerations

- Efficient polling intervals
- Debounced manual sync triggers
- Optimized queue rendering
- Memory cleanup for intervals

## Success Criteria

- [ ] Cloud status displays correctly
- [ ] Manual sync functionality works
- [ ] Queue management is intuitive
- [ ] History tracking is accurate
- [ ] Error handling is comprehensive
- [ ] Performance is optimized

## Next Steps

1. Implement cloud sync service
2. Create sync status components
3. Build queue management UI
4. Add history tracking
5. Integrate with license validation
6. Create comprehensive tests
7. Add performance monitoring
8. Document sync operations