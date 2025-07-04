import { AxiosInstance } from 'axios';
import { LicenseInfo, LicenseValidationResult, LicenseStatusResponse } from '../types/license';

export class LicenseService {
  private axiosInstance: AxiosInstance;
  private deviceUUID: string;

  constructor(axiosInstance: AxiosInstance, deviceUUID: string) {
    this.axiosInstance = axiosInstance;
    this.deviceUUID = deviceUUID;
  }

  async getLicenseStatus(): Promise<LicenseInfo> {
    try {
      const response = await this.axiosInstance.get('/api/license/status');
      return this.transformLicenseResponse(response.data);
    } catch (error: any) {
      throw new Error(`Failed to get license status: ${error.response?.data?.message || error.message}`);
    }
  }

  async validateLicense(): Promise<LicenseValidationResult> {
    try {
      const response = await this.axiosInstance.post('/api/license/validate');
      return response.data;
    } catch (error: any) {
      throw new Error(`License validation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async refreshLicenseCache(): Promise<void> {
    try {
      await this.axiosInstance.post('/api/license/refresh');
    } catch (error: any) {
      throw new Error(`Failed to refresh license cache: ${error.response?.data?.message || error.message}`);
    }
  }

  async checkLicenseHealth(): Promise<{ isHealthy: boolean; message?: string }> {
    try {
      const response = await this.axiosInstance.get('/api/license/health');
      return response.data;
    } catch (error: any) {
      return {
        isHealthy: false,
        message: error.response?.data?.message || 'License service is unavailable'
      };
    }
  }

  private transformLicenseResponse(data: LicenseStatusResponse): LicenseInfo {
    return {
      accountStatus: data.accountStatus,
      deviceStatus: data.deviceStatus,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      gracePeriodEnd: data.gracePeriodEnd ? new Date(data.gracePeriodEnd) : undefined,
      demoExpirationDate: data.demoExpirationDate ? new Date(data.demoExpirationDate) : undefined,
      featuresEnabled: data.featuresEnabled || [],
      maxDevices: data.maxDevices || 0,
      currentDeviceCount: data.currentDeviceCount || 0,
      lastValidation: new Date(data.lastValidation),
      nextValidation: new Date(data.nextValidation),
      isOnline: data.isOnline ?? true,
      warningMessage: data.warningMessage,
      errorMessage: data.errorMessage
    };
  }
}