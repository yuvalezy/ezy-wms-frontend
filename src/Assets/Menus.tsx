import { useTranslation } from 'react-i18next';
import { Authorization } from "./Authorization";
import "@ui5/webcomponents-icons/dist/qr-code.js"
import "@ui5/webcomponents-icons/dist/complete.js"
import "@ui5/webcomponents-icons/dist/cause.js"
import "@ui5/webcomponents-icons/dist/cart-2.js"
import "@ui5/webcomponents-icons/dist/kpi-managing-my-area.js"
import "@ui5/webcomponents-icons/dist/manager-insight.js"
import "@ui5/webcomponents-icons/dist/cancel.js"
import "@ui5/webcomponents-icons/dist/add.js"
import "@ui5/webcomponents-icons/dist/decline.js"
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/comment.js";
import "@ui5/webcomponents-icons/dist/create.js";
import "@ui5/webcomponents-icons/dist/clear-all.js";
import "@ui5/webcomponents-icons/dist/bar-chart.js";
import "@ui5/webcomponents-icons/dist/save.js"
import "@ui5/webcomponents-icons/dist/cancel.js"
import "@ui5/webcomponents-icons/dist/numbered-text.js"
import "@ui5/webcomponents-icons/dist/save.js"
import "@ui5/webcomponents-icons/dist/cancel.js"
import "@ui5/webcomponents-icons/dist/log.js"

export interface MenuItem {
    Link: string;
    Text: string;
    Authorization?: Authorization;
    Authorizations?: Authorization[];
    Icon: string;
}

export function useMenus() {
    const { t } = useTranslation();

    const MenuItems: MenuItem[] = [ // Changed to an array of type MenuItem[]
        {
            Link: "/itemCheck",
            Text: t('itemCheck'),
            Authorizations: [Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR],
            Icon: "complete",
        },
        {
            Link: "/goodsReceipt",
            Text: t('goodsReceipt'),
            Authorization: Authorization.GOODS_RECEIPT,
            Icon: "cause",
        },
        {
            Link: "/goodsReceiptSupervisor",
            Text: t('goodsReceiptSupervisor'),
            Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
            Icon: "kpi-managing-my-area",
        },
        {
            Link: "/goodsReceiptReport",
            Text: t('goodsReceiptReport'),
            Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
            Icon: "manager-insight",
        },
        {
            Link: "/Pick",
            Text: t('picking'),
            Authorization: Authorization.PICKING,
            Icon: "cart-2",
        },
        {
            Link: "/PickSupervisor",
            Text: t('pickSupervisor'),
            Authorization: Authorization.PICKING_SUPERVISOR,
            Icon: "kpi-managing-my-area",
        },
        {
            Link: "/PickReport",
            Text: t('pickReport'),
            Authorization: Authorization.PICKING_SUPERVISOR,
            Icon: "manager-insight",
        },
    ];

    const GetMenus = (authorizations: Authorization[] | undefined) => {
        return MenuItems.filter(item => {
            if (item.Authorization === undefined) {
                return true;
            }
            if (authorizations) {
                return authorizations.includes(item.Authorization);
            }
            return false;
        });
    };

    // It's common to return objects directly rather than an object with properties.
    return { MenuItems, GetMenus };
}
