import {axiosInstance} from "@/utils/axios-instance";
import {
  ExternalSystemAlert,
  ExternalSystemAlertRequest,
  ExternalSystemAlertUpdateRequest,
  ExternalSystemUser
} from "./external-alert";

export const externalAlertService = {
  // Get all external system users
  async getExternalUsers(): Promise<ExternalSystemUser[]> {
    const response = await axiosInstance.get<ExternalSystemUser[]>("ExternalSystemAlert/users");
    return response.data;
  },

  // Get all alerts
  async getAll(): Promise<ExternalSystemAlert[]> {
    const response = await axiosInstance.get<ExternalSystemAlert[]>("ExternalSystemAlert");
    return response.data;
  },

  // Create a new alert
  async create(request: ExternalSystemAlertRequest): Promise<ExternalSystemAlert> {
    const response = await axiosInstance.post<ExternalSystemAlert>("ExternalSystemAlert", request);
    return response.data;
  },

  // Update an alert
  async update(id: string, request: ExternalSystemAlertUpdateRequest): Promise<ExternalSystemAlert> {
    const response = await axiosInstance.put<ExternalSystemAlert>(`ExternalSystemAlert/${id}`, request);
    return response.data;
  },

  // Delete an alert
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`ExternalSystemAlert/${id}`);
  }
};
