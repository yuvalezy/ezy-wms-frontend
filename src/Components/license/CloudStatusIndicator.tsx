import React from 'react';
import { useCloudSync } from '../../contexts/CloudSyncContext';
import { CloudSyncStatus } from '../../types/cloudSync';

interface CloudStatusIndicatorProps {
  compact?: boolean;
}

export const CloudStatusIndicator: React.FC<CloudStatusIndicatorProps> = ({ compact = false }) => {
  const { syncInfo } = useCloudSync();

  if (!syncInfo) {
    return null;
  }

  const getStatusConfig = (status: CloudSyncStatus) => {
    switch (status) {
      case 'connected':
        return {
          color: 'green',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          ),
          text: 'Connected',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          animate: false
        };
      case 'connecting':
        return {
          color: 'yellow',
          icon: (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          text: 'Connecting...',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          animate: true
        };
      case 'disconnected':
        return {
          color: 'red',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
          ),
          text: 'Disconnected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          animate: false
        };
      case 'syncing':
        return {
          color: 'blue',
          icon: (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          text: 'Syncing...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          animate: true
        };
      case 'error':
        return {
          color: 'red',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          text: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          animate: false
        };
      default:
        return {
          color: 'gray',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          animate: false
        };
    }
  };

  const config = getStatusConfig(syncInfo.status);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={config.textColor}>
          {config.icon}
        </span>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
        {syncInfo.connectionLatency && (
          <span className="text-xs text-gray-500">
            ({syncInfo.connectionLatency}ms)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config.bgColor}`}>
      <span className={config.textColor}>
        {config.icon}
      </span>
      <div className="flex-1">
        <div className={`font-medium ${config.textColor}`}>
          {config.text}
        </div>
        {syncInfo.connectionLatency && (
          <div className="text-xs text-gray-500 mt-1">
            Latency: {syncInfo.connectionLatency}ms
          </div>
        )}
        {syncInfo.errorMessage && (
          <div className="text-xs text-red-600 mt-1">
            {syncInfo.errorMessage}
          </div>
        )}
      </div>
      {syncInfo.syncInProgress && syncInfo.syncProgress !== undefined && (
        <div className="w-16">
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div 
              className="bg-current h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, syncInfo.syncProgress))}%` }}
            />
          </div>
          <div className="text-xs text-center mt-1 text-gray-600">
            {Math.round(syncInfo.syncProgress)}%
          </div>
        </div>
      )}
    </div>
  );
};