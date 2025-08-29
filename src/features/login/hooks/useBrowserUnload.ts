import {useEffect} from 'react';
import {ServerUrl} from '@/utils/axios-instance';

export const useBrowserUnload = () => {
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Attempt to call logout when browser is closing
      try {
        // Use sendBeacon for more reliable API call on page unload
        const token = sessionStorage.getItem('authToken');
        if (token && navigator.sendBeacon) {
          const data = new FormData();
          navigator.sendBeacon(`${ServerUrl}/api/authentication/logout`, data);
        }
      } catch (error) {
        console.error('Error during beforeunload logout:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};