import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios, {AxiosError} from "axios";
import {RoleType, UserInfo} from "@/assets";
import {axiosInstance, Mockup, ServerUrl} from "@/utils/axios-instance";

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  companyName?: string | null;
  login: (password: string, warehouse?: string) => Promise<void>;
  logout: () => void;
}

const AuthContextDefaultValues: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async (password: string, warehouse?: string) => {
    console.warn("Login method not implemented yet!");
  },
  logout: () => {
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

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const baseUrl = `${ServerUrl}/api/`;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get<string>(`${baseUrl}Authentication/CompanyName`);
        setCompanyName(response.data)
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
      }
    };
    fetchUser()
  }, []);


  const login = async (password: string, warehouse?: string) => {
    try {
      if (!Mockup) {
        return await loginExecute(password, warehouse);
      } else {
        return mockupLogin();
      }

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

  async function loginExecute(password: string, warehouse?: string) {
    const loginData: any = {password: password};
    if (warehouse) {
      loginData.warehouse = warehouse;
    }

    const response = await axios.post(`${baseUrl}authentication/login`, loginData, {withCredentials: true});
    if (response.status === 200) {
      const loginResponse = response.data;
      
      // Save token and expiration to localStorage
      if (loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token);
        localStorage.setItem('tokenExpiration', loginResponse.expiresAt);
        // Also set it in axios defaults immediately
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.token}`;
      }
      
      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userInfoResponse = await axiosInstance.get<UserInfo>(`general/userInfo`);

      let data = userInfoResponse.data;
      console.log(data);
      if (data) {
        setUser(data);
      }
    }
  }

  function mockupLogin() {
    const userInfoResponse: UserInfo = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "mockUser",
      currentWarehouse: "branch",
      binLocations: true,
      superUser: true,
      warehouses: [
        {id: "branch", name: "Branch Warehouse", enableBinLocations: true}
      ],
      roles: [
        RoleType.GOODS_RECEIPT,
        RoleType.GOODS_RECEIPT_SUPERVISOR,
        RoleType.PICKING,
        RoleType.PICKING_SUPERVISOR,
        RoleType.COUNTING,
        RoleType.COUNTING_SUPERVISOR,
      ],
      settings: {
        goodsReceiptDraft: false,
        goodsReceiptModificationSupervisor: true,
        goodsReceiptCreateSupervisorRequired: true,
        transferTargetItems: true,
      }
    };

    return setUser(userInfoResponse);
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

  const isAuthenticated = user !== null;

  const value = {
    isAuthenticated,
    user,
    companyName,
    login,
    logout,
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
