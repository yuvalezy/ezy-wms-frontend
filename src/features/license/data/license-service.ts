import { axiosInstance } from '@/utils/axios-instance';
import {LicenseStatusResponse, QueueStatusResponse} from './license';

export const licenseService = {
  async getLicenseStatus(): Promise<LicenseStatusResponse> {
    try {
      const response = await axiosInstance.get<LicenseStatusResponse>('/license/status');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get license status: ${error.response?.data?.message || error.message}`);
    }
  },

  async getQueueStatus(): Promise<QueueStatusResponse> {
    try {
      const response = await axiosInstance.get<QueueStatusResponse>('/license/queue-status');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get queue status: ${error.response?.data?.message || error.message}`);
    }
  },

  async forceSync(): Promise<void> {
    try {
      await axiosInstance.post('/license/force-sync');
    } catch (error: any) {
      throw new Error(`Failed to force sync: ${error.response?.data?.message || error.message}`);
    }
  }
}
