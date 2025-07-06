import {DeviceStatus} from "@/pages/settings/devices/data/device";

export interface DeviceInfo {
  uuid: string;
  registrationDate: Date;
  lastValidation: Date;
  status: DeviceStatus;
}

export interface DeviceValidationResponse {
  isValid: boolean;
  status: DeviceStatus;
  message?: string;
}