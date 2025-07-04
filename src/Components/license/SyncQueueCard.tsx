import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useCloudSync } from '../../contexts/CloudSyncContext';
import { SyncOperationType, SyncQueueItem } from '../../types/cloudSync';

export const SyncQueueCard: React.FC = () => {
  const { queueItems, clearQueue, retryFailedOperations } = useCloudSync();

  const getOperationIcon = (operation: SyncOperationType) => {
    switch (operation) {
      case 'device_registration':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'license_validation':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'status_update':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'queue_retry':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'manual_sync':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'retrying':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'retrying':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatOperationName = (operation: SyncOperationType) => {
    return operation.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const failedItems = queueItems.filter(item => item.status === 'failed');
  const processingItems = queueItems.filter(item => item.status === 'processing');
  const retryingItems = queueItems.filter(item => item.status === 'retrying');
  const pendingItems = queueItems.filter(item => item.status === 'pending');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntilRetry = (nextRetry: Date) => {
    const now = new Date();
    const diffMs = nextRetry.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Now';
    } else if (diffMinutes === 1) {
      return '1 min';
    } else {
      return `${diffMinutes} mins`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sync Queue</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {queueItems.length} item{queueItems.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              {failedItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryFailedOperations}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Failed
                </Button>
              )}
              {queueItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearQueue}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Queue
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Processing Items */}
          {processingItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-600 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Processing ({processingItems.length})
              </h4>
              <div className="space-y-2">
                {processingItems.map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Retrying Items */}
          {retryingItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retrying ({retryingItems.length})
              </h4>
              <div className="space-y-2">
                {retryingItems.map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Failed Items */}
          {failedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Failed ({failedItems.length})
              </h4>
              <div className="space-y-2">
                {failedItems.map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-600 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending ({pendingItems.length})
              </h4>
              <div className="space-y-2">
                {pendingItems.slice(0, 5).map(item => (
                  <QueueItemRow key={item.id} item={item} />
                ))}
                {pendingItems.length > 5 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    ... and {pendingItems.length - 5} more pending items
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
  const getOperationIcon = (operation: SyncOperationType) => {
    switch (operation) {
      case 'device_registration':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'license_validation':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
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

  const getStatusBgColor = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'retrying': return 'bg-blue-50 border-blue-200';
      case 'failed': return 'bg-red-50 border-red-200';
      case 'processing': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatOperationName = (operation: SyncOperationType) => {
    return operation.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntilRetry = (nextRetry: Date) => {
    const now = new Date();
    const diffMs = nextRetry.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Now';
    } else if (diffMinutes === 1) {
      return '1 min';
    } else {
      return `${diffMinutes} mins`;
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded ${getStatusBgColor(item.status)}`}>
      <div className="flex items-center gap-3">
        <span className="text-gray-600">
          {getOperationIcon(item.operation)}
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {formatOperationName(item.operation)}
          </div>
          <div className="text-xs text-gray-500">
            Created: {formatDate(item.createdAt)}
          </div>
          {item.errorMessage && (
            <div className="text-xs text-red-600 mt-1">
              {item.errorMessage}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className={`text-xs font-medium uppercase ${getStatusColor(item.status)}`}>
            {item.status}
          </div>
          <div className="text-xs text-gray-500">
            {item.attemptCount}/{item.maxAttempts} attempts
          </div>
          {item.status === 'failed' && item.nextRetry > new Date() && (
            <div className="text-xs text-gray-500">
              Retry in: {getTimeUntilRetry(item.nextRetry)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};