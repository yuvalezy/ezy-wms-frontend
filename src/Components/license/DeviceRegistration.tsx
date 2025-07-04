import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { useDevice } from '../../contexts/DeviceContext';

export const DeviceRegistration: React.FC = () => {
  const {
    deviceUUID,
    registrationStatus,
    isLoading,
    error,
    registerDevice,
    clearError
  } = useDevice();

  const handleRegister = async () => {
    clearError();
    await registerDevice();
  };

  if (registrationStatus === 'registered') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">Device Registered</CardTitle>
          <CardDescription>
            Your device has been successfully registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Device UUID</label>
              <code className="block text-xs bg-gray-100 p-2 rounded mt-1 break-all font-mono">
                {deviceUUID}
              </code>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <span className="mr-2">✓</span>
              Your device is registered and ready to use
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Device Registration</CardTitle>
        <CardDescription>
          Register this device to continue using Light WMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Device ID</label>
            <code className="block text-xs bg-gray-100 p-2 rounded mt-1 break-all font-mono">
              {deviceUUID}
            </code>
            <p className="text-xs text-gray-500 mt-1">
              This unique identifier will be used to register your device
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">✗</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {registrationStatus === 'failed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Registration failed. Please try again or contact support if the problem persists.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Registering...
              </>
            ) : (
              'Register Device'
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Registration requires an internet connection and may take a few moments
          </div>
        </div>
      </CardContent>
    </Card>
  );
};