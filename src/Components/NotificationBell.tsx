import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const { alerts, unreadCount, fetchAlerts, markAsRead, markAllAsRead, refreshUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch alerts when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchAlerts(false, 10); // Fetch last 10 alerts
    }
  }, [isOpen, fetchAlerts]);

  // Refresh unread count on mount
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const handleAlertClick = async (alert: any) => {
    if (!alert.isRead) {
      await markAsRead(alert.id);
    }
    setIsOpen(false);
    // Navigate using the data field which contains the path
    if (alert.data) {
      navigate(alert.data);
    } else if (alert.actionUrl) {
      navigate(alert.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getAlertTypeColor = (alertType: any) => {
    // Handle both string and numeric enum values
    if (alertType === "TransferApprovalRequest" || alertType === 0) {
      return "bg-yellow-100 text-yellow-800";
    } else if (alertType === "TransferApproved" || alertType === 1) {
      return "bg-green-100 text-green-800";
    } else if (alertType === "TransferRejected" || alertType === 2) {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-9 w-9 md:h-10 md:w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">{t('notifications')}</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {t('noNotifications')}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !alert.isRead ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div
                    className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !alert.isRead ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">{alert.title}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getAlertTypeColor(
                          alert.alertType
                        )}`}
                      >
                        {alert.alertType === "TransferApprovalRequest" || alert.alertType === 0
                          ? t('alertPending')
                          : alert.alertType === "TransferApproved" || alert.alertType === 1
                          ? t('alertApproved')
                          : t('alertRejected')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">{alert.message}</p>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
