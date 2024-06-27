import * as React from 'react';
import {useAuth} from "./AppContext";
import {useLocation, useNavigate} from "react-router-dom";
import {Icon, ShellBar, ShellBarItem, StandardListItem} from "@ui5/webcomponents-react";
import {useEffect, useState} from "react";
import {ShellBarDomRef} from "@ui5/webcomponents-react/dist/webComponents/ShellBar";
import {
    ShellBarMenuItemClickEventDetail,
    ShellBarNotificationsClickEventDetail
} from "@ui5/webcomponents-fiori/dist/ShellBar";
import "@ui5/webcomponents-icons/dist/home.js"
import {MenuItem, useMenus} from "../Assets/Menus";
import type {Ui5CustomEvent} from "@ui5/webcomponents-react/dist/types";

interface MenuAppBarProps {
    title: string,
    icon?: string,
    back?: () => void
}

const MenuAppBar: React.FC<MenuAppBarProps> = ({title, icon, back}) => {
    const menus = useMenus();
    const [authorizedMenus, setAuthorizedMenus] = useState<MenuItem[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const {logout, user} = useAuth();

    useEffect(() => {
        setAuthorizedMenus(menus.GetMenus(user?.authorizations));
    }, []);

    function handleMenuClicked(e: Ui5CustomEvent<ShellBarDomRef, ShellBarMenuItemClickEventDetail>) {
        const dataKey = e.detail.item.getAttribute('data-key');
        if (!dataKey)
            return;
        const index = parseInt(dataKey);
        navigate(authorizedMenus[index].Link);
    }


    function handleBack() {
        if (back != null) {
            back();
        }
    }

    return (
        <ShellBar
            logo={<Icon name={icon}/>}
            onLogoClick={() => navigate('/')}
            onMenuItemClick={handleMenuClicked}
            menuItems={authorizedMenus.map((item, index) => (
                <StandardListItem selected={location.pathname === item.Link} key={index} icon={item.Icon}
                                  data-key={index}>{item.Text}</StandardListItem>))}
            primaryTitle={title}
        >
            {back &&
                <ShellBarItem
                    icon="nav-back"
                    onClick={() => handleBack()}
                />
            }
            <ShellBarItem
                icon="log"
                onClick={() => logout()}
            />
        </ShellBar>
    );
}

export default MenuAppBar;