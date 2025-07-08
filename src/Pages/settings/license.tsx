import ContentTheme from '@/components/ContentTheme';
import React, {useState, useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components";
import {LicenseStatusResponse, QueueStatusResponse} from "./data/license";
import {licenseService} from "./data/license-service";
import {LicenseStatus} from "./components/LicenseStatus";
import {QueueStatus} from "./components/QueueStatus";

export const License: React.FC = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();

  const [licenseData, setLicenseData] = useState<LicenseStatusResponse | null>(null);
  const [queueData, setQueueData] = useState<QueueStatusResponse | null>(null);

  useEffect(() => {
    loadLicenseData();
    loadQueueData();
  }, []);

  const loadLicenseData = async () => {
    try {
      setLoading(true);
      const data = await licenseService.getLicenseStatus();
      setLicenseData(data);
    } catch (error) {
      setError(`Failed to load license status: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadQueueData = async () => {
    try {
      const data = await licenseService.getQueueStatus();
      setQueueData(data);
    } catch (error) {
      setError(`Failed to load queue status: ${error}`);
    }
  };

  const handleForceSync = async () => {
    try {
      setLoading(true);
      await licenseService.forceSync();
      await loadQueueData();
    } catch (error) {
      setError(`Failed to force sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("license.title")}]}>
      <div className="space-y-6">
        {licenseData && (
          <LicenseStatus
            data={licenseData}
            onRefresh={loadLicenseData}
          />
        )}
        
        {queueData && (
          <QueueStatus
            data={queueData}
            onForceSync={handleForceSync}
          />
        )}
      </div>
    </ContentTheme>);
};