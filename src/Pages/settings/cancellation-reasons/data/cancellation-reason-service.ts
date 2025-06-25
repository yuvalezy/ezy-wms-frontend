import { axiosInstance } from "@/utils/axios-instance";
import { CancellationReason, CancellationReasonFormData, CancellationReasonFilters, ObjectType } from "./cancellation-reason";
import { mockCancellationReasons } from "./cancellation-reason-mock-data";

export const cancellationReasonService = {
  // Get all cancellation reasons with optional filters
  async getAll(filters?: CancellationReasonFilters): Promise<CancellationReason[]> {
    const params: any = {};
    if (filters?.objectType) params.ObjectType = filters.objectType;
    if (filters?.includeDisabled !== undefined) params.IncludeDisabled = filters.includeDisabled;
    if (filters?.searchTerm !== undefined && filters.searchTerm.length > 0) params.searchTerm = filters.searchTerm;

    const response = await axiosInstance.get<CancellationReason[]>("cancellationreason", { params });
    return response.data;
  },

  // Get a single cancellation reason by ID
  async getById(id: string): Promise<CancellationReason> {
    const response = await axiosInstance.get<CancellationReason>(`cancellationreason/${id}`);
    return response.data;
  },

  // Create a new cancellation reason
  async create(data: CancellationReasonFormData): Promise<CancellationReason> {
    const response = await axiosInstance.post<CancellationReason>("cancellationreason", data);
    return response.data;
  },

  // Update an existing cancellation reason
  async update(id: string, data: CancellationReasonFormData): Promise<CancellationReason> {
    const updateRequest = {
      id,
      ...data
    };
    
    const response = await axiosInstance.put<CancellationReason>("cancellationreason", updateRequest);
    return response.data;
  },

  // Delete a cancellation reason
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`cancellationreason/${id}`);
  }
};