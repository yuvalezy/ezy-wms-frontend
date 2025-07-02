import { axiosInstance } from '@/utils/axios-instance';
import { 
  PackageDto, 
  CreatePackageRequest, 
  CancelPackageRequest, 
  LockPackageRequest,
  MovePackageRequest,
  PackageValidationResult
} from '../types';

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

export const getPackageByBarcode = async (barcode: string): Promise<PackageDto> => {
  try {
    const response = await axiosInstance.get<PackageDto>(`Package/barcode/${barcode}`);
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