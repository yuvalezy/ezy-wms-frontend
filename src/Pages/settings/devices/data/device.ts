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
  previousStatus: string;
  newStatus: string;
  reason: string | null;
  changedAt: string;
  changedByUser: string;
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