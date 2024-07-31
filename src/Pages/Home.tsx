import React from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../Components/AppContext";
import {useTranslation} from "react-i18next";
import ContentTheme from "../Components/ContentTheme";
import {Grid, Icon, MessageStrip} from "@ui5/webcomponents-react";
import {useMenus} from "../Assets/Menus";

export default function Home() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const menus = useMenus();
    const menuItems = menus.GetMenus(user?.authorizations);

    return (
        <ContentTheme title={t('home')} icon="home">
            {menuItems.length > 0 &&
                <Grid>
                    {menuItems.map((menu, index) => (
                        <Link to={menu.Link} key={index} className="homeMenuItemLink">
                            <div className="homeMenuItem">
                                <Icon design="NonInteractive" name={menu.Icon} className="homeMenuItemIcon"/>
                                <span>{menu.Text}</span>
                            </div>
                        </Link>
                    ))}
                </Grid>
            }
            {menuItems.length === 0 &&
                <div style={{padding: '10px'}}>
                    <MessageStrip design="Information"
                                  hideCloseButton={true}> {t("noAuthorizationOptions")} </MessageStrip>
                </div>}
        </ContentTheme>
    );
}
