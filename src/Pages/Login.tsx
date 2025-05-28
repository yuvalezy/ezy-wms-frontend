import * as React from 'react';
import {useAuth} from "@/components";
import {useState} from "react";
import {Navigate} from "react-router-dom";
import LoginForm from "./Login/LoginForm";
import {useThemeContext} from "@/components";


export default function Login() {
    const [redirectToHome, setRedirectToHome] = useState(false);
    const {setLoading} = useThemeContext();

    const {login} = useAuth();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let username = data.get('username') as string;

        setLoading(true);

        login(username, "")
            .then(() => setRedirectToHome(true))
            .catch((error) => {
                alert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
    };

    if (redirectToHome) {
        return <Navigate to="/"/>;
    }

    return (<LoginForm onSubmit={handleSubmit}/>)

}
