import {RoleType} from "./RoleType";
import {
  CheckCircle,
  Boxes,
  ClipboardList,
  ShoppingCart,
  Package,
  Move,
} from 'lucide-react';
import {HomeInfo} from "@/assets/HomeInfo";

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  icon: any;
  authorizations: RoleType[];
  route: string;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
}

// Mock data for KPI boxes
export const kpiItems: KpiItem[] = [
  {
    id: 'item-check',
    title: 'items',
    value: 125,
    icon: CheckCircle,
    authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR],
    route: "/itemCheck",
    backgroundColor: "bg-blue-100",
    iconColor: "text-blue-700",
    borderColor: "border-l-blue-500"
  },
  {
    id: 'bin-check',
    title: 'binLocations',
    value: 78,
    icon: Boxes,
    authorizations: [
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER_SUPERVISOR
    ],
    route: "/binCheck",
    backgroundColor: "bg-green-100",
    iconColor: "text-green-700",
    borderColor: "border-l-green-500"
  },
  {
    id: 'goods-receipt',
    title: 'goodsReceipts',
    value: 42,
    icon: ClipboardList,
    authorizations: [RoleType.GOODS_RECEIPT, RoleType.GOODS_RECEIPT_SUPERVISOR],
    route: "/goodsReceipt",
    backgroundColor: "bg-orange-100",
    iconColor: "text-orange-700",
    borderColor: "border-l-orange-500"
  },
  {
    id: 'receipt-confirmation',
    title: 'receiptConfirmations',
    value: 15,
    icon: ClipboardList,
    authorizations: [RoleType.GOODS_RECEIPT_CONFIRMATION, RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR],
    route: "/goodsReceiptConfirmation",
    backgroundColor: "bg-indigo-100",
    iconColor: "text-indigo-700",
    borderColor: "border-l-indigo-500"
  },
  {
    id: 'picking',
    title: 'pickings',
    value: 36,
    icon: ShoppingCart,
    authorizations: [RoleType.PICKING, RoleType.PICKING_SUPERVISOR],
    route: "/pick",
    backgroundColor: "bg-teal-100",
    iconColor: "text-teal-700",
    borderColor: "border-l-teal-500"
  },
  {
    id: 'counting',
    title: 'counts',
    value: 53,
    icon: Package,
    authorizations: [RoleType.COUNTING, RoleType.COUNTING_SUPERVISOR],
    route: "/counting",
    backgroundColor: "bg-cyan-100",
    iconColor: "text-cyan-700",
    borderColor: "border-l-cyan-500"
  },
  {
    id: 'transfer',
    title: 'transfers',
    value: 29,
    icon: Move,
    authorizations: [RoleType.TRANSFER, RoleType.TRANSFER_SUPERVISOR, RoleType.TRANSFER_REQUEST],
    route: "/transfer",
    backgroundColor: "bg-lime-100",
    iconColor: "text-lime-700",
    borderColor: "border-l-lime-500"
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
