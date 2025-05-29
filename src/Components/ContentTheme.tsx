import {CustomActionButton} from "./MenuAppBar";
import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui";
import {useNavigate} from "react-router-dom";

interface ContentThemeProps {
  title: string;
  titleOnClick?: () => void; // Optional prop for title route
  titleBreadcrumbs?: titleBreadcrumb[]; // Optional prop for breadcrumbs
  onExportExcel?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void; // New prop
  customActionButtons?: CustomActionButton[]; // New prop
  // The 'back' prop that was previously passed from TransferProcessSource is effectively 'onBack' now
}

interface titleBreadcrumb {
  label: string;
  onClick?: () => void; // Optional route for the breadcrumb
}

const ContentTheme: React.FC<ContentThemeProps> = (
  {
    title,
    titleOnClick,
    titleBreadcrumbs,
    children,
    footer,
    onExportExcel,
    onBack,
    customActionButtons
  }) => {
  const navigate = useNavigate();

  if (onBack) {
    window.alert("Back navigation is not implemented yet.");
  }
  if (customActionButtons) {
    window.alert("Custom action buttons are not implemented yet.");
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <AppSidebar/>

        <div className="flex flex-col flex-1">
          {/* Header: trigger + breadcrumb, fixed height */}
          <header className="flex items-center justify-between py-2 bg-white shadow flex-shrink-0 z-10 w-full">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4"/>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    {titleOnClick
                      ? <BreadcrumbLink className="cursor-pointer" onClick={titleOnClick}>{title}</BreadcrumbLink>
                      : <BreadcrumbPage>{title}</BreadcrumbPage>}
                  </BreadcrumbItem>
                  {titleBreadcrumbs?.map((b, i) => (
                    <BreadcrumbItem key={i}>
                      {b.onClick
                        ? <BreadcrumbLink className="cursor-pointer" onClick={b.onClick}>{b.label}</BreadcrumbLink>
                        : <BreadcrumbPage>{b.label}</BreadcrumbPage>}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {onExportExcel && (
              <img
                src="/images/excel.jpg"
                alt="Export to Excel"
                className="h-6 w-6 cursor-pointer mr-2"
                onClick={onExportExcel}
              />
            )}
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-auto p-2 py-4 w-full">
            {children}
          </main>

          {/* Footer: fixed height */}
          {footer && (
            <footer className="flex-shrink-0 bg-white w-full">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ContentTheme;
