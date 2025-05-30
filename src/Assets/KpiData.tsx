import { Authorization } from "./Authorization";
import {
  faCheckCircle,
  faCube,
  faClipboardList,
  faShoppingCart,
  faBox,
  faArrowsAlt,
  faIndustry
} from '@fortawesome/free-solid-svg-icons';

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  icon: any;
  authorizations: Authorization[];
  route: string;
}

// Mock data for KPI boxes
export const kpiItems: KpiItem[] = [
  {
    id: 'item-check',
    title: 'items',
    value: 125,
    icon: faCheckCircle,
    authorizations: [Authorization.GOODS_RECEIPT_SUPERVISOR, Authorization.PICKING_SUPERVISOR],
    route: "/itemCheck"
  },
  {
    id: 'bin-check',
    title: 'binLocations',
    value: 78,
    icon: faCube,
    authorizations: [
      Authorization.GOODS_RECEIPT_SUPERVISOR, 
      Authorization.PICKING_SUPERVISOR, 
      Authorization.COUNTING_SUPERVISOR, 
      Authorization.TRANSFER_SUPERVISOR
    ],
    route: "/binCheck"
  },
  {
    id: 'goods-receipt',
    title: 'goodsReceipts',
    value: 42,
    icon: faClipboardList,
    authorizations: [Authorization.GOODS_RECEIPT, Authorization.GOODS_RECEIPT_SUPERVISOR],
    route: "/goodsReceipt"
  },
  {
    id: 'receipt-confirmation',
    title: 'receiptConfirmations',
    value: 15,
    icon: faCheckCircle,
    authorizations: [Authorization.GOODS_RECEIPT_CONFIRMATION, Authorization.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR],
    route: "/goodsReceiptConfirmation"
  },
  {
    id: 'picking',
    title: 'pickings',
    value: 36,
    icon: faShoppingCart,
    authorizations: [Authorization.PICKING, Authorization.PICKING_SUPERVISOR],
    route: "/pick"
  },
  {
    id: 'counting',
    title: 'counts',
    value: 53,
    icon: faBox,
    authorizations: [Authorization.COUNTING, Authorization.COUNTING_SUPERVISOR],
    route: "/counting"
  },
  {
    id: 'transfer',
    title: 'transfers',
    value: 29,
    icon: faArrowsAlt,
    authorizations: [Authorization.TRANSFER, Authorization.TRANSFER_SUPERVISOR, Authorization.TRANSFER_REQUEST],
    route: "/transfer"
  }
];

// Function to filter KPI items based on user authorizations
export function getKpiItems(userAuthorizations: Authorization[] | undefined): KpiItem[] {
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
  });
}
