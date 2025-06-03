import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios, {AxiosError} from "axios";
import {RoleType, User} from "@/assets";
import {Mockup, ServerUrl} from "@/utils/axios-instance";

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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
        const response = await axios.get<User>(`${baseUrl}General/UserInfo`, {withCredentials: true});
        setUser(response.data);
      } catch (error) {
        // Token might be invalid, clear it
        setUser(null);
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
      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userInfoResponse = await axios.get<User>(`${baseUrl}general/userInfo`, {withCredentials: true});

      let data = userInfoResponse.data;
      console.log(data);
      if (data) {
        setUser(data);
      }
    }
  }

  function mockupLogin() {
    const userInfoResponse: User = {
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
      await axios.post(`${baseUrl}authentication/logout`, null, {withCredentials: true});
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
