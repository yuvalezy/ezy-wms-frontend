import MenuAppBar from "./MenuAppBar";
import React from "react";
import { ScrollableContent } from "./ScrollableContent";
import { CustomActionButton } from "./MenuAppBar"; // Import the new interface

interface ContentThemeProps {
    title: string;
    exportExcel?: boolean;
    onExportExcel?: () => void;
    children?: React.ReactNode;
    onBack?: () => void; // New prop
    customActionButtons?: CustomActionButton[]; // New prop
    // The 'back' prop that was previously passed from TransferProcessSource is effectively 'onBack' now
}

const ContentTheme: React.FC<ContentThemeProps> = ({title, children, exportExcel, onExportExcel, onBack, customActionButtons}) => {
    return (
        <div className="min-h-screen bg-background">
            <MenuAppBar title={title} exportExcel={exportExcel} onExportExcel={onExportExcel} onBack={onBack} customActionButtons={customActionButtons} />
            <ScrollableContent>
                <div className="mx-auto pr-4 pl-4  pb-4 space-y-4">
                    {children}
                </div>
            </ScrollableContent>
        </div>
    )
}

export default ContentTheme;
