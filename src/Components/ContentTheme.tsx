import {Box, createTheme, ThemeProvider} from "@mui/material";
import MenuAppBar from "./MenuAppBar";
import React from "react";
import CircularProgressOverlay from "./CircularProgressOverlay";

interface ContentThemeProps {
    title: string;
    icon?: React.ReactElement;
    children?: React.ReactNode;
    loading?: boolean;
}

const ContentTheme : React.FC<ContentThemeProps> = ({title, icon, children, loading}) => {
    const theme = createTheme();
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={title} icon={icon}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(10), paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2)}}>
                {children}
            </Box>
            {loading && <CircularProgressOverlay />}
        </ThemeProvider>
    )
}

export default ContentTheme;