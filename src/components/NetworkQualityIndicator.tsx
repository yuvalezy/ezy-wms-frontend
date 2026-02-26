import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/NotificationContext";

type NetworkQuality = "excellent" | "good" | "poor" | "offline";

interface NetworkQualityIndicatorProps {
  className?: string;
}

const NetworkQualityIndicator: React.FC<NetworkQualityIndicatorProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const { isConnected } = useNotifications();
  const [quality, setQuality] = useState<NetworkQuality>("excellent");
  const [latency, setLatency] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Measure network latency
  useEffect(() => {
    if (!isOnline) {
      setQuality("offline");
      return;
    }

    const measureLatency = async () => {
      const startTime = performance.now();
      try {
        // Ping a lightweight endpoint
        await fetch(`${window.location.origin}/manifest.json`, {
          method: "HEAD",
          cache: "no-cache",
        });
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);
        setLatency(latencyMs);

        // Determine quality based on latency
        if (latencyMs < 100) {
          setQuality("excellent");
        } else if (latencyMs < 300) {
          setQuality("good");
        } else {
          setQuality("poor");
        }
      } catch (error) {
        setQuality("offline");
        setLatency(0);
      }
    };

    // Measure immediately
    measureLatency();

    // Measure periodically (every 30 seconds)
    const interval = setInterval(measureLatency, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Update quality if SignalR connection status changes
  useEffect(() => {
    if (!isConnected && isOnline) {
      setQuality("poor");
    }
  }, [isConnected, isOnline]);

  const getQualityConfig = () => {
    switch (quality) {
      case "excellent":
        return {
          icon: Wifi,
          color: "text-green-600",
          bgColor: "bg-green-100",
          label: t("networkExcellent"),
          bars: 3,
        };
      case "good":
        return {
          icon: Wifi,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          label: t("networkGood"),
          bars: 2,
        };
      case "poor":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          label: t("networkPoor"),
          bars: 1,
        };
      case "offline":
        return {
          icon: WifiOff,
          color: "text-red-600",
          bgColor: "bg-red-100",
          label: t("networkOffline"),
          bars: 0,
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  const getTooltipContent = () => {
    if (quality === "offline") {
      return (
        <div className="space-y-1">
          <div className="font-semibold">{config.label}</div>
          <div className="text-xs">{t("networkOfflineDesc")}</div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="font-semibold">{config.label}</div>
        <div className="text-xs">
          {t("latency")}: {latency}ms
        </div>
        {!isConnected && (
          <div className="text-xs text-orange-300">
            {t("signalrDisconnected")}
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`relative p-1.5 md:p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`}
            aria-label={t("networkQuality")}
          >
            <Icon className={`h-4 w-4 md:h-5 md:w-5 ${config.color}`} />

            {/* Signal strength indicator - small dot */}
            <span
              className={`absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 h-2 w-2 rounded-full ${config.bgColor} ${config.color} ring-2 ring-white`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NetworkQualityIndicator;
