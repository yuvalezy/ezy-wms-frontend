import * as React from 'react';
import {useAuth} from "../Components/AppContext";
import {useState} from "react";
import {Navigate} from "react-router-dom";
import LoginForm from "./Login/LoginForm";
import {useLoading} from "../Components/LoadingContext";


export default function Login() {
    const [redirectToHome, setRedirectToHome] = useState(false);
    const { setLoading} = useLoading();

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
