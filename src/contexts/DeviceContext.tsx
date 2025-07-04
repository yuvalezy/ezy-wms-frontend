import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceInfo, DeviceRegistrationRequest, DeviceStatus } from '../types/device';
import { DeviceService } from '../services/deviceService';
import { getOrCreateDeviceUUID, getDeviceFingerprint } from '../utils/deviceUtils';
import { getDeviceInfo, setDeviceInfo, getRegistrationStatus, setRegistrationStatus } from '../utils/storageUtils';
import { axiosInstance } from '../utils/axios-instance';

export interface DeviceContextType {
  deviceUUID: string;
  deviceInfo: DeviceInfo | null;
  registrationStatus: 'pending' | 'registered' | 'failed';
  isLoading: boolean;
  error: string | null;
  registerDevice: () => Promise<void>;
  validateDevice: () => Promise<boolean>;
  refreshDeviceInfo: () => Promise<void>;
  clearError: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceUUID] = useState(() => getOrCreateDeviceUUID());
  const [deviceInfo, setDeviceInfoState] = useState<DeviceInfo | null>(() => getDeviceInfo());
  const [registrationStatus, setRegistrationStatusState] = useState<'pending' | 'registered' | 'failed'>(() => 
    getRegistrationStatus() || 'pending'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const deviceService = new DeviceService(axiosInstance);

  const registerDevice = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const registrationRequest: DeviceRegistrationRequest = {
        uuid: deviceUUID,
        deviceType: 'web',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await deviceService.registerDevice(registrationRequest);
      
      if (response.success) {
        const newDeviceInfo: DeviceInfo = {
          uuid: deviceUUID,
          registrationDate: new Date(response.device.registrationDate),
          lastValidation: new Date(),
          status: response.device.status
        };
        
        setDeviceInfoState(newDeviceInfo);
        setDeviceInfo(newDeviceInfo);
        setRegistrationStatusState('registered');
        setRegistrationStatus('registered');
      } else {
        setRegistrationStatusState('failed');
        setRegistrationStatus('failed');
        setError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      setRegistrationStatusState('failed');
      setRegistrationStatus('failed');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDevice = async (): Promise<boolean> => {
    try {
      const response = await deviceService.validateDevice(deviceUUID);
      
      if (deviceInfo) {
        const updatedInfo = {
          ...deviceInfo,
          lastValidation: new Date(),
          status: response.status
        };
        setDeviceInfoState(updatedInfo);
        setDeviceInfo(updatedInfo);
      }
      
      return response.isValid;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const refreshDeviceInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const deviceData = await deviceService.refreshDeviceInfo(deviceUUID);
      
      if (deviceData) {
        const updatedInfo: DeviceInfo = {
          uuid: deviceUUID,
          registrationDate: new Date(deviceData.registrationDate),
          lastValidation: new Date(),
          status: deviceData.status
        };
        
        setDeviceInfoState(updatedInfo);
        setDeviceInfo(updatedInfo);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Auto-register device if not registered
  useEffect(() => {
    if (registrationStatus === 'pending' && deviceUUID && !isLoading) {
      registerDevice();
    }
  }, [registrationStatus, deviceUUID]);

  const value: DeviceContextType = {
    deviceUUID,
    deviceInfo,
    registrationStatus,
    isLoading,
    error,
    registerDevice,
    validateDevice,
    refreshDeviceInfo,
    clearError
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};