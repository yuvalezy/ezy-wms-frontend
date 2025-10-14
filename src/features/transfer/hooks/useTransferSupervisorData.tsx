import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {useEffect, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

export const useTransferSupervisorData = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [supervisor, setSupervisor] = useState(false);

  useEffect(() => {
    setSupervisor(user?.roles.filter((v) => v === RoleType.TRANSFER_SUPERVISOR).length === 1);
  }, [user]);

  function getTitle(): string {
    if (!user?.settings?.transferCreateSupervisorRequired && !supervisor) {
      return t("transferCreation");
    }

    return t("transferSupervisor");
  }

  return {
    supervisor,
    getTitle
  }
}
