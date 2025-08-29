import { axiosInstance } from '@/utils/axios-instance';
import { PackageInconsistencyDto } from '../types';

export const validateConsistency = async (whsCode?: string): Promise<PackageInconsistencyDto[]> => {
  try {
    const params = whsCode ? { whsCode } : {};
    const response = await axiosInstance.post<PackageInconsistencyDto[]>('Package/validate-consistency', null, { params });
    return response.data;
  } catch (error) {
    console.error('Error validating consistency:', error);
    throw error;
  }
};