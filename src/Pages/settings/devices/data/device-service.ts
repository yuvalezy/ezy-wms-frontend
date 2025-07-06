import {axiosInstance} from "@/utils/axios-instance";
import {Device, DeviceFilters, DeviceAuditEntry, UpdateDeviceStatusRequest, UpdateDeviceNameRequest} from "./device";

export const deviceService = {
  // Get all devices with optional filters
  async getAll(filters?: DeviceFilters): Promise<Device[]> {
    const response = await axiosInstance.get<Device[]>("device", {
      params: filters
    });
    return response.data;
  },

  // Get a single device by UUID
  async getByUuid(deviceUuid: string): Promise<Device> {
    const response = await axiosInstance.get<Device>(`device/${deviceUuid}`);
    return response.data;
  },

  // Update device status
  async updateStatus(deviceUuid: string, request: UpdateDeviceStatusRequest): Promise<void> {
    await axiosInstance.put(`device/${deviceUuid}/status`, request);
  },

  // Update device name
  async updateName(deviceUuid: string, request: UpdateDeviceNameRequest): Promise<void> {
    await axiosInstance.put(`device/${deviceUuid}/name`, request);
  },

  // Get audit history for a device
  async getAuditHistory(deviceUuid: string): Promise<DeviceAuditEntry[]> {
    const response = await axiosInstance.get<DeviceAuditEntry[]>(`device/${deviceUuid}/audit`);
    return response.data;
  }
};