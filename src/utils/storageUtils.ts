import { DeviceInfo } from '../types/device';

export const STORAGE_KEYS = {
  DEVICE_UUID: 'deviceUUID',
  DEVICE_INFO: 'deviceInfo',
  REGISTRATION_STATUS: 'registrationStatus'
} as const;

export const getDeviceInfo = (): DeviceInfo | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_INFO);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      registrationDate: new Date(parsed.registrationDate),
      lastValidation: new Date(parsed.lastValidation)
    };
  } catch (error) {
    console.error('Error parsing device info from localStorage:', error);
    return null;
  }
};

export const setDeviceInfo = (info: DeviceInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(info));
  } catch (error) {
    console.error('Error storing device info to localStorage:', error);
  }
};

export const clearDeviceInfo = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DEVICE_INFO);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_STATUS);
  } catch (error) {
    console.error('Error clearing device info from localStorage:', error);
  }
};

export const getRegistrationStatus = (): 'pending' | 'registered' | 'failed' | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REGISTRATION_STATUS) as 'pending' | 'registered' | 'failed' | null;
  } catch (error) {
    console.error('Error getting registration status from localStorage:', error);
    return null;
  }
};

export const setRegistrationStatus = (status: 'pending' | 'registered' | 'failed'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_STATUS, status);
  } catch (error) {
    console.error('Error setting registration status to localStorage:', error);
  }
};