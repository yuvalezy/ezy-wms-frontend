import React, { createContext, useContext, useState, useCallback } from "react";
import {BusyIndicator, MessageStripDesign} from "@ui5/webcomponents-react";
import './ThemeContext.css';
import ThemeProviderStatusAlert, {StatusAlert} from "./ThemeProviderStatusAlert";

const ThemeContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    alert: StatusAlert | null;
    setAlert: (alert: StatusAlert | null, timeout?: number) => void;
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
    const [alert, _setAlert] = useState<StatusAlert | null>(null);

    const setAlert = useCallback((newAlert: StatusAlert | null, timeout: number = 10000) => {
        _setAlert(newAlert);

        if (newAlert) {
            setTimeout(() => {
                _setAlert(null);
            }, timeout);
        }
    }, []);

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

        const newAlert: StatusAlert = {
            message: message,
            type: MessageStripDesign.Negative
        };
        setAlert(newAlert);
    }, []);

    return (
        <ThemeContext.Provider value={{ loading, setLoading, alert, setAlert, setError }}>
            {children}
            {loading && (
                <div className="loadingOverlay">
                    <BusyIndicator active />
                </div>
            )}
            {alert && <ThemeProviderStatusAlert onClose={() => setAlert(null)} alert={alert}/>}
        </ThemeContext.Provider>
    );
};
