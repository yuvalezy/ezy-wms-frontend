import React from 'react';
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Clock, CheckCircle, AlertCircle, RefreshCw} from "lucide-react";
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
        badgeVariant: 'destructive' as const,
        icon: <AlertCircle className="h-5 w-5"/>,
        status: t('license.queue.disconnected')
      };
    }

    if (pendingCount === 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeVariant: 'default' as const,
        icon: <CheckCircle className="h-5 w-5"/>,
        status: t('license.queue.synced')
      };
    }

    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badgeVariant: 'secondary' as const,
      icon: <Clock className="h-5 w-5"/>,
      status: t('license.queue.pending')
    };
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  const config = getQueueStatusConfig(data.pendingEventCount, data.cloudServiceAvailable);

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={config.color}>
              {config.icon}
            </span>
            <span>{t('license.queue.title')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onForceSync}
            disabled={isLoading || !data.cloudServiceAvailable}
          >
            <RefreshCw className="h-4 w-4 mr-2"/>
            {isLoading ? t('syncing') : t('license.queue.forceSync')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.queue.status')}</label>
              <div className="mt-1">
                <Badge variant={config.badgeVariant}>{config.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.queue.pendingEvents')}</label>
              <div className="mt-1 text-sm text-gray-900 font-medium">
                {data.pendingEventCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.queue.cloudService')}</label>
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${data.cloudServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`}/>
                <span className="text-sm text-gray-900">
                  {data.cloudServiceAvailable ? t('available') : t('unavailable')}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('license.queue.lastChecked')}</label>
              <div className="mt-1 text-sm text-gray-900">{formatDateTime(data.lastChecked)}</div>
            </div>
          </div>

          {data.pendingEventCount > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-sm font-medium text-blue-800">{t('license.queue.pendingTitle')}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('license.queue.pendingDescription', {count: data.pendingEventCount})}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!data.cloudServiceAvailable && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-sm font-medium text-red-800">{t('license.queue.serviceUnavailable')}</p>
                  <p className="text-sm text-red-700 mt-1">
                    {t('license.queue.serviceUnavailableDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};