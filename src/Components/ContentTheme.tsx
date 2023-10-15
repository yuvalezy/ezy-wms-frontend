import {Box, createTheme, ThemeProvider} from "@mui/material";
import MenuAppBar from "./MenuAppBar";
import React from "react";
import CircularProgressOverlay from "./CircularProgressOverlay";
import {useLoading} from "./LoadingContext";

interface ContentThemeProps {
    title: string;
    icon?: React.ReactElement;
    children?: React.ReactNode;
}

const ContentTheme : React.FC<ContentThemeProps> = ({title, icon, children}) => {
    const theme = createTheme();
    const { loading } = useLoading();
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