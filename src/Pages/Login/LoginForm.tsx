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
import CircularProgressOverlay from "../../Components/CircularProgressOverlay";
import {useLoading} from "../../Components/LoadingContext";
import {useTranslation} from "react-i18next";  // Adjust the path based on your directory structure

type LoginFormProps = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function LoginForm({onSubmit}: LoginFormProps) {
    const {t} = useTranslation();
    const {loading} = useLoading();
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
                                label={t('Code')}
                                type="password"
                                id="username"
                                autoComplete="current-password"
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
