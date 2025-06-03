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
    const {setLoading} = useThemeContext();

    const {login} = useAuth();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = data.get('password') as string;
        const warehouse = data.get('warehouse') as string | null;

        setLoading(true);

        try {
            await login(password, warehouse || undefined);
            setRedirectToHome(true);
        } catch (error: any) {
            // Check if it's a warehouse selection error
            if (error?.response?.data?.error === 'WAREHOUSE_SELECTION_REQUIRED') {
                const errorData = error.response.data;
                setWarehouses(errorData.data.warehouses);
                setRequiresWarehouse(true);
            } else {
                alert(`Error during login: ${error?.response?.data?.error_description || error.message}`);
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
    />)

}
