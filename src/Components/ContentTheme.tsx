// import {Box, createTheme, ThemeProvider} from "@mui/material";
import MenuAppBar from "./MenuAppBar";
import React from "react";
import CircularProgressOverlay from "./CircularProgressOverlay";
import {useLoading} from "./LoadingContext";
import {ThemeProvider} from "@ui5/webcomponents-react";

interface ContentThemeProps {
    title: string;
    icon?: string;
    children?: React.ReactNode;
}

const ContentTheme : React.FC<ContentThemeProps> = ({title, icon, children}) => {
    const { loading } = useLoading();
    return (
        <ThemeProvider>
             <MenuAppBar title={title} icon={icon}></MenuAppBar>
            {children}
        </ThemeProvider>
    )
    // return (
    //     <ThemeProvider theme={theme}>
    //         <Box sx={{paddingTop: theme.spacing(10), paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2)}}>
    //             {children}
    //         </Box>
    //         {loading && <CircularProgressOverlay />}
    //     </ThemeProvider>
    // )
}

export default ContentTheme;