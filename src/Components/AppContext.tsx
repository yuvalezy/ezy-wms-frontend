import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState,} from "react";
import axios, {AxiosError} from "axios";
import {axiosInstance, ServerUrl} from "@/utils/axios-instance";
import {getOrCreateDeviceUUID} from "@/utils/deviceUtils";
import {DeviceStatus} from "@/features/devices/data/device";
import {AccountState} from "@/features/account/data/account";
import {UserInfo, LoginRequest, ErrorResponse} from "@/features/login/data/login";
import {UnitType} from "@/features/shared/data";
import { useTranslation } from 'react-i18next';
import { useIdleTimeout } from '@/features/login/hooks/useIdleTimeout';
import { useCompanyInfo, CompanyInfoResponse } from '@/features/login/hooks/useCompanyInfo';
import { useBrowserUnload } from '@/features/login/hooks/useBrowserUnload';
import { useAuthInitialization } from '@/features/login/hooks/useAuthInitialization';

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  isDeviceActive: boolean;
  isValidAccount: boolean;
  user: UserInfo | null;
  companyInfo?: CompanyInfoResponse | null;
  login: (password: string, warehouse?: string, newDeviceName?: string) => Promise<{
    deviceStatus?: DeviceStatus,
    superUser: boolean
  }>;
  logout: () => void;
  isLoading: boolean; // Add loading state
  updateDeviceStatus: (newStatus: DeviceStatus) => void;
  showDeviceStatusBanner: boolean;
  setShowDeviceStatusBanner: (show: boolean) => void;
  reloadCompanyInfo: () => Promise<void>;
  unitSelection: boolean;
  defaultUnit: UnitType;
}

const AuthContextDefaultValues: AuthContextType = {
  isAuthenticated: false,
  isDeviceActive: false,
  isValidAccount: false,
  user: null,
  login: async (password: string, warehouse?: string, newDeviceName?: string) => {
    console.warn("Login method not implemented yet!");
    return {deviceStatus: undefined, superUser: false}
  },
  logout: () => {
  },
  isLoading: true, // Default to loading
  updateDeviceStatus: (newStatus: DeviceStatus) => {
    console.warn("updateDeviceStatus method not implemented yet!");
  },
  showDeviceStatusBanner: true,
  setShowDeviceStatusBanner: (show: boolean) => {
    console.warn("setShowDeviceStatusBanner method not implemented yet!");
  },
  reloadCompanyInfo: async () => {
    console.warn("reloadCompanyInfo method not implemented yet!");
  },
  unitSelection: true,
  defaultUnit: UnitType.Pack,
};

export const AuthContext = createContext<AuthContextType>(
  AuthContextDefaultValues
);

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [showDeviceStatusBanner, setShowDeviceStatusBanner] = useState(true);
  const baseUrl = `${ServerUrl}/api/`;

  // Use custom hooks
  const { companyInfo, reloadCompanyInfo } = useCompanyInfo();
  useBrowserUnload();

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(`authentication/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    // Clear token from sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('tokenExpiration');
    setUser(null);
  }, []);

  // Use idle timeout hook
  useIdleTimeout({ user, onTimeout: logout });
  
  // Initialize auth state
  useAuthInitialization({ setUser, setIsLoading });


  const login = async (password: string, warehouse?: string, newDeviceName?: string) => {
    try {
      return await loginExecute(password, warehouse, newDeviceName);

      // Set the mock user data
    } catch (error) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as ErrorResponse;
      const error_description = data?.error_description;
      console.error(error_description ?? error);
      // Re-throw the error so the login component can handle warehouse selection
      throw error;
    }
  };

  async function loginExecute(password: string, warehouse?: string, newDeviceName?: string) {
    const loginData: LoginRequest = {password: password};
    if (warehouse) {
      loginData.warehouse = warehouse;
    }
    if (newDeviceName) {
      loginData.newDeviceName = newDeviceName;
    }

    const response = await axios.post(`${baseUrl}authentication/login`, loginData, {
      withCredentials: true,
      headers: {
        'X-Device-UUID': getOrCreateDeviceUUID()
      }
    });
    if (response.status === 200) {
      const loginResponse = response.data;

      // Save token and expiration to sessionStorage
      if (loginResponse.token) {
        sessionStorage.setItem('authToken', loginResponse.token);
        sessionStorage.setItem('tokenExpiration', loginResponse.expiresAt);
      }

      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));

      const userInfoResponse = await axiosInstance.get<UserInfo>(`general/userInfo`);

      let data = userInfoResponse.data;
      if (data) {
        if (!data.superUser && data.deviceStatus !== DeviceStatus.Active) {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('tokenExpiration');
          throw new Error("Device is not active")
        }
        setUser(data);
        return {deviceStatus: data?.deviceStatus, superUser: data?.superUser ?? false};
      }
    }
    return {deviceStatus: DeviceStatus.Disabled, superUser: false};
  }

  const updateDeviceStatus = (newStatus: DeviceStatus) => {
    if (user) {
      setUser({
        ...user,
        deviceStatus: newStatus
      });
    }
  };


  const isAuthenticated = user !== null;
  const isDeviceActive = user?.deviceStatus === DeviceStatus.Active;
  const validStatuses = [AccountState.Active, AccountState.PaymentDue, AccountState.PaymentDueUnknown, AccountState.Demo];
  const isValidAccount = validStatuses.some(v => v === companyInfo?.accountStatus);
  const unitSelection = user?.settings?.enableUnitSelection ?? true;
  const defaultUnit = user?.settings?.defaultUnitType ?? UnitType.Pack;

  const value = {
    isAuthenticated,
    isDeviceActive,
    isValidAccount,
    user,
    companyInfo,
    login,
    logout,
    isLoading,
    updateDeviceStatus,
    showDeviceStatusBanner,
    setShowDeviceStatusBanner,
    reloadCompanyInfo,
    unitSelection,
    defaultUnit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};