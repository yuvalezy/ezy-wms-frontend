import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LoginThemeProvider from './LoginThemeProvider';
import CircularProgressOverlay from "../../Components/CircularProgressOverlay";  // Adjust the path based on your directory structure

type LoginFormProps = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    loading: boolean;
};

export default function LoginForm({onSubmit, loading}: LoginFormProps) {
    return (
        <>
            {loading && <CircularProgressOverlay/>}
            <LoginThemeProvider>
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
                        <Box component="form" onSubmit={onSubmit} noValidate sx={{mt: 1}}>
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
            </LoginThemeProvider>
        </>
    );
}
