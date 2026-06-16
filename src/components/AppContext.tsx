import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState,} from "react";
import axios, {AxiosError} from "axios";
import {axiosInstance, clearStoredAuth, ServerUrl, setAuthFailureCallback} from "@/utils/axios-instance";
import {getOrCreateDeviceUUID} from "@/utils/deviceUtils";
import {DeviceStatus} from "@/features/devices/data/device";
import {AccountState} from "@/features/account/data/account";
import {ErrorResponse, LoginRequest, ResolvedUnitSettings, UserInfo} from "@/features/login/data/login";
import {UnitType} from "@/features/shared/data";
import {getUnitSettings} from "@/utils/unit-settings";
import {useIdleTimeout} from '@/features/login/hooks/useIdleTimeout';
import {CompanyInfoResponse, useCompanyInfo} from '@/features/login/hooks/useCompanyInfo';
import {useBrowserUnload} from '@/features/login/hooks/useBrowserUnload';
import {useAuthInitialization} from '@/features/login/hooks/useAuthInitialization';
import i18n from '@/i18n';

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  isDeviceActive: boolean;
  isValidAccount: boolean;
  user: UserInfo | null;
  companyInfo?: CompanyInfoResponse | null;
  connectionError: boolean;
  login: (password: string, warehouse?: string, newDeviceName?: string) => Promise<{
    deviceStatus?: DeviceStatus,
    superUser: boolean
  }>;
  logout: () => void;
  clearSession: () => void;
  refreshSession: () => Promise<boolean>;
  isLoading: boolean; // Add loading state
  authVersion: number;
  updateDeviceStatus: (newStatus: DeviceStatus) => void;
  showDeviceStatusBanner: boolean;
  setShowDeviceStatusBanner: (show: boolean) => void;
  reloadCompanyInfo: () => Promise<void>;
  unitSelection: boolean;
  enableUseBaseUn: boolean;
  defaultUnit: UnitType;
  displayVendor: boolean;
  getUnitSettings: (objectType?: string) => ResolvedUnitSettings;
}

const AuthContextDefaultValues: AuthContextType = {
  displayVendor: false,
  isAuthenticated: false,
  isDeviceActive: false,
  isValidAccount: false,
  user: null,
  connectionError: false,
  login: async (password: string, warehouse?: string, newDeviceName?: string) => {
    console.warn("Login method not implemented yet!");
    return {deviceStatus: undefined, superUser: false}
  },
  logout: () => {
  },
  clearSession: () => {
  },
  refreshSession: async () => false,
  isLoading: true, // Default to loading
  authVersion: 0,
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
  enableUseBaseUn: true,
  defaultUnit: UnitType.Pack,
  getUnitSettings: () => ({
    defaultUnitType: UnitType.Pack,
    enableUnitSelection: true,
    enableUseBaseUn: true,
    maxUnitLevel: undefined,
  }),
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
  const [authVersion, setAuthVersion] = useState(0);
  const baseUrl = `${ServerUrl}/api/`;

  const clearSession = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setAuthVersion(v => v + 1);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = sessionStorage.getItem('authToken');
    const expiration = sessionStorage.getItem('tokenExpiration');

    if (!token || !expiration) {
      clearSession();
      return false;
    }

    if (new Date(expiration) <= new Date()) {
      clearSession();
      return false;
    }

    try {
      const response = await axiosInstance.get<UserInfo>(`general/userInfo`);
      setUser(response.data);
      setAuthVersion(v => v + 1);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearSession();
      }
      return false;
    }
  }, [clearSession]);

  // Use custom hooks
  const { companyInfo, connectionError, isLoading: isCompanyLoading, reloadCompanyInfo } = useCompanyInfo();
  useBrowserUnload();

  useEffect(() => {
    setAuthFailureCallback(clearSession);
  }, [clearSession]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(`authentication/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    clearSession();
  }, [clearSession]);

  // Use idle timeout hook
  useIdleTimeout({ user, onTimeout: logout });
  
  // Initialize auth state
  useAuthInitialization({ refreshSession, setIsLoading });


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
          clearSession();
          throw new Error(i18n.t('deviceStatusBanner.notActive', 'Your device is not active. Please contact your administrator.'))
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
  const enableUseBaseUn = user?.settings?.enableUseBaseUn ?? true;
  const defaultUnit = user?.settings?.defaultUnitType ?? UnitType.Pack;
  const displayVendor = user?.settings?.displayVendor ?? true;

  const getUnitSettingsForType = useCallback((objectType?: string): ResolvedUnitSettings => {
    if (!user?.settings) {
      return {
        defaultUnitType: UnitType.Pack,
        enableUnitSelection: true,
        enableUseBaseUn: true,
        maxUnitLevel: undefined,
      };
    }
    return getUnitSettings(user.settings, objectType);
  }, [user?.settings]);

  const value = {
    isAuthenticated,
    isDeviceActive,
    isValidAccount,
    user,
    companyInfo,
    connectionError,
    login,
    logout,
    clearSession,
    refreshSession,
    isLoading: isLoading || isCompanyLoading,
    authVersion,
    updateDeviceStatus,
    showDeviceStatusBanner,
    setShowDeviceStatusBanner,
    reloadCompanyInfo,
    unitSelection,
    enableUseBaseUn,
    defaultUnit,
    displayVendor,
    getUnitSettings: getUnitSettingsForType,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
