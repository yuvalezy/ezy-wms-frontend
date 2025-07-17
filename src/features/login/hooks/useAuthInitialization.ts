import { useEffect } from 'react';
import axios from 'axios';
import { axiosInstance } from '@/utils/axios-instance';
import { UserInfo } from '../data/login';

interface UseAuthInitializationProps {
  setUser: (user: UserInfo | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthInitialization = ({ setUser, setIsLoading }: UseAuthInitializationProps) => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if token exists and is not expired
        const token = sessionStorage.getItem('authToken');
        const expiration = sessionStorage.getItem('tokenExpiration');

        if (token && expiration) {
          const expirationDate = new Date(expiration);
          const now = new Date();

          if (expirationDate > now) {
            // Token is valid, fetch user info
            const response = await axiosInstance.get<UserInfo>(`General/UserInfo`);
            setUser(response.data);
          } else {
            // Token expired, clear it
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('tokenExpiration');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Only clear tokens if we get a 401/403 error
        if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('tokenExpiration');
          setUser(null);
        }
        // For other errors, don't clear the token - might be a network issue
      } finally {
        setIsLoading(false); // Always set loading to false
      }
    };
    fetchUser();
  }, [setUser, setIsLoading]);
};