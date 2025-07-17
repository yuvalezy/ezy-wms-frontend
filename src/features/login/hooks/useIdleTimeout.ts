import { useEffect, useRef } from 'react';
import { UserInfo } from '../data/login';

interface UseIdleTimeoutProps {
  user: UserInfo | null;
  onTimeout: () => void;
}

export const useIdleTimeout = ({ user, onTimeout }: UseIdleTimeoutProps) => {
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !user.settings?.idleLogoutTimeout) {
      // Clear any existing timer if user logged out or no timeout set
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    const timeoutSeconds = user.settings.idleLogoutTimeout;
    const timeoutMs = timeoutSeconds * 1000;

    const resetIdleTimer = () => {
      // Clear existing timer
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      // Set new timer
      idleTimerRef.current = setTimeout(() => {
        onTimeout();
      }, timeoutMs);
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [user, onTimeout]);

  return idleTimerRef;
};