import {axiosInstance} from "@/utils/axios-instance";
import {CancellationReason, CancellationReasonFilters, CancellationReasonFormData} from "./cancellation-reason";

export const cancellationReasonService = {
  // Get all cancellation reasons with optional filters
  async getAll(filters?: CancellationReasonFilters): Promise<CancellationReason[]> {
    const params: any = {};
    if (filters?.objectType) params.ObjectType = filters.objectType;
    if (filters?.includeDisabled !== undefined) params.IncludeDisabled = filters.includeDisabled;
    if (filters?.searchTerm !== undefined && filters.searchTerm.length > 0) params.searchTerm = filters.searchTerm;

    const response = await axiosInstance.get<CancellationReason[]>("cancellationReason", { params });
    return response.data;
  },

  // Get a single cancellation reason by ID
  async getById(id: string): Promise<CancellationReason> {
    const response = await axiosInstance.get<CancellationReason>(`cancellationReason/${id}`);
    return response.data;
  },

  // Create a new cancellation reason
  async create(data: CancellationReasonFormData): Promise<CancellationReason> {
    const response = await axiosInstance.post<CancellationReason>("cancellationReason", data);
    return response.data;
  },

  // Update an existing cancellation reason
  async update(id: string, data: CancellationReasonFormData): Promise<CancellationReason> {
    const updateRequest = {
      id,
      ...data
    };
    
    const response = await axiosInstance.put<CancellationReason>("cancellationReason", updateRequest);
    return response.data;
  },

  // Delete a cancellation reason
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`cancellationReason/${id}`);
  }
};