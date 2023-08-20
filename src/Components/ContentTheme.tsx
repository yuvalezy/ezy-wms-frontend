import {Box, createTheme, ThemeProvider} from "@mui/material";
import MenuAppBar from "./MenuAppBar";
import React from "react";

interface ContentThemeProps {
    title: string;
    icon?: React.ReactElement;
    children?: React.ReactNode;
}

const ContentTheme : React.FC<ContentThemeProps> = ({title, icon, children}) => {
    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={title} icon={icon}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(10), paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2)}}>
                {children}
            </Box>
        </ThemeProvider>
    )
}

export default ContentTheme;