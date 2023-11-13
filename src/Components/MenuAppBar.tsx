import * as React from 'react';
import {useAuth} from "./AppContext";
import {useLocation, useNavigate} from "react-router-dom";
import {Icon, ShellBar, ShellBarItem, StandardListItem} from "@ui5/webcomponents-react";
import {useEffect, useState} from "react";
import {Ui5CustomEvent} from "@ui5/webcomponents-react/dist/interfaces";
import {ShellBarDomRef} from "@ui5/webcomponents-react/dist/webComponents/ShellBar";
import {ShellBarMenuItemClickEventDetail} from "@ui5/webcomponents-fiori/dist/ShellBar";
import "@ui5/webcomponents-icons/dist/home.js"
import {MenuItem, useMenus} from "../Assets/Menus";

interface MenuAppBarProps {
    title: string,
    icon?: string,
}

const MenuAppBar: React.FC<MenuAppBarProps> = ({title, icon}) => {
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

    return (
        <ShellBar
            logo={<Icon style={{color: 'white'}} name={icon}/>}
            onLogoClick={() => navigate('/')}
            onMenuItemClick={handleMenuClicked}
            menuItems={authorizedMenus.map((item, index) => (
                <StandardListItem className={location.pathname !== item.Link ? '' : 'disabled-list-item'} key={index} icon={item.Icon} data-key={index}>{item.Text}</StandardListItem>))}
            primaryTitle={title}
        >
            <ShellBarItem
                icon="log"
                onClick={() => logout()}
            />
        </ShellBar>
    );
}

export default MenuAppBar;