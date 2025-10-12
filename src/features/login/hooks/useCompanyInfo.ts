import {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import {ServerUrl} from '@/utils/axios-instance';
import {getOrCreateDeviceUUID} from '@/utils/deviceUtils';
import {DeviceStatus} from '@/features/devices/data/device';
import {LicenseWarning} from '@/features/license/data/license';
import {AccountState} from '@/features/account/data/account';

export interface CompanyInfoResponse {
  companyName: string;
  serverTime: string; // ISO date string
  licenseWarnings: LicenseWarning[]; // Array of warning messages
  deviceStatus?: DeviceStatus;
  accountStatus?: AccountState;
}

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoResponse | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = `${ServerUrl}/api/`;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setConnectionError(false);
        const deviceUUID = getOrCreateDeviceUUID();
        const response = await axios.get<CompanyInfoResponse>(`${baseUrl}Authentication/CompanyInfo`, {
          headers: {
            'X-Device-UUID': deviceUUID
          }
        });
        setCompanyInfo(response.data);
        setConnectionError(false);
      } catch (error: any) {
        console.log(`Failed to load company name: ${error}`);
        // Check if it's a network error (server unreachable)
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || !error.response) {
          setConnectionError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [baseUrl]);

  const reloadCompanyInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionError(false);
      const deviceUUID = getOrCreateDeviceUUID();
      const response = await axios.get<CompanyInfoResponse>(`${baseUrl}Authentication/CompanyInfo`, {
        headers: {
          'X-Device-UUID': deviceUUID
        }
      });
      setCompanyInfo(response.data);
      setConnectionError(false);
    } catch (error: any) {
      console.error("Failed to reload company info:", error);
      // Check if it's a network error (server unreachable)
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || !error.response) {
        setConnectionError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  return {
    companyInfo,
    connectionError,
    isLoading,
    reloadCompanyInfo
  };
};