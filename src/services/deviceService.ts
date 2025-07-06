import { AxiosInstance } from 'axios';
import {  DeviceValidationResponse, DeviceStatus } from '../types/device';

export class DeviceService {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }


  async getDeviceStatus(uuid: string): Promise<DeviceStatus> {
    try {
      const response = await this.axiosInstance.get(`/api/devices/${uuid}/status`);
      return response.data.status;
    } catch (error: any) {
      throw new Error(`Failed to get device status: ${error.response?.data?.message || error.message}`);
    }
  }

  async validateDevice(uuid: string): Promise<DeviceValidationResponse> {
    try {
      const response = await this.axiosInstance.post(`/api/devices/${uuid}/validate`);
      return response.data;
    } catch (error: any) {
      console.error('Device validation failed:', error);
      return {
        isValid: false,
        status: 'inactive',
        message: error.response?.data?.message || 'Device validation failed'
      };
    }
  }

}