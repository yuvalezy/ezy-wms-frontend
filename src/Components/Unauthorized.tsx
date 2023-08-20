import logo from "../logo.svg";
import React from "react";
import { Link } from 'react-router-dom';
import MenuAppBar from "../Components/MenuAppBar";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Box from "@mui/material/Box";

export default function Unauthorized() {
    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title="Unauthorized"></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(8)}}>
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Oops! You're not authorized to view this page.
                </p>
                <Link className="App-link" to="/">Return to Home</Link>
            </Box>
        </ThemeProvider>
    )
}
