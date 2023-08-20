// AuthContext.tsx
import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import axios from "axios";
import config from "../config";
import {Authorization} from "../assets/Authorization";

// Define the shape of the context
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

interface User {
    id: number;
    name: string;
    authorizations: Authorization[];
}

const AuthContextDefaultValues: AuthContextType = {
    isAuthenticated: false,
    user: null,
    login: async (username: string, password: string) => {
        console.warn('Login method not implemented yet!');
    },
    logout: () => {},
}

export const AuthContext = createContext<AuthContextType>(AuthContextDefaultValues);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const expiry = localStorage.getItem('token_expiry');
        if (expiry && new Date().getTime() > Number(expiry)) {
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
            setUser(null);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${config.baseURL}/token`, {
                username,
                password,
                grant_type: 'password'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.data && response.data.access_token) {
                const {access_token, expires_in } = response.data;
                localStorage.setItem('token', access_token);
                const expiryTime = new Date().getTime() + expires_in * 1000;
                localStorage.setItem('token_expiry', expiryTime.toString());

                //todo load id, user actual first and last name and authorizations from rest api
                setUser({
                    id: 1,
                    name: username,
                    authorizations: [Authorization.GOODS_RECEIPT, Authorization.GOODS_RECEIPT_SUPERVISOR]
                });
            }

        } catch(error) {
            alert(`Failed to login: ${error}`);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        setUser(null);
    }

    const isAuthenticated = Boolean(localStorage.getItem('token') && user !== null);

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
