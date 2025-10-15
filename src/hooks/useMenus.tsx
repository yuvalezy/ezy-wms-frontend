import {useTranslation} from 'react-i18next';
import {useMemo} from 'react'; // Import useMemo
import {useAuth} from "@/components";
import {BarChart3, Bell, Boxes, CheckCircle, ClipboardList, Factory, Move, Package, PackageCheckIcon, SendHorizontal, Shield, ShoppingCart, Smartphone, TrendingUp, Truck, Users,} from 'lucide-react';
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {GoodsReceiptDocumentType} from "@/features/login/data/login";

export interface MenuItem {
  Link: string;
  Text: string;
  Authorization?: RoleType;
  Authorizations?: RoleType[];
  SuperUser?: boolean;
  Icon: React.ComponentType<any>;
  Color?: string;
  RequiresFeature?: string;
}


export function useMenus() {
  const {t} = useTranslation();
  const {user, isDeviceActive, isValidAccount} = useAuth();

  const goodsReceiptSupervisorRoute = "/goodsReceiptSupervisor"
  const goodsReceiptConfirmationSupervisorRoute = "/goodsReceiptConfirmationSupervisor"
  const transferSupervisorRoute = "/transferSupervisor"

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
      RequiresFeature: "BinLocation"
    },
    {
      Link: "/packageCheck",
      Text: t('packagesCheck'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR, RoleType.PICKING_SUPERVISOR, RoleType.COUNTING_SUPERVISOR, RoleType.TRANSFER_SUPERVISOR, RoleType.PACKAGE_MANAGEMENT, RoleType.PACKAGE_MANAGEMENT_SUPERVISOR],
      Icon: PackageCheckIcon,
      Color: "text-green-700",
      RequiresFeature: "PackageManagement"
    },
    {
      Link: "/goodsReceipt",
      Text: t('goodsReceipt'),
      Authorization: RoleType.GOODS_RECEIPT,
      Icon: ClipboardList,
      Color: "text-gray-700",
      RequiresFeature: "GoodsReceiptTransactional"
    },
    {
      Link: goodsReceiptSupervisorRoute,
      Text: t('goodsReceiptSupervisor'),
      Authorizations: [RoleType.GOODS_RECEIPT_SUPERVISOR],
      Icon: BarChart3,
      Color: "text-gray-700",
      RequiresFeature: "GoodsReceiptTransactional"
    },
    {
      Link: "/goodsReceiptReport",
      Text: t('goodsReceiptReport'),
      Authorization: RoleType.GOODS_RECEIPT_SUPERVISOR,
      Icon: TrendingUp,
      Color: "text-gray-700",
      RequiresFeature: "GoodsReceiptTransactional"
    },
    {
      Link: "/goodsReceiptConfirmation",
      Text: t('receiptConfirmation'),
      Authorization: RoleType.GOODS_RECEIPT_CONFIRMATION,
      Icon: ClipboardList,
      Color: "text-indigo-700",
      RequiresFeature: "GoodsReceiptConfirmation"
    },
    {
      Link: goodsReceiptConfirmationSupervisorRoute,
      Text: t('goodsReceiptConfirmationSupervisor'),
      Authorizations: [RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR],
      Icon: BarChart3,
      Color: "text-indigo-700",
      RequiresFeature: "GoodsReceiptConfirmation"
    },
    {
      Link: "/goodsReceiptConfirmationReport",
      Text: t('confirmationReport'),
      Authorization: RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      Icon: TrendingUp,
      Color: "text-indigo-700",
      RequiresFeature: "GoodsReceiptConfirmation"
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
      Link: "/transferRequest",
      Text: t('transferRequest'),
      Authorization: RoleType.TRANSFER_REQUEST,
      Icon: SendHorizontal,
      Color: "text-lime-700",
      RequiresFeature: "TransferRequest"
    },
    {
      Link: "/transfer/approve",
      Text: t('transferApprovals'),
      Authorization: RoleType.TRANSFER_SUPERVISOR,
      Icon: CheckCircle,
      Color: "text-lime-700",
      RequiresFeature: "EnableInventoryTransfer"
    },
    {
      Link: "/transfer",
      Text: t('transfer'),
      Authorization: RoleType.TRANSFER,
      Icon: Move,
      Color: "text-lime-700",
      RequiresFeature: "EnableInventoryTransfer"
    },
    {
      Link: transferSupervisorRoute,
      Text: t('transferSupervisor'),
      Authorizations: [RoleType.TRANSFER_SUPERVISOR],
      Icon: Truck,
      Color: "text-lime-700",
      RequiresFeature: "EnableInventoryTransfer"
    },
    {
      Link: "/transferConfirmation",
      Text: t('transferConfirmation'),
      Authorization: RoleType.TRANSFER,
      Icon: Move,
      Color: "text-lime-700",
      RequiresFeature: "EnableTransferConfirm"
    },
    {
      Link: "/transferConfirmationSupervisor",
      Text: t('transferConfirmationSupervisor'),
      Authorization: RoleType.TRANSFER_SUPERVISOR,
      Icon: Truck,
      Color: "text-lime-700",
      RequiresFeature: "EnableTransferConfirm"
    },
    {
      Link: "/transferConfirmationReport",
      Text: t('transferConfirmationReport'),
      Authorization: RoleType.TRANSFER_SUPERVISOR,
      Icon: TrendingUp,
      Color: "text-indigo-700",
      RequiresFeature: "EnableTransferConfirm"
    },
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
    {
      Link: "/settings/license",
      Text: t('license.title'),
      SuperUser: true,
      Icon: Shield,
      Color: "text-gray-600",
    },
    {
      Link: "/settings/externalAlerts",
      Text: t('externalAlerts'),
      SuperUser: true,
      Icon: Bell,
      Color: "text-gray-600",
    },
  ];

  const GetMenus = (authorizations: RoleType[] | undefined, superUser: boolean | undefined) => {
    if (authorizations !== undefined) {
      applySettings(authorizations);
    }
    return MenuItems.filter(item => {
      if ((!isDeviceActive || !isValidAccount) && !item.Link.startsWith('/settings')) {
        return false;
      }

      if (!hasRequiredFeature(item))
        return false;
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

  function hasRequiredFeature(item: MenuItem) {
    if (item.RequiresFeature != null) {
      switch (item.RequiresFeature) {
        case "GoodsReceiptTransactional":
          if (user?.settings?.goodsReceiptType === GoodsReceiptDocumentType.Confirmation)
            return false;
          break;
        case "GoodsReceiptConfirmation":
          if (user?.settings?.goodsReceiptType === GoodsReceiptDocumentType.Transactional)
            return false;
          break;
        case "PackageManagement":
          if (!user?.settings?.enablePackages)
            return false;
          break;
        case "EnableTransferConfirm":
          if (!user!.settings!.enableTransferConfirm)
            return false;
          break;
        case "EnableInventoryTransfer":
          if (!user!.binLocations && !user!.settings.enableWarehouseTransfer)
            return false;
          break;
        case "BinLocation":
          if (!user!.binLocations)
            return false;
          break;
        case "TransferRequest":
          if (!user!.settings!.enableTransferRequest)
            return false;
          break;
      }
    }
    return true;
  }


  function applySettings(authorizations: RoleType[]) {
    // Goods Receipt Supervisor
    if (!user?.settings?.goodsReceiptCreateSupervisorRequired) {
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

    // Transfer Supervisor
    if (!user?.settings?.transferCreateSupervisorRequired) {
      let menuItem = MenuItems.filter((v) => v.Link === transferSupervisorRoute)[0];
      if (menuItem.Authorizations != null) {
        menuItem.Authorizations.push(RoleType.TRANSFER);
      }
      const isSupervisor = authorizations.filter((v) => v === RoleType.TRANSFER_SUPERVISOR).length === 1;
      menuItem.Text = !isSupervisor ? t('transferCreation') : t('transferSupervisor');
    }
  }

  // It's common to return objects directly rather than an object with properties.
  return useMemo(() => ({MenuItems, GetMenus}), [t, user]);
}
