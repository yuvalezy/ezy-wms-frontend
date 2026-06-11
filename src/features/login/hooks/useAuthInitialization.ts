import {useEffect} from 'react';
interface UseAuthInitializationProps {
  refreshSession: () => Promise<boolean>;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthInitialization = ({ refreshSession, setIsLoading }: UseAuthInitializationProps) => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoading(false); // Always set loading to false
      }
    };
    fetchUser();
  }, [refreshSession, setIsLoading]);
};
