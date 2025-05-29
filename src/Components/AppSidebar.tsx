import {LogOutIcon} from "lucide-react"
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
    setAuthorizedMenus(menus.GetMenus(user?.authorizations));
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

    if (item.Link === "/binCheck" || item.Link === "/itemCheck") {
      groupLabel = t("inventoryCheck");
    } else if (
      item.Link === "/goodsReceipt" ||
      item.Link === "/goodsReceiptSupervisor" ||
      item.Link === "/goodsReceiptReport" ||
      item.Link === "/goodsReceiptConfirmation" ||
      item.Link === "/goodsReceiptConfirmationSupervisor" ||
      item.Link === "/goodsReceiptConfirmationReport"
    ) {
      groupLabel = t("goodsReceipt");
    } else if (item.Link === "/pick" || item.Link === "/pickSupervisor") {
      groupLabel = t("picking");
    } else if (item.Link === "/counting" || item.Link === "/countingSupervisor") {
      groupLabel = t("counting");
    } else if (
      item.Link === "/transfer" ||
      item.Link === "/transferSupervisor" ||
      item.Link === "/transferRequest"
    ) {
      groupLabel = t("transfer");
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
    t("other"),
  ];

  return (
    <Sidebar>
      <SidebarContent>
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
