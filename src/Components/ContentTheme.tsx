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
      <AppSidebar/>
      <main>
        <SidebarTrigger/>
        <Breadcrumb>
          <BreadcrumbItem>
            {!titleRoute ? <BreadcrumbPage>{title}</BreadcrumbPage> :
              <BreadcrumbLink href="#" onClick={() => navigate(titleRoute)}>{title}</BreadcrumbLink>}
          </BreadcrumbItem>
        </Breadcrumb>
        {children}
        {footer && <div className="fixed bottom-0 left-0 right-0">{footer}</div>}
      </main>
    </SidebarProvider>
  )
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
}

export default ContentTheme;
