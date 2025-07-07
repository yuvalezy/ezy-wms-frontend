import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios, {AxiosError} from "axios";
import {UserInfo} from "@/assets";
import {axiosInstance, ServerUrl} from "@/utils/axios-instance";
import {LicenseWarning} from "@/types/license";
import {getOrCreateDeviceUUID} from "@/utils/deviceUtils";
import {DeviceStatus} from "@/pages/settings/devices/data/device";
import DeviceStatusForm from "@/pages/settings/devices/components/device-status-form";

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  companyInfo?: CompanyInfoResponse | null;
  login: (password: string, warehouse?: string, newDeviceName?: string) => Promise<{
    deviceStatus?: DeviceStatus,
    superUser: boolean
  }>;
  logout: () => void;
  isLoading: boolean; // Add loading state
  updateDeviceStatus: (newStatus: DeviceStatus) => void;
}

const AuthContextDefaultValues: AuthContextType = {
  isAuthenticated: false,
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
};

export const AuthContext = createContext<AuthContextType>(
  AuthContextDefaultValues
);

interface AuthProviderProps {
  children: ReactNode;
}

interface ErrorResponse {
  error: string;
  error_description: string;
}

interface CompanyInfoResponse {
  companyName: string;
  serverTime: string; // ISO date string
  licenseWarnings: LicenseWarning[]; // Array of warning messages
  deviceStatus?: DeviceStatus;
}

interface LoginRequest {
  password: string;
  warehouse?: string;
  newDeviceName?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const baseUrl = `${ServerUrl}/api/`;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const deviceUUID = getOrCreateDeviceUUID();
        const response = await axios.get<CompanyInfoResponse>(`${baseUrl}Authentication/CompanyInfo`, {
          headers: {
            'X-Device-UUID': deviceUUID
          }
        });
        setCompanyInfo(response.data);
      } catch (error) {
        console.log(`Failed to load company name: ${error}`);
      }
    };

    fetchConfig();
  }, []);

  // Call the login function after setting the mock token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if token exists and is not expired
        const token = localStorage.getItem('authToken');
        const expiration = localStorage.getItem('tokenExpiration');

        if (token && expiration) {
          const expirationDate = new Date(expiration);
          const now = new Date();

          if (expirationDate > now) {
            // Token is valid, fetch user info
            const response = await axiosInstance.get<UserInfo>(`General/UserInfo`);
            setUser(response.data);
          } else {
            // Token expired, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiration');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Only clear tokens if we get a 401/403 error
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiration');
          setUser(null);
        }
        // For other errors, don't clear the token - might be a network issue
      } finally {
        setIsLoading(false); // Always set loading to false
      }
    };
    fetchUser()
  }, []);


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

      // Save token and expiration to localStorage
      if (loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token);
        localStorage.setItem('tokenExpiration', loginResponse.expiresAt);
      }

      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));

      const userInfoResponse = await axiosInstance.get<UserInfo>(`general/userInfo`);

      let data = userInfoResponse.data;
      if (data) {
        if (!data.superUser && data.deviceStatus !== DeviceStatus.Active) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenExpiration');
          throw new Error("Device is not active")
        }
        setUser(data);
        return {deviceStatus: data?.deviceStatus, superUser: data?.superUser ?? false};
      }
    }
    return {deviceStatus: DeviceStatus.Disabled, superUser: false};
  }

  const logout = async () => {
    try {
      await axiosInstance.post(`authentication/logout`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    setUser(null);
  };

  const updateDeviceStatus = (newStatus: DeviceStatus) => {
    if (user) {
      setUser({
        ...user,
        deviceStatus: newStatus
      });
    }
  };

  const isAuthenticated = user !== null;

  const value = {
    isAuthenticated,
    user,
    companyInfo,
    login,
    logout,
    isLoading,
    updateDeviceStatus,
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