import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useLicense } from '../../contexts/LicenseContext';

export const LicenseDetailsCard: React.FC = () => {
  const { licenseInfo, refreshLicense, isLoading, validateLicense, isValidating } = useLicense();

  if (!licenseInfo) {
    return null;
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
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleValidate = async () => {
    await validateLicense();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>License Details</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleValidate}
              disabled={isValidating}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLicense}
              disabled={isLoading}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Connection Status</label>
              <div className="flex items-center gap-2">
                {licenseInfo.isOnline ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Last Validation</label>
              <div className="text-sm text-gray-900">
                <div>{formatDate(licenseInfo.lastValidation)}</div>
                <div className="text-xs text-gray-500">
                  {getTimeSince(licenseInfo.lastValidation)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Next Validation</label>
              <div className="text-sm text-gray-900">
                <div>{formatDate(licenseInfo.nextValidation)}</div>
                <div className="text-xs text-gray-500">
                  {licenseInfo.nextValidation > new Date() ? 'Scheduled' : 'Overdue'}
                </div>
              </div>
            </div>
          </div>

          {/* Enabled Features */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-500">Enabled Features</label>
            {licenseInfo.featuresEnabled.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {licenseInfo.featuresEnabled.map((feature) => (
                  <span 
                    key={feature}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No features enabled
              </div>
            )}
          </div>

          {/* Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Device Usage</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (licenseInfo.currentDeviceCount / licenseInfo.maxDevices) * 100)}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {licenseInfo.currentDeviceCount} / {licenseInfo.maxDevices}
                </span>
              </div>
              {licenseInfo.currentDeviceCount >= licenseInfo.maxDevices && (
                <p className="text-xs text-red-600">
                  Device limit reached. Remove unused devices or upgrade your license.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Device Status</label>
              <div className="flex items-center gap-2">
                {licenseInfo.deviceStatus === 'active' ? (
                  <>
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium capitalize">
                      {licenseInfo.deviceStatus}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-600 font-medium capitalize">
                      {licenseInfo.deviceStatus}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {licenseInfo.errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">License Error</p>
                  <p className="text-sm text-red-700 mt-1">{licenseInfo.errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};