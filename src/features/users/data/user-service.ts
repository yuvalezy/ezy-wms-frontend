import {axiosInstance, None} from "@/utils/axios-instance";
import {AuthorizationGroup, ExternalUser, User, UserFilters, UserFormData, Warehouse} from "./user";

export const userService = {
  // Get all users with optional filters
  async getAll(filters?: UserFilters): Promise<User[]> {
    const response = await axiosInstance.get<User[]>("user", {
      params: filters
    });
    return response.data;
  },

  // Get a single user by ID
  async getById(id: string): Promise<User> {
    const response = await axiosInstance.get<User>(`user/${id}`);
    return response.data;
  },

  // Create a new user
  async create(data: UserFormData): Promise<User> {
    data = {
      ...data,
      email: data.email ? data.email : undefined,
      authorizationGroupId: data.authorizationGroupId !== None ? data.authorizationGroupId : undefined,
      externalId: data.externalId !== None ? data.externalId : undefined
    };
    const response = await axiosInstance.post<User>("user", data);
    return response.data;
  },

  // Update an existing user
  async update(id: string, data: UserFormData): Promise<User> {
    data = {
      ...data,
      email: data.email ? data.email : undefined,
      authorizationGroupId: data.authorizationGroupId !== None ? data.authorizationGroupId : undefined,
      externalId: data.externalId !== None ? data.externalId : undefined
    };
    const response = await axiosInstance.put<User>(`user/${id}`, data);
    return response.data;
  },

  // Delete a user
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`user/${id}`);
  },

  // Enable a user
  async enable(id: string): Promise<void> {
    await axiosInstance.post(`user/${id}/enable`);
  },

  // Disable a user
  async disable(id: string): Promise<void> {
    await axiosInstance.post(`user/${id}/disable`);
  },

  // Get external users
  async getExternalUsers(): Promise<ExternalUser[]> {
    const response = await axiosInstance.get<ExternalUser[]>("user/external");
    return response.data;
  },

  // Get authorization groups
  async getAuthorizationGroups(): Promise<AuthorizationGroup[]> {
    const response = await axiosInstance.get<AuthorizationGroup[]>("authorizationgroup");
    return response.data;
  },

  // Get warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    // This endpoint would need to be confirmed - might be a different endpoint
    const response = await axiosInstance.get<Warehouse[]>("general/warehouses");
    return response.data;
  }
};