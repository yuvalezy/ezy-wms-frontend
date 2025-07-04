import {LogOutIcon, SettingsIcon, HomeIcon, UserIcon, ChevronDownIcon} from "lucide-react"
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {MenuItem, useMenus} from "@/assets/Menus";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faIndustry} from '@fortawesome/free-solid-svg-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";


export function AppSidebar() {
  const menus = useMenus();
  const [authorizedMenus, setAuthorizedMenus] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const {logout, user} = useAuth();
  const {t} = useTranslation();

  useEffect(() => {
    setAuthorizedMenus(menus.GetMenus(user?.roles, user?.superUser));
  }, [user, menus]);

  const handleMenuItemClick = (link: string) => {
    navigate(link);
  };

  const handleLogout = () => {
    logout();
  };

  // Define the grouping logic
  const groupedMenus = authorizedMenus.reduce((acc, item) => {
    let groupLabel = t('other'); // Default group

    switch (item.Link) {
      case "/binCheck":
      case "/itemCheck":
        groupLabel = t("inventoryCheck");
        break;
      case "/goodsReceipt":
      case "/goodsReceiptSupervisor":
      case "/goodsReceiptReport":
      case "/goodsReceiptConfirmation":
      case "/goodsReceiptConfirmationSupervisor":
      case "/goodsReceiptConfirmationReport":
        groupLabel = t("goodsReceipt");
        break;
      case "/pick":
      case "/pickSupervisor":
        groupLabel = t("picking");
        break;
      case "/counting":
      case "/countingSupervisor":
        groupLabel = t("counting");
        break;
      case "/transfer":
      case "/transferSupervisor":
      case "/transferRequest":
        groupLabel = t("transfer");
        break;
      case "/settings/cancelReasons":
      case "/settings/users":
      case "/settings/authorizationGroups":
        groupLabel = t("settings");
        break;
      default:
        groupLabel = t('other');
        break;
    }
    if (!acc[groupLabel]) {
      acc[groupLabel] = [];
    }
    acc[groupLabel].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  // Order the groups
  const orderedGroupLabels = [
    t("inventoryCheck"),
    t("goodsReceipt"),
    t("picking"),
    t("counting"),
    t("transfer"),
    t("settings"),
    t("other"),
  ];

  return (
    <Sidebar className="text-base">
      <SidebarHeader>
        <div className="h-16 px-4 border-b border-gray-200 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 h-12">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.warehouses?.find(v => v.id === user?.currentWarehouse)?.name}
                </div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-12">
                <LogOutIcon className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/" onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/");
                }} className={`min-h-[48px] flex items-center gap-3 px-3 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${location.pathname === "/home" ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'}`}>
                  <HomeIcon className="w-5 h-5" />
                  <span className="font-normal">{t('home')}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {orderedGroupLabels.map((groupLabel) => {
          const itemsInGroup = groupedMenus[groupLabel];
          if (!itemsInGroup || itemsInGroup.length === 0) {
            return null;
          }
          return (
            <SidebarGroup key={groupLabel}>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-900 uppercase tracking-wider px-3 py-2">{groupLabel}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {itemsInGroup.map((item) => (
                    <SidebarMenuItem key={item.Link}>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.Link}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuItemClick(item.Link);
                          }}
                          className={`min-h-[48px] flex items-center gap-3 px-3 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${location.pathname === item.Link ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50'}`}
                          aria-label={item.Text}
                        >
                          <item.Icon className="w-5 h-5"/>
                          <span className="font-normal">{item.Text}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  )
}
