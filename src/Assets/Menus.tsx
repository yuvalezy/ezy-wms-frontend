import {useTranslation} from 'react-i18next';
import {useMemo} from 'react'; // Import useMemo
import {RoleType} from "./RoleType";
import {useAuth} from "@/components";
import {
  BarChart3,
  Boxes,
  CheckCircle,
  ClipboardList,
  Factory,
  Move,
  Package,
  PackageCheckIcon,
  Shield,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import {DeviceStatus} from "@/pages/settings/devices/data/device";

export interface MenuItem {
  Link: string;
  Text: string;
  Authorization?: RoleType;
  Authorizations?: RoleType[];
  SuperUser?: boolean;
  Icon: React.ComponentType<any>;
  Color?: string;
}


export function useMenus() {
  const {t} = useTranslation();
  const {user} = useAuth();

  const goodsReceiptSupervisorRoute = "/goodsReceiptSupervisor"
  const goodsReceiptConfirmationSupervisorRoute = "/goodsReceiptConfirmationSupervisor"

  const MenuItems: MenuItem[] = [
    {
      Link: "/itemCheck",
      Text: t('itemCheck'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR],
      Icon: CheckCircle,
      Color: "text-blue-700",
    },
    {
      Link: "/binCheck",
      Text: t('binCheck'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR],
      Icon: Boxes,
      Color: "text-green-700",
    },
    {
      Link: "/packageCheck",
      Text: t('packagesCheck'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR, RoleType.PACKAGE_MANAGEMENT, RoleType.PACKAGE_MANAGEMENT_SUPERVISOR],
      Icon: PackageCheckIcon,
      Color: "text-green-700",
    },
    {
      Link: "/goodsReceipt",
      Text: t('goodsReceipt'),
      Authorization: RoleType.GOODS_RECEIPT,
      Icon: ClipboardList,
      Color: "text-gray-700",
    },
    {
      Link: goodsReceiptSupervisorRoute,
      Text: t('goodsReceiptSupervisor'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR],
      Icon: BarChart3,
      Color: "text-gray-700",
    },
    {
      Link: "/goodsReceiptReport",
      Text: t('goodsReceiptReport'),
      Authorization: RoleType.GOODS_RECEIPT_SUPERVISOR,
      Icon: TrendingUp,
      Color: "text-gray-700",
    },
    {
      Link: "/goodsReceiptConfirmation",
      Text: t('receiptConfirmation'),
      Authorization: RoleType.GOODS_RECEIPT_CONFIRMATION,
      Icon: ClipboardList,
      Color: "text-indigo-700",
    },
    {
      Link: goodsReceiptConfirmationSupervisorRoute,
      Text: t('goodsReceiptConfirmationSupervisor'),
      Authorizations: [RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR],
      Icon: BarChart3,
      Color: "text-indigo-700",
    },
    {
      Link: "/goodsReceiptConfirmationReport",
      Text: t('confirmationReport'),
      Authorization: RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      Icon: TrendingUp,
      Color: "text-indigo-700",
    },
    {
      Link: "/pick",
      Text: t('picking'),
      Authorization: RoleType.PICKING,
      Icon: ShoppingCart,
      Color: "text-teal-700",
    },
    {
      Link: "/pickSupervisor",
      Text: t('pickSupervisor'),
      Authorization: RoleType.PICKING_SUPERVISOR,
      Icon: BarChart3,
      Color: "text-teal-700",
    },
    // {
    //     Link: "/pickReport",
    //     Text: t('pickReport'),
    //     Authorization: Authorization.PICKING_SUPERVISOR,
    //     Icon: "manager-insight",
    // },
    {
      Link: "/counting",
      Text: t('counting'),
      Authorization: RoleType.COUNTING,
      Icon: Package,
      Color: "text-cyan-700",
    },
    {
      Link: "/countingSupervisor",
      Text: t('countingSupervisor'),
      Authorization: RoleType.COUNTING_SUPERVISOR,
      Icon: Factory,
      Color: "text-cyan-700",
    },
    // {
    //     Link: "/countingReport",
    //     Text: t('countingReport'),
    //     Authorization: Authorization.COUNTING_SUPERVISOR,
    //     Icon: "manager-insight",
    // },
    {
      Link: "/transfer",
      Text: t('transfer'),
      Authorization: RoleType.TRANSFER,
      Icon: Move,
      Color: "text-lime-700",
    },
    {
      Link: "/transferSupervisor",
      Text: t('transferSupervisor'),
      Authorization: RoleType.TRANSFER_SUPERVISOR,
      Icon: Truck,
      Color: "text-lime-700",
    },
    // {
    //     Link: "/transferRequest",
    //     Text: t('transferRequest'),
    //     Authorization: RoleType.TRANSFER_REQUEST,
    //     Icon: "request",
    // },
    // {
    //     Link: "/settings/cancelReasons",
    //     Text: t('cancellationReasons'),
    //     SuperUser: true,
    //     Icon: "cancel-reasons",
    // },
    {
      Link: "/settings/users",
      Text: t('users'),
      SuperUser: true,
      Icon: Users,
      Color: "text-gray-600",
    },
    {
      Link: "/settings/authorizationGroups",
      Text: t('authorizationGroups'),
      SuperUser: true,
      Icon: Shield,
      Color: "text-gray-600",
    },
    {
      Link: "/settings/devices",
      Text: t('devices'),
      SuperUser: true,
      Icon: Smartphone,
      Color: "text-gray-600",
    },
  ];

  const GetMenus = (authorizations: RoleType[] | undefined, superUser: boolean | undefined) => {
    const isDeviceActive = user?.deviceStatus === DeviceStatus.Active;
    if (authorizations !== undefined) {
      applySettings(authorizations);
    }
    return MenuItems.filter(item => {
      if (!isDeviceActive && !item.Link.startsWith('/settings')) {
        return false;
      }
      if (item.Authorization === undefined && item.Authorizations === undefined && user?.superUser) {
        return true;
      }
      if (authorizations) {
        if (item.SuperUser && !user?.superUser)
          return false;
        if (item.Authorization !== undefined) {
          return authorizations.includes(item.Authorization);
        }
        if (item.Authorizations !== undefined) {
          for (let itemAuthorization of item.Authorizations) {
            if (authorizations.includes(itemAuthorization)) {
              return true;
            }
          }
        }
      }
      return false;
    });
  };
  function applySettings(authorizations: RoleType[]) {
    if (user?.settings?.goodsReceiptCreateSupervisorRequired) {
      return;
    }
    // Goods Receipt Supervisor
    let menuItem = MenuItems.filter((v) => v.Link === goodsReceiptSupervisorRoute)[0];
    if (menuItem.Authorizations != null) {
      menuItem.Authorizations.push(RoleType.GOODS_RECEIPT)
    }
    let isSupervisor = authorizations.filter((v) => v === RoleType.GOODS_RECEIPT_SUPERVISOR).length === 1;
    menuItem.Text = !isSupervisor ? t('goodsReceiptCreation') : t('goodsReceiptSupervisor');

    // Goods Receipt Confirmation Supervisor
    menuItem = MenuItems.filter((v) => v.Link === goodsReceiptConfirmationSupervisorRoute)[0];
    if (menuItem.Authorizations != null) {
      menuItem.Authorizations.push(RoleType.GOODS_RECEIPT_CONFIRMATION);
    }
    isSupervisor = authorizations.filter((v) => v === RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR).length === 1;
    menuItem.Text = !isSupervisor ? t('goodsReceiptConfirmationCreation') : t('goodsReceiptConfirmationSupervisor');
  }

  // It's common to return objects directly rather than an object with properties.
  return useMemo(() => ({MenuItems, GetMenus}), [t, user]);
}
