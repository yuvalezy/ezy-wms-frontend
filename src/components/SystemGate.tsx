import React from "react";
import {useTranslation} from "react-i18next";
import {Loader2} from "lucide-react";
import {useAuth} from "@/components";
import {useSystemStatus} from "@/features/system/hooks/useSystemStatus";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Login from "@/Pages/Login";
import SboSettingsEditor from "@/features/configuration/components/SboSettingsEditor";
import SystemLockedScreen from "./SystemLockedScreen";

const FullScreen: React.FC<{ children: React.ReactNode }> = ({children}) => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">{children}</div>
);

const Spinner = () => (
  <FullScreen><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></FullScreen>
);

/**
 * Locks the app until the backend reports the system is ready (SAP/SBO configured
 * and verified). While locked: superusers get the SBO settings editor to fix it,
 * everyone else gets a "contact your administrator" screen. When ready, renders
 * the app normally.
 */
const SystemGate: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const {t} = useTranslation();
  const {status, reload} = useSystemStatus();
  const {isAuthenticated, user, isLoading, logout} = useAuth();

  // Wait for the first readiness result before deciding anything.
  if (status === undefined) {
    return <Spinner/>;
  }

  // Ready: normal app (route guards handle auth from here).
  if (status.ready) {
    return <>{children}</>;
  }

  // Locked. Resolve auth before choosing the lock experience.
  if (isLoading) {
    return <Spinner/>;
  }

  if (!isAuthenticated) {
    return <Login/>;
  }

  if (user?.superUser) {
    return (
      <FullScreen>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{t("system.lockTitle")}</CardTitle>
            <CardDescription>{status.detail ?? t("system.lockSuperuserDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SboSettingsEditor onSaved={reload}/>
          </CardContent>
        </Card>
      </FullScreen>
    );
  }

  return <SystemLockedScreen detail={status.detail} onLogout={logout}/>;
};

export default SystemGate;
