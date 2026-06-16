import React from "react";
import {useTranslation} from "react-i18next";
import {Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

interface Props {
  detail?: string | null;
  onLogout: () => void;
}

/** Full-screen lock shown to non-superusers while the system is being configured. */
const SystemLockedScreen: React.FC<Props> = ({detail, onLogout}) => {
  const {t} = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground"/>
          </div>
          <CardTitle>{t("system.lockTitle")}</CardTitle>
          <CardDescription>{detail ?? t("system.lockUserDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t("system.lockUserHint")}</p>
          <Button variant="outline" onClick={onLogout}>{t("system.backToLogin")}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLockedScreen;
