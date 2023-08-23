import * as React from 'react';
import {useAuth} from "../Components/AppContext";
import {useState} from "react";
import {Navigate} from "react-router-dom";
import LoginForm from "./Login/LoginForm";


export default function Login() {
    const [redirectToHome, setRedirectToHome] = useState(false);
    const [loading, setLoading] = useState(false);

    const {login} = useAuth();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let username = data.get('username') as string;

        setLoading(true);

        setTimeout(() => {
            login(username, "")
                .then(() => setRedirectToHome(true))
                .catch((error) => {
                    alert(`Error fetching documents: ${error}`);
                })
                .finally(() => setLoading(false));
        }, 2000);
        //todo remove setTimeout
    };

    if (redirectToHome) {
        return <Navigate to="/"/>;
    }

    return (<LoginForm onSubmit={handleSubmit} loading={loading}/>)

}
