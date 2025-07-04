import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useCloudSync } from '../../contexts/CloudSyncContext';
import { CloudStatusIndicator } from './CloudStatusIndicator';
import { SyncQueueCard } from './SyncQueueCard';
import { SyncHistoryTable } from './SyncHistoryTable';

export const CloudSyncDashboard: React.FC = () => {
  const { 
    syncInfo, 
    queueItems, 
    isLoading, 
    error, 
    refreshStatus, 
    triggerManualSync,
    retryFailedOperations,
    testConnection,
    clearError
  } = useCloudSync();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Loading sync status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !syncInfo) {
    return (
      <div className="space-y-4">
        <Card className="w-full border-red-200">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-lg">Sync Error</p>
              </div>
              <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={refreshStatus} variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </Button>
                <Button onClick={clearError} variant="ghost">
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cloud Synchronization</h1>
        <div className="flex gap-2">
          <Button 
            onClick={testConnection} 
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test Connection
          </Button>
          <Button 
            onClick={refreshStatus} 
            variant="outline"
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <CloudStatusIndicator />
            
            {syncInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Sync</label>
                  <div className="text-sm text-gray-900">
                    <div>{formatDate(syncInfo.lastSyncTime)}</div>
                    <div className="text-xs text-gray-500">
                      {getTimeSince(syncInfo.lastSyncTime)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Next Sync</label>
                  <div className="text-sm text-gray-900">
                    <div>{formatDate(syncInfo.nextSyncTime)}</div>
                    <div className="text-xs text-gray-500">
                      {syncInfo.nextSyncTime > new Date() ? 'Scheduled' : 'Overdue'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={triggerManualSync}
                disabled={!syncInfo?.isManualSyncAvailable || syncInfo?.syncInProgress || isLoading}
                size="sm"
              >
                {syncInfo?.syncInProgress ? (
                  <>
                    <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Now
                  </>
                )}
              </Button>
              
              {syncInfo && syncInfo.failedOperations > 0 && (
                <Button 
                  onClick={retryFailedOperations}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Failed ({syncInfo.failedOperations})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Management */}
      {queueItems.length > 0 && <SyncQueueCard />}

      {/* Sync History */}
      <SyncHistoryTable />

      {/* Error Display */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800">Sync Issue</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {error} - Some operations may be queued for retry.
                </p>
              </div>
              <button
                onClick={clearError}
                className="ml-4 text-yellow-600 hover:text-yellow-800"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};