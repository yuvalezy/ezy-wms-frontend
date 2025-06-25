import { RoleType } from "@/assets";

export interface AuthorizationGroup {
  id: string;
  name: string;
  description?: string;
  authorizations: RoleType[];
  canDelete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthorizationGroupFormData {
  name: string;
  description?: string;
  authorizations: RoleType[];
}

export interface AuthorizationGroupFilters {
  searchTerm?: string;
}

export interface RoleInfo {
  role: RoleType;
  displayName: string;
  description: string;
  category: string;
}