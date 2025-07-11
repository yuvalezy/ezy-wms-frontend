import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {BaseEntity} from "@/features/shared/data";

export interface User extends BaseEntity {
  fullName: string;
  password?: string;
  email?: string;
  position?: string;
  superUser: boolean;
  active: boolean;
  warehouses: string[];
  externalId?: string;
  authorizationGroupId?: string;
  authorizationGroup?: AuthorizationGroup;
  authorizationGroupName?: string;
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

export interface AuthorizationGroup extends BaseEntity {
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