import {TextValue} from "./TextValue";
import {Authorization} from "./Authorization";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export const Menus = {
    MenuItems: [
        {
            Link: "/itemCheck",
            Text: TextValue.ItemCheck,
            Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
            Icon: CheckBoxIcon
        },
        {
            Link: "/goodsReceipt",
            Text: TextValue.GoodsReceipt,
            Authorization: Authorization.GOODS_RECEIPT,
            Icon: AssignmentTurnedInIcon
        },
        {
            Link: "/goodsReceiptSupervisor",
            Text: TextValue.GoodsReceiptSupervisor,
            Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
            Icon: SupervisedUserCircleIcon
        },
        {
            Link: "/goodsReceiptReport",
            Text: TextValue.GoodsReceiptReport,
            Authorization: Authorization.GOODS_RECEIPT_SUPERVISOR,
            Icon: SummarizeIcon
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
    }
};
