import {RoleInfo, RoleType} from "@/features/authorization-groups/data/authorization-group";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/components";
import {GoodsReceiptDocumentType} from "@/features/login/data/login";

export const useAuthorizationGroupRoles = () => {
  const {t} = useTranslation();
  const {user} = useAuth();

  const roleInfoMap = new Map<RoleType, RoleInfo>([
    // Item Management
    [RoleType.ITEM_MANAGEMENT, {
      role: RoleType.ITEM_MANAGEMENT,
      displayName: t("authorizations.itemManagement"),
      description: t("authorizations.itemManagementDescription"),
      category: "Operations"
    }],
    [RoleType.ITEM_MANAGEMENT_SUPERVISOR, {
      role: RoleType.ITEM_MANAGEMENT_SUPERVISOR,
      displayName: t("authorizations.itemManagementSupervisor"),
      description: t("authorizations.itemManagementSupervisorDescription"),
      category: "Supervision"
    }],
    // Goods Receipt
    ...(user?.settings?.goodsReceiptType !== GoodsReceiptDocumentType.Confirmation ? [[RoleType.GOODS_RECEIPT, {
      role: RoleType.GOODS_RECEIPT,
      displayName: t("authorizations.roleGoodsReceipt"),
      description: t("authorizations.roleGoodsReceiptDescription"),
      category: "Operations"
    }] as [RoleType, RoleInfo]] : []),
    ...(user?.settings?.goodsReceiptType !== GoodsReceiptDocumentType.Confirmation ? [[RoleType.GOODS_RECEIPT_SUPERVISOR, {
      role: RoleType.GOODS_RECEIPT_SUPERVISOR,
      displayName: t("authorizations.roleGoodsReceiptSupervisor"),
      description: t("authorizations.roleGoodsReceiptSupervisorDescription"),
      category: "Supervision"
    }] as [RoleType, RoleInfo]] : []),
    // Goods Receipt Confirmation
    ...(user?.settings?.goodsReceiptType !== GoodsReceiptDocumentType.Transactional ? [[RoleType.GOODS_RECEIPT_CONFIRMATION, {
      role: RoleType.GOODS_RECEIPT_CONFIRMATION,
      displayName: t("authorizations.roleGoodsReceiptConfirmation"),
      description: t("authorizations.roleGoodsReceiptConfirmationDescription"),
      category: "Operations"
    }] as [RoleType, RoleInfo]] : []),
    ...(user?.settings?.goodsReceiptType !== GoodsReceiptDocumentType.Transactional ? [[RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR, {
      role: RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      displayName: t("authorizations.roleGoodsReceiptConfirmationSupervisor"),
      description: t("authorizations.roleGoodsReceiptConfirmationSupervisorDescription"),
      category: "Supervision"
    }] as [RoleType, RoleInfo]] : []),
    // Picking
    [RoleType.PICKING, {
      role: RoleType.PICKING,
      displayName: t("authorizations.rolePicking"),
      description: t("authorizations.rolePickingDescription"),
      category: "Operations"
    }],
    [RoleType.PICKING_SUPERVISOR, {
      role: RoleType.PICKING_SUPERVISOR,
      displayName: t("authorizations.rolePickingSupervisor"),
      description: t("authorizations.rolePickingSupervisorDescription"),
      category: "Supervision"
    }],
    ...(user?.settings?.enablePickingCheck ? [[RoleType.PICKING, {
      role: RoleType.PICKING,
      displayName: t("authorizations.rolePickingCheck"),
      description: t("authorizations.rolePickingCheckDescription"),
      category: "Operations",
    }] as [RoleType, RoleInfo]] : []),
    // Package
    // [RoleType.PACKAGE_MANAGEMENT, {
    //   role: RoleType.PACKAGE_MANAGEMENT,
    //   displayName: t("authorizations.rolePackageManagement"),
    //   description: t("authorizations.rolePackageManagementDescription"),
    //   category: "Operations"
    // }],
    // [RoleType.PACKAGE_MANAGEMENT_SUPERVISOR, {
    //   role: RoleType.PACKAGE_MANAGEMENT_SUPERVISOR,
    //   displayName: t("authorizations.rolePackageManagementSupervisor"),
    //   description: t("authorizations.rolePackageManagementSupervisorDescription"),
    //   category: "Supervision"
    // }],
    // Counting
    [RoleType.COUNTING, {
      role: RoleType.COUNTING,
      displayName: t("authorizations.roleCounting"),
      description: t("authorizations.roleCountingDescription"),
      category: "Operations"
    }],
    [RoleType.COUNTING_SUPERVISOR, {
      role: RoleType.COUNTING_SUPERVISOR,
      displayName: t("authorizations.roleCountingSupervisor"),
      description: t("authorizations.roleCountingSupervisorDescription"),
      category: "Supervision"
    }],
    // Transfer
    [RoleType.TRANSFER, {
      role: RoleType.TRANSFER,
      displayName: t("authorizations.roleTransfer"),
      description: t("authorizations.roleTransferDescription"),
      category: "Operations"
    }],
    [RoleType.TRANSFER_SUPERVISOR, {
      role: RoleType.TRANSFER_SUPERVISOR,
      displayName: t("authorizations.roleTransferSupervisor"),
      description: t("authorizations.roleTransferSupervisorDescription"),
      category: "Supervision"
    }],
    // Transfer Confirmation
    ...(user?.settings?.enableTransferConfirm ? [[RoleType.TRANSFER_CONFIRMATION, {
      role: RoleType.TRANSFER_CONFIRMATION,
      displayName: t("authorizations.roleTransferConfirmation"),
      description: t("authorizations.roleTransferConfirmationDescription"),
      category: "Operations"
    }] as [RoleType, RoleInfo]] : []),
    ...(user?.settings?.enableTransferConfirm ? [[RoleType.TRANSFER_CONFIRMATION_SUPERVISOR, {
      role: RoleType.TRANSFER_CONFIRMATION_SUPERVISOR,
      displayName: t("authorizations.roleTransferConfirmationSupervisor"),
      description: t("authorizations.roleTransferConfirmationSupervisorDescription"),
      category: "Supervision"
    }] as [RoleType, RoleInfo]] : []),

    //   role: RoleType.TRANSFER_REQUEST,
    //   displayName: t("authorizations.roleTransferRequest"),
    //   description: t("authorizations.roleTransferRequestDescription"),
    //   category: "Operations"
    // }]
  ]);

  const getRoleInfo = (): RoleInfo[] => {
    return Array.from(roleInfoMap.values());
  }

  return {roleInfoMap, getRoleInfo}
};

