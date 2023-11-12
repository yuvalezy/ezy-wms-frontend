import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Components/AppContext";
import { useTranslation } from "react-i18next";
import { useMenus } from "../Assets/Menus";
import ContentTheme from "../Components/ContentTheme";
import { Grid, Icon } from "@ui5/webcomponents-react";

export default function Home() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const menus = useMenus();

    return (
        <ContentTheme title={t('home')} icon="home">
            <Grid>
                {menus.GetMenus(user?.authorizations).map((menu, index) => (
                    <Link to={menu.Link} key={index} className="homeMenuItemLink">
                        <div className="homeMenuItem">
                            <Icon name={menu.Icon} className="homeMenuItemIcon"/>
                            <span>{menu.Text}</span>
                        </div>
                    </Link>
                ))}
            </Grid>
        </ContentTheme>
    );
}
