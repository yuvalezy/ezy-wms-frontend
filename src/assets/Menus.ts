import {TextValue} from "./TextValue";
import {Authorization} from "./Authorization";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';


export const Menus = {
    MenuItems: [
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
