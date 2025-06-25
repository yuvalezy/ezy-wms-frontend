import {LogOutIcon, SettingsIcon} from "lucide-react"
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {MenuItem, useMenus} from "@/assets/Menus";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, // complete
  faCube, // dimension
  faClipboardList, // cause
  faChartBar, // kpi-managing-my-area
  faChartLine, // manager-insight
  faShoppingCart, // cart-2
  faBox, // product
  faIndustry, // factory
  faArrowsAlt, // move
  faTruckMoving, // journey-depart
  faQuestionCircle, // request (fallback/generic)
  faQuestion, // general fallback
  faSignOutAlt,
  faBan, // cancel-reasons
  faUsers, // users
  faUserShield, // authorization-groups
} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';

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
} from "@/components/ui/sidebar"
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";

const iconMap: { [key: string]: IconDefinition } = {
  "complete": faCheckCircle,
  "dimension": faCube,
  "cause": faClipboardList,
  "kpi-managing-my-area": faChartBar,
  "manager-insight": faChartLine,
  "cart-2": faShoppingCart,
  "product": faBox,
  "factory": faIndustry,
  "move": faArrowsAlt,
  "journey-depart": faTruckMoving,
  "request": faQuestionCircle,
  "cancel-reasons": faBan,
  "users": faUsers,
  "authorization-groups": faUserShield,
};

const getFaIcon = (iconName: string): IconDefinition => {
  return iconMap[iconName] || faQuestion; // Fallback to a generic question mark icon
};

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
    <Sidebar>
      <SidebarContent>

        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-900">
            {user?.warehouses?.find(v => v.id === user?.currentWarehouse)?.name}
          </div>
        </div>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/" onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/");
                }} className={location.pathname === "/home" ? 'bg-gray-200' : ''}>
                  <FontAwesomeIcon icon={faIndustry}/>
                  <span>{t('home')}</span>
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
              <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
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
                          className={location.pathname === item.Link ? 'bg-gray-200' : ''}
                        >
                          <FontAwesomeIcon icon={getFaIcon(item.Icon)}/>
                          <span>{item.Text}</span>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" onClick={handleLogout}>
                <LogOutIcon/>
                <span>{t('logout')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
