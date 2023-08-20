import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {useAuth} from "../Components/AppContext";
import {useState} from "react";
import {Navigate} from "react-router-dom";

const defaultTheme = createTheme();

export default function Login() {
    const [redirectToHome, setRedirectToHome] = useState(false);

    const {login} = useAuth();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let username = data.get('username') as string;
        login(username, "")
            .then(() => setRedirectToHome(true));
    };

    if (redirectToHome) {
        return <Navigate to="/" />;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        WMS
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="username"
                            label="Code"
                            type="password"
                            id="username"
                            autoComplete="current-password"
                            value="981496230b-a8a4-4713"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Entrar
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
