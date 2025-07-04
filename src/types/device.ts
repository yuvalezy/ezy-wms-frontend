export type DeviceStatus = 'pending' | 'active' | 'inactive' | 'disabled';

export interface DeviceInfo {
  uuid: string;
  registrationDate: Date;
  lastValidation: Date;
  status: DeviceStatus;
}

export interface DeviceRegistrationRequest {
  uuid: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  userAgent: string;
  screenResolution: string;
  timezone: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  device: {
    id: string;
    uuid: string;
    status: DeviceStatus;
    registrationDate: string;
    lastSeen: string;
  };
  message?: string;
}

export interface DeviceValidationResponse {
  isValid: boolean;
  status: DeviceStatus;
  message?: string;
}