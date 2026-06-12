import React from 'react';
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {AlertCircle, CheckCircle, Clock, RefreshCw} from "lucide-react";
import {QueueStatusResponse} from "../data/license";

interface QueueStatusProps {
  data: QueueStatusResponse;
  onForceSync: () => void;
  isLoading?: boolean;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  data,
  onForceSync,
  isLoading = false
}) => {
  const {t} = useTranslation();

  const getQueueStatusConfig = (pendingCount: number, cloudAvailable: boolean) => {
    if (!cloudAvailable) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeClassName: 'border-red-200 bg-red-50 text-red-700',
        icon: <AlertCircle className="h-5 w-5"/>,
        status: t('license.queue.disconnected')
      };
    }

    if (pendingCount === 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeClassName: 'border-green-200 bg-green-50 text-green-700',
        icon: <CheckCircle className="h-5 w-5"/>,
        status: t('license.queue.synced')
      };
    }

    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badgeClassName: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      icon: <Clock className="h-5 w-5"/>,
      status: t('license.queue.pending')
    };
  };

  const formatDateTime = (value?: Date | string | null) => {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
  };

  const config = getQueueStatusConfig(data.pendingEventCount, data.cloudServiceAvailable);
  const DetailItem = ({label, value}: { label: string; value: React.ReactNode }) => (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-gray-950">{value}</dd>
    </div>
  );

  return (
    <Card className="gap-0 overflow-hidden rounded-lg py-0">
      <CardHeader className="border-b bg-white px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor} ${config.color}`}>
              {config.icon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-gray-950">{t('license.queue.title')}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={config.badgeClassName}>{config.status}</Badge>
                <span className="text-xs font-medium text-gray-500">
                  {data.pendingEventCount} {t('license.queue.pendingEvents')}
                </span>
              </div>
            </div>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onForceSync}
            disabled={isLoading || !data.cloudServiceAvailable}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
            {isLoading ? t('syncing') : t('license.queue.forceSync')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-4 py-4 md:px-5">
        <dl className="grid overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.queue.status')}
              value={<Badge variant="outline" className={config.badgeClassName}>{config.status}</Badge>}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.queue.pendingEvents')}
              value={data.pendingEventCount}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.queue.cloudService')}
              value={(
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${data.cloudServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`}/>
                  {data.cloudServiceAvailable ? t('available') : t('unavailable')}
                </span>
              )}
            />
          </div>
          <div className="bg-white p-4">
            <DetailItem
              label={t('license.queue.lastChecked')}
              value={formatDateTime(data.lastChecked)}
            />
          </div>
        </dl>

        {data.pendingEventCount > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600"/>
              <div>
                <p className="text-sm font-semibold text-blue-900">{t('license.queue.pendingTitle')}</p>
                <p className="mt-1 text-sm text-blue-800">
                  {t('license.queue.pendingDescription', {count: data.pendingEventCount})}
                </p>
              </div>
            </div>
          </div>
        )}

        {!data.cloudServiceAvailable && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"/>
              <div>
                <p className="text-sm font-semibold text-red-900">{t('license.queue.serviceUnavailable')}</p>
                <p className="mt-1 text-sm text-red-800">
                  {t('license.queue.serviceUnavailableDescription')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
