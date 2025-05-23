import MenuAppBar, {MenuAppBarButton} from "./MenuAppBar";
import React from "react";
import {ThemeProvider} from "@ui5/webcomponents-react";

interface ContentThemeProps {
    title: string;
    icon?: string;
    back?: () => void
    buttons?: MenuAppBarButton[],
    children?: React.ReactNode;
}

const ContentTheme: React.FC<ContentThemeProps> = ({title, icon, children, back, buttons}) => {
    return (
        <ThemeProvider>
            <MenuAppBar title={title} icon={icon} buttons={buttons} back={back}></MenuAppBar>
            {children}
        </ThemeProvider>
    )
}

export default ContentTheme;