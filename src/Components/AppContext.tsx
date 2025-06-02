// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {AxiosError} from "axios";
import {Authorization, User} from "@/assets";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  companyName?: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContextDefaultValues: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async (username: string, password: string) => {
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
  const [waitForTokenValidation, setWaitForTokenValidation] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axiosInstance.get<string>(`Authentication/CompanyName`);
        setCompanyName(response.data)
      } catch (error) {
        console.log(`Failed to load company name: ${error}`);
      }
    };

    fetchConfig();

    const expiry = localStorage.getItem("token_expiry");
    if (expiry && new Date().getTime() > Number(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiry");
      setUser(null);
    }
  }, []);

  // Call the login function after setting the mock token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiry = localStorage.getItem("token_expiry");
    if (token && expiry && new Date().getTime() < Number(expiry)) {
      // Fetch user info and set user state
      const fetchUser = async () => {
        try {
          const response = await axiosInstance.get<User>(
            `General/UserInfo`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUser(response.data);
        } catch (error) {
          // Token might be invalid, clear it
          localStorage.removeItem("token");
          localStorage.removeItem("token_expiry");
          setUser(null);
        }
      };
      fetchUser().finally(() => setWaitForTokenValidation(false));
    } else {
      setWaitForTokenValidation(false);
    }
  }, []);


  const login = async (username: string, password: string) => {
    try {
      if (!Mockup) {
        return await loginExecute(username, password);
      } else {
        return mockupLogin();
      }

      // Set the mock user data
    } catch (error) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as ErrorResponse;
      const error_description = data?.error_description;
      console.error(error);
      alert(`Failed to login: ${error_description || axiosError.message}`);
    }
  };

  async function loginExecute(username: string, password: string) {
    const response = await axiosInstance.post(`authentication/login`,
      {password: username},
      {withCredentials: true});
    if (response.data && response.data.access_token) {
      const {access_token, expires_in} = response.data;

      localStorage.setItem("token", access_token);
      const expiryTime = new Date().getTime() + expires_in * 1000;
      localStorage.setItem("token_expiry", expiryTime.toString());

      setTimeout(logout, expires_in * 1000);

      const userInfoResponse = await axiosInstance.get<User>(`General/UserInfo`);

      let data = userInfoResponse.data;
      console.log(data);
      if (data) {
        let settings = data.settings;
        setUser(data);
      }
    }
  }

  function mockupLogin() {
    const access_token = "juanse";
    const expires_in = 3600;

    localStorage.setItem("token", access_token);
    const expiryTime = new Date().getTime() + expires_in * 1000;
    localStorage.setItem("token_expiry", expiryTime.toString());

    setTimeout(logout, expires_in * 1000);

    const userInfoResponse = {
      id: 1,
      name: "mockUser",
      branch: "branch",
      binLocations: true,
      authorizations: [
        Authorization.GOODS_RECEIPT,
        Authorization.GOODS_RECEIPT_SUPERVISOR,
        Authorization.PICKING,
        Authorization.PICKING_SUPERVISOR,
        Authorization.COUNTING,
        Authorization.COUNTING_SUPERVISOR,
      ],
      settings: {
        grpoModificationSupervisor: true,
        grpoCreateSupervisorRequired: true,
        transferTargetItems: true,
      }
    };

    return setUser(userInfoResponse);
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    setUser(null);
  };

  const isAuthenticated = Boolean(
    localStorage.getItem("token") && (waitForTokenValidation || user !== null)
  );

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
