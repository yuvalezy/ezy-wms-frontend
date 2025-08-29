import {useEffect, useState} from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(
    !navigator.onLine ? new Date() : null
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        status: 'online' as const,
        message: 'Connected to the internet',
        lastChange: lastOnlineTime
      };
    } else {
      return {
        status: 'offline' as const,
        message: 'No internet connection',
        lastChange: lastOfflineTime
      };
    }
  };

  const getOfflineDuration = () => {
    if (isOnline || !lastOfflineTime) {
      return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - lastOfflineTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Less than a minute';
    }
  };

  return {
    isOnline,
    lastOnlineTime,
    lastOfflineTime,
    getConnectionStatus,
    getOfflineDuration
  };
};