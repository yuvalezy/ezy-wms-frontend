import { axiosInstance } from "@/utils/axios-instance";
import { AuthorizationGroup, AuthorizationGroupFormData, AuthorizationGroupFilters, RoleInfo } from "./authorization-group";
import { mockAuthorizationGroups, roleInfoMap } from "./authorization-group-mock-data";

export const authorizationGroupService = {
  // Get all authorization groups with optional filters
  async getAll(filters?: AuthorizationGroupFilters): Promise<AuthorizationGroup[]> {
    const response = await axiosInstance.get<AuthorizationGroup[]>("authorizationgroup", {
      params: filters
    });
    return response.data;
  },

  // Get a single authorization group by ID
  async getById(id: string): Promise<AuthorizationGroup> {
    const response = await axiosInstance.get<AuthorizationGroup>(`authorizationgroup/${id}`);
    return response.data;
  },

  // Create a new authorization group
  async create(data: AuthorizationGroupFormData): Promise<AuthorizationGroup> {
    const response = await axiosInstance.post<AuthorizationGroup>("authorizationgroup", data);
    return response.data;
  },

  // Update an existing authorization group
  async update(id: string, data: AuthorizationGroupFormData): Promise<AuthorizationGroup> {
    const updateRequest = {
      id,
      ...data
    };
    
    const response = await axiosInstance.put<AuthorizationGroup>("authorizationgroup", updateRequest);
    return response.data;
  },

  // Delete an authorization group
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`authorizationgroup/${id}`);
  },

  // Get role information for display
  getRoleInfo(): RoleInfo[] {
    return Array.from(roleInfoMap.values());
  }
};