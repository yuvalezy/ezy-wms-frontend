import { axiosInstance } from '@/utils/axios-instance';
import { PackageLocationHistoryDto } from '../types';

export const getPackageMovements = async (id: string): Promise<PackageLocationHistoryDto[]> => {
  try {
    const response = await axiosInstance.get<PackageLocationHistoryDto[]>(`Package/${id}/movements`);
    return response.data;
  } catch (error) {
    console.error('Error getting package movements:', error);
    throw error;
  }
};