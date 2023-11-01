import { useTranslation } from 'react-i18next';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SummarizeIcon from '@mui/icons-material/Summarize';
import {Authorization} from "./Authorization";

export function useMenus() {
    const { t } = useTranslation();

    const Menus = {
        MenuItems: [
            {
                Link: "/itemCheck",
                Text: t('ItemCheck'),
                Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
                Icon: CheckBoxIcon,
            },
            {
                Link: "/goodsReceipt",
                Text: t('GoodsReceipt'),
                Authorization: Authorization.GOODS_RECEIPT,
                Icon: AssignmentTurnedInIcon,
            },
            {
                Link: "/goodsReceiptSupervisor",
                Text: t('GoodsReceiptSupervisor'),
                Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
                Icon: SupervisedUserCircleIcon,
            },
            {
                Link: "/goodsReceiptReport",
                Text: t('GoodsReceiptReport'),
                Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
                Icon: SummarizeIcon,
            },
        ],
        GetMenus(authorizations: Authorization[] | undefined) {
            return this.MenuItems.filter(item => {
                if (item.Authorization === undefined) {
                    return true;
                }
                if (authorizations) {
                    return authorizations.includes(item.Authorization);
                }
                return false;
            });
        },
    };

    return Menus;
}

