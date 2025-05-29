import {CustomActionButton} from "./MenuAppBar";
import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage} from "@/components/ui";
import {useNavigate} from "react-router-dom";

interface ContentThemeProps {
  title: string;
  titleRoute?: string; // Optional prop for title route
  titleBreadcrumbs?: titleBreadcrumb[]; // Optional prop for breadcrumbs
  exportExcel?: boolean;
  onExportExcel?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void; // New prop
  customActionButtons?: CustomActionButton[]; // New prop
  // The 'back' prop that was previously passed from TransferProcessSource is effectively 'onBack' now
}

interface titleBreadcrumb {
  label: string;
  route?: string; // Optional route for the breadcrumb
}

const ContentTheme: React.FC<ContentThemeProps> = (
  {
    title,
    titleRoute,
    titleBreadcrumbs,
    children,
    footer,
    exportExcel,
    onExportExcel,
    onBack,
    customActionButtons
  }) => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="h-screen flex">
        <AppSidebar/>

        <div className="flex flex-col flex-1">
          {/* Header: trigger + breadcrumb, fixed height */}
          <header className="flex items-center px-4 py-2 bg-white shadow flex-shrink-0 z-10">
            <SidebarTrigger className="mr-4"/>
            <Breadcrumb>
              <BreadcrumbItem>
                {titleRoute
                  ? <BreadcrumbLink onClick={() => navigate(titleRoute)}>{title}</BreadcrumbLink>
                  : <BreadcrumbPage>{title}</BreadcrumbPage>}
              </BreadcrumbItem>
              {titleBreadcrumbs?.map((b, i) => (
                <BreadcrumbItem key={i}>
                  {b.route
                    ? <BreadcrumbLink onClick={() => navigate(b.route)}>{b.label}</BreadcrumbLink>
                    : <BreadcrumbPage>{b.label}</BreadcrumbPage>}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>

          {/* Footer: fixed height */}
          {footer && (
            <footer className="flex-shrink-0 bg-white shadow">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ContentTheme;
// {/*<div className="min-h-screen bg-background">*/
// }
// {/*  <MenuAppBar title={title} exportExcel={exportExcel} onExportExcel={onExportExcel} onBack={onBack}*/
// }
// {/*              customActionButtons={customActionButtons}/>*/
// }
// {/*  <ScrollableContent>*/
// }
// {/*    <div className="mx-auto pr-2 pl-2 pb-2 space-y-4 w-full">*/
// }
// {/*      {children}*/
// }
// {/*    </div>*/
// }
// {/*  </ScrollableContent>*/
// }
// {/*</div>*/
// }
