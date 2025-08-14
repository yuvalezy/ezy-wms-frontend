import { axiosInstance } from '@/utils/axios-instance';
import {
  PackageDto,
  CreatePackageRequest,
  CancelPackageRequest,
  LockPackageRequest,
  MovePackageRequest,
  PackageValidationResult, ObjectType,
  UpdatePackageMetadataRequest,
} from '../types';
import {MetadataDefinition} from "@/features/items";

export const createPackage = async (request: CreatePackageRequest): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>('Package', request);
    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

export const getPackage = async (id: string): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.get<PackageDto>(`Package/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting package:', error);
    throw error;
  }
};

interface PackageByBarcodeRequest {
  barcode: string;
  contents?: boolean;
  history?: boolean;
  details?: boolean;
  binEntry?: number;
  objectId?: string;
  objectType?: ObjectType;
}

export const getPackageByBarcode = async (parameters: PackageByBarcodeRequest): Promise<PackageDto | null> => {
  try {
    const response = await axiosInstance.post<PackageDto | null>(`package/barcode`, parameters);
    return response.data;
  } catch (error) {
    console.error('Error getting package by barcode:', error);
    throw error;
  }
};

export const getActivePackages = async (): Promise<PackageDto[]> => {
  try {
    const response = await axiosInstance.get<PackageDto[]>('Package');
    return response.data;
  } catch (error) {
    console.error('Error getting active packages:', error);
    throw error;
  }
};

export const closePackage = async (id: string): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>(`Package/${id}/close`);
    return response.data;
  } catch (error) {
    console.error('Error closing package:', error);
    throw error;
  }
};

export const cancelPackage = async (id: string, request: CancelPackageRequest): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>(`Package/${id}/cancel`, request);
    return response.data;
  } catch (error) {
    console.error('Error cancelling package:', error);
    throw error;
  }
};

export const lockPackage = async (id: string, request: LockPackageRequest): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>(`Package/${id}/lock`, request);
    return response.data;
  } catch (error) {
    console.error('Error locking package:', error);
    throw error;
  }
};

export const unlockPackage = async (id: string): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>(`Package/${id}/unlock`);
    return response.data;
  } catch (error) {
    console.error('Error unlocking package:', error);
    throw error;
  }
};

export const movePackage = async (id: string, request: MovePackageRequest): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.post<PackageDto>(`Package/${id}/move`, request);
    return response.data;
  } catch (error) {
    console.error('Error moving package:', error);
    throw error;
  }
};

export const validatePackage = async (id: string): Promise<PackageValidationResult> => {
  try {
    const response = await axiosInstance.get<PackageValidationResult>(`Package/${id}/validate`);
    return response.data;
  } catch (error) {
    console.error('Error validating package:', error);
    throw error;
  }
};

export const generateBarcode = async (): Promise<{ barcode: string }> => {
  try {
    const response = await axiosInstance.post<{ barcode: string }>('Package/generate-barcode');
    return response.data;
  } catch (error) {
    console.error('Error generating barcode:', error);
    throw error;
  }
};

export const updatePackageMetadata = async (id: string, request: UpdatePackageMetadataRequest): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.put<PackageDto>(`Package/${id}/metadata`, request);
    return response.data;
  } catch (error) {
    console.error('Error updating package metadata:', error);
    throw error;
  }
};

export const getMetadataDefinitions = async (): Promise<MetadataDefinition[]> => {
  try {
    const response = await axiosInstance.get<MetadataDefinition[]>('General/package-metadata-definitions');
    return response.data;
  } catch (error) {
    console.error('Error getting metadata definitions:', error);
    throw error;
  }
};