import {axiosInstance, Mockup, None} from "@/utils/axios-instance";
import {User, UserFormData, UserFilters, ExternalUser, AuthorizationGroup, Warehouse} from "./user";
import {mockUsers, mockAuthorizationGroups, mockWarehouses, mockExternalUsers} from "./user-mock-data";

export const userService = {
  // Get all users with optional filters
  async getAll(filters?: UserFilters): Promise<User[]> {
    if (Mockup) {
      let results = [...mockUsers];

      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        results = results.filter(u =>
          u.fullName.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.position?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.includeInactive === false) {
        results = results.filter(u => u.active);
      }

      if (filters?.warehouseId) {
        // results = results.filter(u =>
        //   u.warehouses.some(w => w.id === filters.warehouseId)
        // );
      }

      if (filters?.authorizationGroupId) {
        results = results.filter(u => u.authorizationGroupId === filters.authorizationGroupId);
      }

      return results;
    }

    const response = await axiosInstance.get<User[]>("user", {
      params: filters
    });
    return response.data;
  },

  // Get a single user by ID
  async getById(id: string): Promise<User> {
    if (Mockup) {
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }

    const response = await axiosInstance.get<User>(`user/${id}`);
    return response.data;
  },

  // Create a new user
  async create(data: UserFormData): Promise<User> {
    if (Mockup) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        active: true,
        // warehouses: mockWarehouses.filter(w => data.warehouses.includes(w.id)),
        authorizationGroupName: data.authorizationGroupId ?
          mockAuthorizationGroups.find(ag => ag.id === data.authorizationGroupId)?.name : undefined,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockUsers.push(newUser);
      return newUser;
    }

    data = {
      ...data,
      authorizationGroupId: data.authorizationGroupId !== None ? data.authorizationGroupId : undefined,
      externalId: data.externalId !== None ? data.externalId : undefined
    };
    const response = await axiosInstance.post<User>("user", data);
    return response.data;
  },

  // Update an existing user
  async update(id: string, data: UserFormData): Promise<User> {
    if (Mockup) {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error("User not found");
      }

      const updatedUser: User = {
        ...mockUsers[index],
        // warehouses: mockWarehouses.filter(w => data.warehouses.includes(w.id)),
        authorizationGroupName: data.authorizationGroupId ?
          mockAuthorizationGroups.find(ag => ag.id === data.authorizationGroupId)?.name : undefined,
        ...data,
        updatedAt: new Date()
      };
      mockUsers[index] = updatedUser;
      return updatedUser;
    }
    data = {
      ...data,
      authorizationGroupId: data.authorizationGroupId !== None ? data.authorizationGroupId : undefined,
      externalId: data.externalId !== None ? data.externalId : undefined
    };
    const response = await axiosInstance.put<User>(`user/${id}`, data);
    return response.data;
  },

  // Delete a user
  async delete(id: string): Promise<void> {
    if (Mockup) {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error("User not found");
      }
      mockUsers.splice(index, 1);
      return;
    }

    await axiosInstance.delete(`user/${id}`);
  },

  // Enable a user
  async enable(id: string): Promise<void> {
    if (Mockup) {
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error("User not found");
      }
      user.active = true;
      user.updatedAt = new Date();
      return;
    }

    await axiosInstance.post(`user/${id}/enable`);
  },

  // Disable a user
  async disable(id: string): Promise<void> {
    if (Mockup) {
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error("User not found");
      }
      user.active = false;
      user.updatedAt = new Date();
      return;
    }

    await axiosInstance.post(`user/${id}/disable`);
  },

  // Get external users
  async getExternalUsers(): Promise<ExternalUser[]> {
    if (Mockup) {
      return mockExternalUsers;
    }

    const response = await axiosInstance.get<ExternalUser[]>("user/external");
    return response.data;
  },

  // Get authorization groups
  async getAuthorizationGroups(): Promise<AuthorizationGroup[]> {
    if (Mockup) {
      return mockAuthorizationGroups;
    }

    const response = await axiosInstance.get<AuthorizationGroup[]>("authorizationgroup");
    return response.data;
  },

  // Get warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    if (Mockup) {
      return mockWarehouses;
    }

    // This endpoint would need to be confirmed - might be a different endpoint
    const response = await axiosInstance.get<Warehouse[]>("general/warehouses");
    return response.data;
  }
};