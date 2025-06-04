import { axiosInstance, Mockup } from "@/utils/axios-instance";
import { CancellationReason, CancellationReasonFormData, CancellationReasonFilters, ObjectType } from "./cancellation-reason";
import { mockCancellationReasons } from "./cancellation-reason-mock-data";

export const cancellationReasonService = {
  // Get all cancellation reasons with optional filters
  async getAll(filters?: CancellationReasonFilters): Promise<CancellationReason[]> {
    if (Mockup) {
      let results = [...mockCancellationReasons];
      
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        results = results.filter(r => 
          r.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters?.includeDisabled === false) {
        results = results.filter(r => r.isEnabled);
      }
      
      if (filters?.objectType) {
        results = results.filter(r => {
          switch (filters.objectType) {
            case ObjectType.GOODS_RECEIPT:
              return r.goodsReceipt;
            case ObjectType.TRANSFER:
              return r.transfer;
            case ObjectType.INVENTORY_COUNTING:
              return r.counting;
            default:
              return true;
          }
        });
      }
      
      return results;
    }
    
    const params: any = {};
    if (filters?.objectType) params.ObjectType = filters.objectType;
    if (filters?.includeDisabled !== undefined) params.IncludeDisabled = filters.includeDisabled;
    if (filters?.searchTerm !== undefined && filters.searchTerm.length > 0) params.searchTerm = filters.searchTerm;

    const response = await axiosInstance.get<CancellationReason[]>("cancellationreason", { params });
    return response.data;
  },

  // Get a single cancellation reason by ID
  async getById(id: string): Promise<CancellationReason> {
    if (Mockup) {
      const reason = mockCancellationReasons.find(r => r.id === id);
      if (!reason) {
        throw new Error("Cancellation reason not found");
      }
      return reason;
    }
    
    const response = await axiosInstance.get<CancellationReason>(`cancellationreason/${id}`);
    return response.data;
  },

  // Create a new cancellation reason
  async create(data: CancellationReasonFormData): Promise<CancellationReason> {
    if (Mockup) {
      const newReason: CancellationReason = {
        id: `cr-${Date.now()}`,
        isEnabled: data.isEnabled ?? true,
        canDelete: true,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCancellationReasons.push(newReason);
      return newReason;
    }
    
    const response = await axiosInstance.post<CancellationReason>("cancellationreason", data);
    return response.data;
  },

  // Update an existing cancellation reason
  async update(id: string, data: CancellationReasonFormData): Promise<CancellationReason> {
    if (Mockup) {
      const index = mockCancellationReasons.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error("Cancellation reason not found");
      }
      
      const updatedReason: CancellationReason = {
        ...mockCancellationReasons[index],
        ...data,
        updatedAt: new Date()
      };
      mockCancellationReasons[index] = updatedReason;
      return updatedReason;
    }
    
    const updateRequest = {
      id,
      ...data
    };
    
    const response = await axiosInstance.put<CancellationReason>("cancellationreason", updateRequest);
    return response.data;
  },

  // Delete a cancellation reason
  async delete(id: string): Promise<void> {
    if (Mockup) {
      const index = mockCancellationReasons.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error("Cancellation reason not found");
      }
      mockCancellationReasons.splice(index, 1);
      return;
    }
    
    await axiosInstance.delete(`cancellationreason/${id}`);
  }
};