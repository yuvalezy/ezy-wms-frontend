import MenuAppBar from "./MenuAppBar";
import React from "react";
import { ScrollableContent } from "./ScrollableContent";

interface ContentThemeProps {
    title: string;
    exportExcel?: boolean;
    onExportExcel?: () => void;
    children?: React.ReactNode;
}

const ContentTheme: React.FC<ContentThemeProps> = ({title, children, exportExcel, onExportExcel}) => {
    return (
        <div className="min-h-screen bg-background">
            <MenuAppBar title={title} exportExcel={exportExcel} onExportExcel={onExportExcel} />
            <ScrollableContent>
                <div className="mx-auto p-4 space-y-4">
                    {children}
                </div>
            </ScrollableContent>
        </div>
    )
}

export default ContentTheme;
