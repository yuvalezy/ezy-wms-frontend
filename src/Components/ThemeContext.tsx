import React, { createContext, useContext, useState, useCallback } from "react";
import {BusyIndicator} from "@ui5/webcomponents-react";
import './ThemeContext.css';
import ThemeProviderStatusAlert, {StatusAlert} from "./ThemeProviderStatusAlert";

const ThemeContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    alert: StatusAlert | null;
    setAlert: (alert: StatusAlert | null, timeout?: number) => void;
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

    return (
        <ThemeContext.Provider value={{ loading, setLoading, alert, setAlert }}>
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
