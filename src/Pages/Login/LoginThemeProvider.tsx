import * as React from 'react';
import {createTheme, ThemeProvider} from '@mui/material/styles';

const defaultTheme = createTheme();

export default function LoginThemeProvider({children}: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={defaultTheme}>
            {children}
        </ThemeProvider>
    );
}
