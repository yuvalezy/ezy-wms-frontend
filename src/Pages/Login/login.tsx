import * as React from 'react';
import {useAuth} from "@/components";
import {useState} from "react";
import {Navigate} from "react-router-dom";
import LoginForm from "./login-form";
import {useThemeContext} from "@/components";


type Warehouse = {
    id: string;
    name: string;
};

export default function Login() {
    const [redirectToHome, setRedirectToHome] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [requiresWarehouse, setRequiresWarehouse] = useState(false);
    const [requiresDeviceName, setRequiresDeviceName] = useState(false);
    const [deviceNameTaken, setDeviceNameTaken] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [errorType, setErrorType] = useState<string>('');
    const {setLoading} = useThemeContext();

    const {login} = useAuth();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = data.get('password') as string;
        const warehouse = data.get('warehouse') as string | null;
        const newDeviceName = data.get('newDeviceName') as string | null;

        setLoading(true);
        
        // Clear device name taken alert when submitting
        setDeviceNameTaken(false);

        try {
            await login(password, warehouse || undefined, newDeviceName || undefined);
            setRedirectToHome(true);
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorCode = errorData?.error;
            
            // Check if it's a warehouse selection error
            if (errorCode === 'WAREHOUSE_SELECTION_REQUIRED') {
                setWarehouses(errorData.data.warehouses);
                setRequiresWarehouse(true);
                setErrorMessage('');
                setErrorType('');
            }
            // Check if it's a new device name required error
            else if (errorCode === 'NEW_DEVICE_NAME') {
                setRequiresDeviceName(true);
                setDeviceNameTaken(false);
                setErrorMessage('');
                setErrorType('');
            }
            // Check if device name is taken
            else if (errorCode === 'NEW_DEVICE_TAKEN') {
                setDeviceNameTaken(true);
                setErrorMessage('');
                setErrorType('');
                // Focus on device name input after render
                setTimeout(() => {
                    const deviceNameInput = document.getElementById('newDeviceName');
                    if (deviceNameInput) {
                        deviceNameInput.focus();
                    }
                }, 100);
            }
            else {
                if (errorCode === 'invalid_grant') {
                    setErrorType('invalid_grant');
                    setErrorMessage('');
                } else {
                    setErrorType('');
                    setErrorMessage(errorData?.error_description || error.message);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    if (redirectToHome) {
        return <Navigate to="/"/>;
    }

    return (<LoginForm 
        onSubmit={handleSubmit} 
        warehouses={warehouses} 
        requiresWarehouse={requiresWarehouse}
        requiresDeviceName={requiresDeviceName}
        deviceNameTaken={deviceNameTaken}
        errorMessage={errorMessage}
        errorType={errorType}
        onClearError={() => { 
            setErrorMessage(''); 
            setErrorType(''); 
            setRequiresDeviceName(false);
            setDeviceNameTaken(false);
        }}
    />)

}
