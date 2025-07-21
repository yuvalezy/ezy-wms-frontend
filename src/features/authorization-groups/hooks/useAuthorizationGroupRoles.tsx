import {RoleInfo, RoleType} from "@/features/authorization-groups/data/authorization-group";
import {useTranslation} from "react-i18next";
import {useAuth} from "@/components";

export const useAuthorizationGroupRoles = () => {
  const {t} = useTranslation();
  const {user} = useAuth();

  const roleInfoMap = new Map<RoleType, RoleInfo>([
    [RoleType.GOODS_RECEIPT, {
      role: RoleType.GOODS_RECEIPT,
      displayName: t("authorizations.roleGoodsReceipt"),
      description: t("authorizations.roleGoodsReceiptDescription"),
      category: "Operations"
    }],
    [RoleType.GOODS_RECEIPT_SUPERVISOR, {
      role: RoleType.GOODS_RECEIPT_SUPERVISOR,
      displayName: t("authorizations.roleGoodsReceiptSupervisor"),
      description: t("authorizations.roleGoodsReceiptSupervisorDescription"),
      category: "Supervision"
    }],
    [RoleType.GOODS_RECEIPT_CONFIRMATION, {
      role: RoleType.GOODS_RECEIPT_CONFIRMATION,
      displayName: t("authorizations.roleGoodsReceiptConfirmation"),
      description: t("authorizations.roleGoodsReceiptConfirmationDescription"),
      category: "Operations"
    }],
    [RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR, {
      role: RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR,
      displayName: t("authorizations.roleGoodsReceiptConfirmationSupervisor"),
      description: t("authorizations.roleGoodsReceiptConfirmationSupervisorDescription"),
      category: "Supervision"
    }],
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

