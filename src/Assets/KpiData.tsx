import { RoleType } from "./RoleType";
import {
  faCheckCircle,
  faCube,
  faClipboardList,
  faShoppingCart,
  faBox,
  faArrowsAlt,
  faIndustry
} from '@fortawesome/free-solid-svg-icons';
import {HomeInfo} from "@/assets/HomeInfo";

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  icon: any;
  authorizations: RoleType[];
  route: string;
}

// Mock data for KPI boxes
export const kpiItems: KpiItem[] = [
  {
    id: 'item-check',
    title: 'items',
    value: 125,
    icon: faCheckCircle,
    authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR],
    route: "/itemCheck"
  },
  {
    id: 'bin-check',
    title: 'binLocations',
    value: 78,
    icon: faCube,
    authorizations: [
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER_SUPERVISOR
    ],
    route: "/binCheck"
  },
  {
    id: 'goods-receipt',
    title: 'goodsReceipts',
    value: 42,
    icon: faClipboardList,
    authorizations: [RoleType.GOODS_RECEIPT, RoleType.GOODS_RECEIPT_SUPERVISOR],
    route: "/goodsReceipt"
  },
  {
    id: 'receipt-confirmation',
    title: 'receiptConfirmations',
    value: 15,
    icon: faCheckCircle,
    authorizations: [RoleType.GOODS_RECEIPT_CONFIRMATION, RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR],
    route: "/goodsReceiptConfirmation"
  },
  {
    id: 'picking',
    title: 'pickings',
    value: 36,
    icon: faShoppingCart,
    authorizations: [RoleType.PICKING, RoleType.PICKING_SUPERVISOR],
    route: "/pick"
  },
  {
    id: 'counting',
    title: 'counts',
    value: 53,
    icon: faBox,
    authorizations: [RoleType.COUNTING, RoleType.COUNTING_SUPERVISOR],
    route: "/counting"
  },
  {
    id: 'transfer',
    title: 'transfers',
    value: 29,
    icon: faArrowsAlt,
    authorizations: [RoleType.TRANSFER, RoleType.TRANSFER_SUPERVISOR, RoleType.TRANSFER_REQUEST],
    route: "/transfer"
  }
];

// Function to filter KPI items based on user authorizations
export function getKpiItems(userAuthorizations: RoleType[] | undefined, info: HomeInfo): KpiItem[] {
  if (!userAuthorizations) {
    return [];
  }

  return kpiItems.filter(item => {
    for (const auth of item.authorizations) {
      if (userAuthorizations.includes(auth)) {
        return true;
      }
    }
    return false;
  }).map((item) => {
    let value: number;
    switch (item.id) {
      case 'item-check':
        value = info.itemCheck;
        break;
      case 'bin-check':
        value = info.binCheck;
        break;
      case 'goods-receipt':
        value = info.goodsReceipt;
        break;
      case 'receipt-confirmation':
        value = info.receiptConfirmation;
        break;
      case 'picking':
        value = info.picking;
        break;
      case 'counting':
        value = info.counting;
        break;
      case 'transfer':
        value = info.transfers;
        break;
      default:
        value = 0; // Default to 0 if no match
    }
    return {...item, value}
  });
}
