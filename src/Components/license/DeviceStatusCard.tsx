import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useDevice } from '../../contexts/DeviceContext';
import { DeviceStatus } from '../../types/device';

export const DeviceStatusCard: React.FC = () => {
  const { deviceInfo, refreshDeviceInfo, isLoading } = useDevice();

  if (!deviceInfo) {
    return null;
  }

  const getStatusConfig = (status: DeviceStatus) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '✓',
          label: 'ACTIVE',
          description: 'Device is operational and ready to use'
        };
      case 'inactive':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '⚠',
          label: 'INACTIVE',
          description: 'Device is temporarily disabled'
        };
      case 'disabled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '✗',
          label: 'DISABLED',
          description: 'Device has been permanently disabled'
        };
      case 'pending':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: '○',
          label: 'PENDING',
          description: 'Device registration is pending approval'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '?',
          label: 'UNKNOWN',
          description: 'Device status is unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(deviceInfo.status);

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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  return (
    <Card className={`w-full ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Device Status</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDeviceInfo}
            disabled={isLoading}
            className="h-8"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></span>
            ) : (
              'Refresh'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div className="flex items-center">
              <span className={`text-lg mr-2 ${statusConfig.color}`}>
                {statusConfig.icon}
              </span>
              <span className={`text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            {statusConfig.description}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Device UUID</span>
              <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                {deviceInfo.uuid.split('-')[0]}...
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Registered</span>
              <span className="text-gray-600">
                {formatDate(deviceInfo.registrationDate)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Last Validation</span>
              <span className="text-gray-600">
                {getTimeSince(deviceInfo.lastValidation)}
              </span>
            </div>
          </div>

          {deviceInfo.status === 'disabled' && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
              <p className="text-xs text-red-800">
                This device has been disabled. Please contact support for assistance.
              </p>
            </div>
          )}

          {deviceInfo.status === 'pending' && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded">
              <p className="text-xs text-blue-800">
                Device registration is pending. This may take a few minutes to complete.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};