import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui";
import {Filter} from "lucide-react";

interface ContentThemeProps {
  title: string;
  titleOnClick?: () => void; // Optional prop for title route
  titleBreadcrumbs?: titleBreadcrumb[]; // Optional prop for breadcrumbs
  onExportExcel?: () => void;
  onFilterClicked?: () => void; // Optional prop for filter toggle
  children?: React.ReactNode;
  footer?: React.ReactNode;
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
    onFilterClicked,
  }) => {

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
            <div className="flex items-center">
              {onFilterClicked && (
                <Filter
                  className="h-6 w-6 cursor-pointer mr-2"
                  onClick={onFilterClicked}
                />
              )}
              {onExportExcel && (
                <img
                  src="/images/excel.jpg"
                  alt="Export to Excel"
                  className="h-6 w-6 cursor-pointer mr-2"
                  onClick={onExportExcel}
                />
              )}
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-auto p-2 py-4 w-full">
            {children}
          </main>

          {/* Footer: fixed height */}
          {footer && (
            <footer className="flex-shrink-0 bg-white w-full border-t-1">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

export default ContentTheme;
