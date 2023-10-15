import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
