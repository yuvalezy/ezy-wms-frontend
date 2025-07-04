import React from "react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/AppSidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, Button} from "@/components/ui";
import {Filter} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
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
          <header className="flex items-center justify-between h-16 px-4 bg-white shadow flex-shrink-0 z-10 w-full">
            <div className="flex items-center min-w-0 h-full">
              <SidebarTrigger className="mr-4 flex-shrink-0 h-10 w-10 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg"/>
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    {titleOnClick
                      ? <BreadcrumbLink className="cursor-pointer font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1" onClick={titleOnClick}>{title}</BreadcrumbLink>
                      : <BreadcrumbPage className="font-semibold text-gray-900">{title}</BreadcrumbPage>}
                  </BreadcrumbItem>
                  {titleBreadcrumbs?.map((b, i) => (
                    <BreadcrumbItem key={i}>
                      {b.onClick
                        ? <BreadcrumbLink className="cursor-pointer font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1" onClick={b.onClick}>{b.label}</BreadcrumbLink>
                        : <BreadcrumbPage className="font-normal text-gray-700">{b.label}</BreadcrumbPage>}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
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
                  <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                  {t('add')}
                </Button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Export to Excel"
                >
                  <img
                    src="/images/excel.jpg"
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
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