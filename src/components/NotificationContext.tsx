import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { axiosInstance, ServerUrl } from "@/utils/axios-instance";
import { useAuth } from "./AppContext";

// Define alert types matching backend enums
export enum WmsAlertType {
  TransferApprovalRequest = "TransferApprovalRequest",
  TransferApproved = "TransferApproved",
  TransferRejected = "TransferRejected"
}

export enum WmsAlertObjectType {
  Transfer = "Transfer"
}

// Define the alert interface
export interface WmsAlert {
  id: string;
  userId: string;
  alertType: WmsAlertType;
  objectType: WmsAlertObjectType;
  objectId: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

// Define the shape of the context
interface NotificationContextType {
  alerts: WmsAlert[];
  unreadCount: number;
  isConnected: boolean;
  onlineUserIds: Set<string>;
  fetchAlerts: (unreadOnly?: boolean, limit?: number) => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContextDefaultValues: NotificationContextType = {
  alerts: [],
  unreadCount: 0,
  isConnected: false,
  onlineUserIds: new Set<string>(),
  fetchAlerts: async () => {
    console.warn("fetchAlerts method not implemented yet!");
  },
  markAsRead: async () => {
    console.warn("markAsRead method not implemented yet!");
  },
  markAllAsRead: async () => {
    console.warn("markAllAsRead method not implemented yet!");
  },
  refreshUnreadCount: async () => {
    console.warn("refreshUnreadCount method not implemented yet!");
  },
};

export const NotificationContext = createContext<NotificationContextType>(
  NotificationContextDefaultValues
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<WmsAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, user } = useAuth();

  // Initialize SignalR connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    const token = sessionStorage.getItem('authToken');
    if (!token) {
      return;
    }

    // Create SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${ServerUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    newConnection.on("ReceiveAlert", (alert: WmsAlert) => {
      console.log("Received alert:", alert);
      setAlerts(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newConnection.on("UnreadCountUpdate", (count: number) => {
      console.log("Unread count updated:", count);
      setUnreadCount(count);
    });

    // Presence tracking event handlers
    newConnection.on("UserConnected", (userId: string) => {
      console.log("User connected:", userId);
      setOnlineUserIds(prev => new Set(prev).add(userId));
    });

    newConnection.on("UserDisconnected", (userId: string) => {
      console.log("User disconnected:", userId);
      setOnlineUserIds(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Start connection
    newConnection
      .start()
      .then(async () => {
        console.log("SignalR connected");
        setIsConnected(true);
        setConnection(newConnection);

        // Fetch initial data
        refreshUnreadCount();

        // Fetch initial online users
        try {
          const onlineUsers = await newConnection.invoke<string[]>("GetOnlineUsers");
          console.log("Initial online users:", onlineUsers);
          setOnlineUserIds(new Set(onlineUsers));
        } catch (error) {
          console.error("Failed to fetch initial online users:", error);
        }
      })
      .catch((err) => {
        console.error("SignalR connection error:", err);
        setIsConnected(false);
      });

    // Cleanup on unmount
    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [isAuthenticated, user]);

  // Fetch alerts from API
  const fetchAlerts = useCallback(async (unreadOnly: boolean = false, limit?: number) => {
    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unreadOnly', 'true');
      if (limit) params.append('limit', limit.toString());

      const response = await axiosInstance.get<WmsAlert[]>(
        `wmsalert?${params.toString()}`
      );
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, []);

  // Mark alert as read
  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await axiosInstance.post(`wmsalert/${alertId}/read`);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, isRead: true, readAt: new Date().toISOString() } : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.post(`wmsalert/readAll`);
      setAlerts(prev =>
        prev.map(alert => ({ ...alert, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all alerts as read:", error);
    }
  }, []);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get<{ count: number }>(`wmsalert/count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  }, []);

  const value = {
    alerts,
    unreadCount,
    isConnected,
    onlineUserIds,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };

  return <NotificationContext value={value}>{children}</NotificationContext>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
