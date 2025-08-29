import React, {createContext, useCallback, useContext, useState} from "react";
import {Loader2} from "lucide-react";
import {toast} from "sonner";

const ThemeContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: (error: any) => void;
} | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const setError = useCallback((error: any) => {
        let message = error;
        //check if error is String
        if (typeof error !== 'string') {
            window.console.error(error);
            if (error.message)
                message = error.message;
            if (error.response?.data?.exceptionMessage)
                message = error.response?.data?.exceptionMessage;
            if (error.response?.data?.message)
                message = error.response?.data?.message;
            if (error.response?.data?.error)
                message = error.response?.data?.error;
            if (error.response?.data?.errors)
                message = error.response?.data?.errors;
            if (error.response?.data?.exception)
                message = error.response?.data?.exception;
            if (error.response?.data?.stacktrace)
                message = error.response?.data?.stacktrace;
            if (error.response?.data?.exceptionMessage)
                message = error.response?.data?.exceptionMessage;
            message = `Error: ${message}`;
        }
        toast.error(message);
    }, []);

    return (
        <ThemeContext.Provider value={{ loading, setLoading, setError }}>
            {children}
            {loading && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-white/50 flex justify-center items-center z-[1000]"
                >
                    <Loader2 className="h-12 w-12 animate-spin text-primary" /> {/* Added size and color */}
                </div>
            )}
        </ThemeContext.Provider>
    );
};
