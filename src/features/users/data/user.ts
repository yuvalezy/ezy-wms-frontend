import { RoleType } from "@/assets";

export interface User {
  id: string;
  fullName: string;
  email?: string;
  position?: string;
  superUser: boolean;
  active: boolean;
  warehouses: string[];
  externalId?: string;
  authorizationGroupId?: string;
  authorizationGroupName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserFormData {
  fullName: string;
  password?: string;
  email?: string;
  position?: string;
  superUser: boolean;
  warehouses: string[];
  externalId?: string;
  authorizationGroupId?: string;
}

export interface UserFilters {
  searchTerm?: string;
  warehouseId?: string;
  authorizationGroupId?: string;
  includeInactive?: boolean;
}

export interface ExternalUser {
  id: string;
  name: string;
}

export interface AuthorizationGroup {
  id: string;
  name: string;
  description?: string;
  authorizations: RoleType[];
}

export interface Warehouse {
  id: string;
  name: string;
  enableBinLocations: boolean;
}