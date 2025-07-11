import { axiosInstance } from '@/utils/axios-instance';
import { 
  PackageContentDto, 
  AddItemToPackageRequest, 
  RemoveItemFromPackageRequest,
  PackageTransactionDto 
} from '../types';

export const addItemToPackage = async (id: string, request: AddItemToPackageRequest): Promise<PackageContentDto> => {
  try {
    const response = await axiosInstance.post<PackageContentDto>(`Package/${id}/contents`, request);
    return response.data;
  } catch (error) {
    console.error('Error adding item to package:', error);
    throw error;
  }
};

export const removeItemFromPackage = async (id: string, request: RemoveItemFromPackageRequest): Promise<PackageContentDto> => {
  try {
    const response = await axiosInstance.delete<PackageContentDto>(`Package/${id}/contents`, { data: request });
    return response.data;
  } catch (error) {
    console.error('Error removing item from package:', error);
    throw error;
  }
};

export const getPackageContents = async (id: string): Promise<PackageContentDto[]> => {
  try {
    const response = await axiosInstance.get<PackageContentDto[]>(`Package/${id}/contents`);
    return response.data;
  } catch (error) {
    console.error('Error getting package contents:', error);
    throw error;
  }
};

export const getPackageTransactions = async (id: string): Promise<PackageTransactionDto[]> => {
  try {
    const response = await axiosInstance.get<PackageTransactionDto[]>(`Package/${id}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Error getting package transactions:', error);
    throw error;
  }
};