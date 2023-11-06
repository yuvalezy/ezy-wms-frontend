// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios, { AxiosError } from "axios";
import { User } from "../assets/Common";
import { setGlobalConfig } from "../assets/GlobalConfig";
import { Authorization } from "../assets/Authorization";

// Define the shape of the context
export type Config = {
  baseURL: string;
  debug: boolean;
  mockup?: boolean;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  config: Config | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContextDefaultValues: AuthContextType = {
  isAuthenticated: false,
  user: null,
  config: null,
  login: async (username: string, password: string) => {
    console.warn("Login method not implemented yet!");
  },
  logout: () => {},
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get<Config>("/config.json");
        setConfig(response.data);
        setGlobalConfig(response.data);
      } catch (error) {
        const urlObject = new URL(window.location.href);
        const baseUrl = `${urlObject.protocol}//${urlObject.host}`;
        const config: Config = {
          baseURL: baseUrl,
          debug: true,
        };
        setConfig(config);
        setGlobalConfig(config);
        console.log("Failed to load config.json file, using default URL");
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


  const login = async (username: string, password: string) => {
    try {
      if (!config) return;

      if (config.debug) await new Promise((res) => setTimeout(res, 500));

      if (!config.mockup) {
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
    if (!config)
      return;
    const response = await axios.post(
        `${config.baseURL}/token`,
        {
          username,
          password,
          grant_type: "password",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
    );
    if (response.data && response.data.access_token) {
      const {access_token, expires_in} = response.data;

      localStorage.setItem("token", access_token);
      const expiryTime = new Date().getTime() + expires_in * 1000;
      localStorage.setItem("token_expiry", expiryTime.toString());

      setTimeout(logout, expires_in * 1000);

      const userInfoResponse = await axios.get<User>(
          `${config.baseURL}/api/General/UserInfo`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
      );

      if (userInfoResponse.data) {
        setUser(userInfoResponse.data);
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
      authorizations: [
        Authorization.GOODS_RECEIPT,
        Authorization.GOODS_RECEIPT_SUPERVISOR,
      ],
    };

    return setUser(userInfoResponse);
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    setUser(null);
  };

  const isAuthenticated = Boolean(
    localStorage.getItem("token") && user !== null
  );

  const value = {
    isAuthenticated,
    user,
    config,
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
