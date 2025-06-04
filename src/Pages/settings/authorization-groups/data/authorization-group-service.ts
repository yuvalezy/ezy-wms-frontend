import { axiosInstance, Mockup } from "@/utils/axios-instance";
import { AuthorizationGroup, AuthorizationGroupFormData, AuthorizationGroupFilters, RoleInfo } from "./authorization-group";
import { mockAuthorizationGroups, roleInfoMap } from "./authorization-group-mock-data";

export const authorizationGroupService = {
  // Get all authorization groups with optional filters
  async getAll(filters?: AuthorizationGroupFilters): Promise<AuthorizationGroup[]> {
    if (Mockup) {
      let results = [...mockAuthorizationGroups];
      
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        results = results.filter(ag => 
          ag.name.toLowerCase().includes(searchLower) ||
          ag.description?.toLowerCase().includes(searchLower)
        );
      }
      
      return results;
    }
    
    const response = await axiosInstance.get<AuthorizationGroup[]>("authorizationgroup", {
      params: filters
    });
    return response.data;
  },

  // Get a single authorization group by ID
  async getById(id: string): Promise<AuthorizationGroup> {
    if (Mockup) {
      const group = mockAuthorizationGroups.find(ag => ag.id === id);
      if (!group) {
        throw new Error("Authorization group not found");
      }
      return group;
    }
    
    const response = await axiosInstance.get<AuthorizationGroup>(`authorizationgroup/${id}`);
    return response.data;
  },

  // Create a new authorization group
  async create(data: AuthorizationGroupFormData): Promise<AuthorizationGroup> {
    if (Mockup) {
      const newGroup: AuthorizationGroup = {
        id: `ag-${Date.now()}`,
        canDelete: true,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockAuthorizationGroups.push(newGroup);
      return newGroup;
    }
    
    const response = await axiosInstance.post<AuthorizationGroup>("authorizationgroup", data);
    return response.data;
  },

  // Update an existing authorization group
  async update(id: string, data: AuthorizationGroupFormData): Promise<AuthorizationGroup> {
    if (Mockup) {
      const index = mockAuthorizationGroups.findIndex(ag => ag.id === id);
      if (index === -1) {
        throw new Error("Authorization group not found");
      }
      
      const updatedGroup: AuthorizationGroup = {
        ...mockAuthorizationGroups[index],
        ...data,
        updatedAt: new Date()
      };
      mockAuthorizationGroups[index] = updatedGroup;
      return updatedGroup;
    }
    
    const updateRequest = {
      id,
      ...data
    };
    
    const response = await axiosInstance.put<AuthorizationGroup>("authorizationgroup", updateRequest);
    return response.data;
  },

  // Delete an authorization group
  async delete(id: string): Promise<void> {
    if (Mockup) {
      const index = mockAuthorizationGroups.findIndex(ag => ag.id === id);
      if (index === -1) {
        throw new Error("Authorization group not found");
      }
      mockAuthorizationGroups.splice(index, 1);
      return;
    }
    
    await axiosInstance.delete(`authorizationgroup/${id}`);
  },

  // Get role information for display
  getRoleInfo(): RoleInfo[] {
    return Array.from(roleInfoMap.values());
  }
};