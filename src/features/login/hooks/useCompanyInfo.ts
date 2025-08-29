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
  const baseUrl = `${ServerUrl}/api/`;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const deviceUUID = getOrCreateDeviceUUID();
        const response = await axios.get<CompanyInfoResponse>(`${baseUrl}Authentication/CompanyInfo`, {
          headers: {
            'X-Device-UUID': deviceUUID
          }
        });
        setCompanyInfo(response.data);
      } catch (error) {
        console.log(`Failed to load company name: ${error}`);
      }
    };

    fetchConfig();
  }, [baseUrl]);

  const reloadCompanyInfo = useCallback(async () => {
    try {
      const deviceUUID = getOrCreateDeviceUUID();
      const response = await axios.get<CompanyInfoResponse>(`${baseUrl}Authentication/CompanyInfo`, {
        headers: {
          'X-Device-UUID': deviceUUID
        }
      });
      setCompanyInfo(response.data);
    } catch (error) {
      console.error("Failed to reload company info:", error);
    }
  }, [baseUrl]);

  return {
    companyInfo,
    reloadCompanyInfo
  };
};