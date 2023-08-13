// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

interface User {
    id: number;
    name: string;
    authorizations: Authorization[];
}

export enum Authorization {
    GOODS_RECEIPT = 'GOODS_RECEIPT',
    GOODS_RECEIPT_SUPERVISOR = 'GOODS_RECEIPT_SUPERVISOR'
}

const AuthContextDefaultValues: AuthContextType = {
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {},
}

export const AuthContext = createContext<AuthContextType>(AuthContextDefaultValues);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (userDetails: User) => {
        // In a real-world scenario, you'd make API calls, handle tokens, etc.
        setUser(userDetails);
    }

    const logout = () => {
        setUser(null);
    }

    const value = {
        isAuthenticated: user !== null,
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
