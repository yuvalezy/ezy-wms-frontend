import ContentTheme from '@/components/ContentTheme';
import React, {useState, useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components";
import {LicenseStatusResponse, QueueStatusResponse} from "@/features/license/data/license";
import {licenseService} from "@/features/license/data/license-service";
import {LicenseStatus} from "@/features/license/components/LicenseStatus";
import {QueueStatus} from "@/features/license/components/QueueStatus";
import {LicenseStatusSkeleton} from "@/features/license/components/LicenseStatusSkeleton";
import {QueueStatusSkeleton} from "@/features/license/components/QueueStatusSkeleton";

export const License: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();

  const [licenseData, setLicenseData] = useState<LicenseStatusResponse | null>(null);
  const [queueData, setQueueData] = useState<QueueStatusResponse | null>(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(false);
  const [isUpdatingLicense, setIsUpdatingLicense] = useState(false);

  useEffect(() => {
    loadLicenseData();
    loadQueueData();
  }, []);

  const loadLicenseData = async () => {
    try {
      setIsLoadingLicense(true);
      const data = await licenseService.getLicenseStatus();
      setLicenseData(data);
    } catch (error) {
      setError(`Failed to load license status: ${error}`);
    } finally {
      setIsLoadingLicense(false);
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
      setIsUpdatingLicense(true);
      await licenseService.forceSync();
      await loadQueueData();
    } catch (error) {
      setError(`Failed to force sync: ${error}`);
    } finally {
      setIsUpdatingLicense(false);
    }
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("license.title")}]}>
      <div className="space-y-6">
        {isLoadingLicense ? (
          <LicenseStatusSkeleton />
        ) : licenseData ? (
          <LicenseStatus
            data={licenseData}
            onRefresh={loadLicenseData}
            isLoading={isLoadingLicense}
          />
        ) : null}
        
        {isLoadingLicense ? (
          <QueueStatusSkeleton />
        ) : queueData ? (
          <QueueStatus
            data={queueData}
            onForceSync={handleForceSync}
            isLoading={isUpdatingLicense}
          />
        ) : null}
      </div>
    </ContentTheme>);
};