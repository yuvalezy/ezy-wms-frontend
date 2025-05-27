import MenuAppBar from "./MenuAppBar";
import React from "react";
import { ScrollableContent } from "./ScrollableContent"; // Import ScrollableContent
import { ThemeProvider } from "@ui5/webcomponents-react"; // Keep ThemeProvider if it's still needed for other UI5 components, otherwise remove.

interface ContentThemeProps {
    title: string;
    // icon?: string; // This icon prop is no longer used by MenuAppBar, but kept for compatibility if other components use it.
    // back?: () => void; // This back prop is no longer used by MenuAppBar.

    exportExcel?: boolean; // New prop for export functionality
    onExportExcel?: () => void; // New prop for export functionality
    children?: React.ReactNode;
}

const ContentTheme: React.FC<ContentThemeProps> = ({title, children, exportExcel, onExportExcel}) => {
    return (
        <ThemeProvider> {/* Keep ThemeProvider if it's still needed for other UI5 components, otherwise remove. */}
            <MenuAppBar title={title} exportExcel={exportExcel} onExportExcel={onExportExcel}></MenuAppBar>
            <ScrollableContent>
                {children}
            </ScrollableContent>
        </ThemeProvider>
    )
}

export default ContentTheme;
