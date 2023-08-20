import logo from "../logo.svg";
import React from "react";
import MenuAppBar from "../Components/MenuAppBar";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Box from "@mui/material/Box";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import {TextValue} from "../assets/TextValue";

export default function GoodsReceiptSupervisor() {
    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={TextValue.GoodsReceiptSupervisor} icon={<SupervisedUserCircleIcon />}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(8)}}>
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <div>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                    Empty content<br/>
                </div>
            </Box>
        </ThemeProvider>
    )
}