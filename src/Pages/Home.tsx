import React from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../Components/AppContext";
import {useTranslation} from "react-i18next";
import ContentTheme from "../Components/ContentTheme";
import {useMenus, MenuItem} from "../Assets/Menus";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    faHome // home icon for ContentTheme
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
    "home": faHome, // Add home icon mapping
    // Add more mappings as needed based on UI5 icons
};

const getFaIcon = (iconName: string): IconDefinition => {
    return iconMap[iconName] || faQuestion; // Fallback to a generic question mark icon
};

export default function Home() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const menus = useMenus();
    const menuItems: MenuItem[] = menus.GetMenus(user?.authorizations);

    return (
        <ContentTheme title={t('home')}>
            {menuItems.length > 0 &&
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-4">
                    {menuItems.map((menu, index) => (
                        <Link to={menu.Link} key={index} className="block">
                            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow duration-300 h-full">
                                <FontAwesomeIcon icon={getFaIcon(menu.Icon)} className="text-4xl text-gray-800 mb-4"/>
                                <span className="text-lg font-semibold text-gray-800">{menu.Text}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            }
            {menuItems.length === 0 &&
                <div className="p-4">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                        <p className="font-bold">{t("information")}</p>
                        <p>{t("noAuthorizationOptions")}</p>
                    </div>
                </div>
            }
        </ContentTheme>
    );
}
