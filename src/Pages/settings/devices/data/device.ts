export interface Device {
  id: string;
  deviceUuid: string;
  deviceName: string;
  status: string;
  registrationDate: string;
  statusNotes?: string;
}

export interface DeviceFilters {
  searchTerm?: string;
  status?: string;
}

export interface DeviceAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface UpdateDeviceStatusRequest {
  status: string;
  reason: string;
}

export interface UpdateDeviceNameRequest {
  deviceName: string;
}

export enum DeviceStatus {
  Active = "Active",
  Inactive = "Inactive", 
  Disabled = "Disabled"
}