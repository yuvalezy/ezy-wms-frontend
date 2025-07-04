import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, Button} from "@/components/ui";
import {Filter, Plus, FileSpreadsheet} from "lucide-react";
import {useTranslation} from "react-i18next";

interface ContentThemeProps {
  title: string;
  titleOnClick?: () => void;
  titleBreadcrumbs?: titleBreadcrumb[];
  onExportExcel?: () => void;
  onFilterClicked?: () => void;
  onAdd?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

interface titleBreadcrumb {
  label: string;
  onClick?: () => void;
}

const ContentTheme: React.FC<ContentThemeProps> = (
  {
    title,
    titleOnClick,
    titleBreadcrumbs,
    children,
    footer,
    onExportExcel,
    onAdd,
    onFilterClicked,
  }) => {
  const {t} = useTranslation();

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full text-base md:text-lg">
        <AppSidebar/>

        <div className="flex flex-col flex-1 min-w-0">
          {/* Header: trigger + breadcrumb, fixed height */}
          <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full">
            <div className="flex items-center min-w-0 h-full gap-4">
              <SidebarTrigger className="flex-shrink-0 h-10 w-10 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg transition-colors hover:bg-gray-100"/>
              <div className="min-w-0">
                <nav className="flex items-center gap-2 min-w-0" aria-label="Breadcrumb">
                  <div>
                    {titleOnClick
                      ? <button className="cursor-pointer text-lg font-semibold text-gray-700 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 py-1 transition-all" onClick={titleOnClick}>{title}</button>
                      : <span className="text-lg font-semibold text-gray-900">{title}</span>}
                  </div>
                  {titleBreadcrumbs?.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">/</span>
                      {b.onClick
                        ? <button className="cursor-pointer text-base font-medium text-gray-700 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 py-1 transition-all" onClick={b.onClick}>{b.label}</button>
                        : <span className="text-base font-medium text-gray-600">{b.label}</span>}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 h-full gap-2">
              {onFilterClicked && (
                <button
                  onClick={onFilterClicked}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Filter"
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              )}
              {onAdd && (
                <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-10 font-normal focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <Plus className="mr-2 h-4 w-4"/>
                  {t('add')}
                </Button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Export to Excel"
                >
                  <FileSpreadsheet className="h-5 w-5 text-green-600"/>
                </button>
              )}
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-auto p-2 py-4 w-full min-w-0">
            <div className="w-full min-w-0">
              {children}
            </div>
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