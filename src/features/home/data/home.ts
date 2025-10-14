import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {Boxes, CheckCircle, ClipboardCheck, ClipboardList, Move, Package, PackageCheckIcon, ShoppingCart} from "lucide-react";
import {ApplicationSettings} from "@/features/login/data/login";

export interface HomeInfo {
  itemCheck: number;
  binCheck: number;
  packageCheck: number;
  goodsReceipt: number;
  receiptConfirmation: number;
  picking: number;
  counting: number;
  transfers: number;
  transfersApproval: number;
  transfersConfirmation: number;
}

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  icon: any;
  authorizations: RoleType[];
  dependency?: string;
  route: string;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
} // Mock data for KPI boxes
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
    id: 'packages-check',
    title: 'packages.packages',
    value: 100,
    icon: PackageCheckIcon,
    authorizations: [
      RoleType.GOODS_RECEIPT_SUPERVISOR,
      RoleType.PICKING_SUPERVISOR,
      RoleType.COUNTING_SUPERVISOR,
      RoleType.TRANSFER_SUPERVISOR,
      RoleType.PACKAGE_MANAGEMENT,
      RoleType.PACKAGE_MANAGEMENT_SUPERVISOR,
    ],
    route: "/packageCheck",
    backgroundColor: "bg-teal-100",
    iconColor: "text-teal-700",
    borderColor: "border-l-teal-500"
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
  },
  {
    id: 'transfersApproval',
    title: 'transfersApproval',
    value: 29,
    icon: ClipboardCheck,
    authorizations: [RoleType.TRANSFER_SUPERVISOR],
    route: "/transfer",
    backgroundColor: "bg-emerald-100",
    iconColor: "text-emerald-700",
    borderColor: "border-l-emerald-500"
  },
  {
    id: 'transferConfirmation',
    title: 'transferConfirmation',
    value: 30,
    icon: Move,
    authorizations: [RoleType.TRANSFER_CONFIRMATION, RoleType.TRANSFER_CONFIRMATION_SUPERVISOR],
    dependency: "transferConfirmation",
    route: "/transferConfirmation",
    backgroundColor: "bg-purple-100",
    iconColor: "text-purple-700",
    borderColor: "border-l-purple-500"
  }
]; // Function to filter KPI items based on user authorizations

export function getKpiItems(settings: ApplicationSettings, userAuthorizations: RoleType[] | undefined, info: HomeInfo): KpiItem[] {
  if (!userAuthorizations) {
    return [];
  }

  return kpiItems.filter(item => {
    if (item.dependency) {
      switch (item.dependency) {
        case 'transferConfirmation':
          if (!settings.enableTransferConfirm)
            return false;
          break;
      }
    }
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
      case 'packages-check':
        value = info.packageCheck;
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
      case 'transfersApproval':
        value = info.transfersApproval;
        break;
      case 'transfer':
        value = info.transfersApproval;
        break;
      case 'transferConfirmation':
        value = info.transfersConfirmation;
        break;
      default:
        value = 0; // Default to 0 if no match
    }
    return {...item, value}
  });
}