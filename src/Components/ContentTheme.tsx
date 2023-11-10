import MenuAppBar from "./MenuAppBar";
import React from "react";
import {ThemeProvider} from "@ui5/webcomponents-react";

interface ContentThemeProps {
    title: string;
    icon?: string;
    children?: React.ReactNode;
}

const ContentTheme: React.FC<ContentThemeProps> = ({title, icon, children}) => {
    return (
        <ThemeProvider>
            <MenuAppBar title={title} icon={icon}></MenuAppBar>
            {children}
        </ThemeProvider>
    )
}

export default ContentTheme;