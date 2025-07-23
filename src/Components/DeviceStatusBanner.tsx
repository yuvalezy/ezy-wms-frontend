import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DeviceStatus } from '@/features/devices/data/device';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { deviceService } from '@/features/devices/data/device-service';
import { getOrCreateDeviceUUID } from '@/utils/deviceUtils';
import { useAuth } from '@/components/AppContext';
import {useThemeContext} from "@/components/ThemeContext";

interface DeviceStatusBannerProps {
  deviceStatus: DeviceStatus;
  onClose: () => void;
  showBorder?: boolean;
  showCloseButton?: boolean;
  allowActivation?: boolean;
}

const DeviceStatusBanner: React.FC<DeviceStatusBannerProps> = ({ 
  deviceStatus, 
  onClose, 
  showBorder = false, 
  showCloseButton = true,
  allowActivation = false
}) => {
  const { t } = useTranslation();
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const { setLoading, setError } = useThemeContext();
  const { updateDeviceStatus } = useAuth();
  
  const form = useForm<{ reason?: string }>({
    defaultValues: {
      reason: ''
    }
  });

  const handleActivateDevice = async (data: { reason?: string }) => {
    try {
      setIsActivating(true);
      setLoading(true);
      
      const currentDeviceUUID = getOrCreateDeviceUUID();
      await deviceService.updateStatus(currentDeviceUUID, {
        status: DeviceStatus.Active,
        reason: data.reason || ''
      });
      
      // Update the local device status
      updateDeviceStatus(DeviceStatus.Active);
      
      // Close the dialog and banner
      setShowActivateDialog(false);
      onClose();
    } catch (error) {
      setError(t('deviceStatusBanner.activationError', 'Failed to activate device. Please try again.'));
    } finally {
      setIsActivating(false);
      setLoading(false);
    }
  };

  const getBannerConfig = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.Inactive:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          message: t('deviceStatusBanner.inactive', 'Your device is currently inactive. Please contact your administrator.')
        };
      case DeviceStatus.Disabled:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          message: t('deviceStatusBanner.disabled', 'Your device has been disabled. Please contact your administrator.')
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig(deviceStatus);

  if (!config) {
    return null;
  }

  const containerClasses = showBorder 
    ? `flex items-center justify-between p-4 ${config.bgColor} border ${config.borderColor} rounded-lg w-full`
    : `flex items-center justify-between p-4 ${config.bgColor} w-full`;

  const canShowActivateButton = allowActivation && deviceStatus === DeviceStatus.Inactive;

  return (
    <>
      <div className={containerClasses} style={showBorder ? {} : { left: '0px', right: '0px' }}>
        <div className="flex items-center">
          <AlertTriangle className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0`} />
          <p className={`text-sm font-medium ${config.textColor}`}>
            {config.message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canShowActivateButton && (
            <Button
              onClick={() => setShowActivateDialog(true)}
              size="sm"
              variant="outline"
              className={`${config.textColor} border-current hover:bg-opacity-10`}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              {t('deviceStatusBanner.activateDevice', 'Activate Device')}
            </Button>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`${config.textColor} hover:bg-opacity-20 hover:bg-gray-500 rounded-full p-1 transition-colors`}
              aria-label={t('close', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activation Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deviceStatusBanner.activateDeviceTitle', 'Activate Device')}</DialogTitle>
            <DialogDescription>
              {t('deviceStatusBanner.activateDeviceDescription', 'You can optionally provide a reason for activating this device.')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleActivateDevice)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                rules={{
                  maxLength: {
                    value: 500,
                    message: t('deviceStatusBanner.reasonMaxLength', 'Reason must not exceed 500 characters')
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('deviceStatusBanner.reasonLabel', 'Reason (Optional)')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('deviceStatusBanner.reasonPlaceholder', 'Enter the reason for activating this device...')}
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowActivateDialog(false)}
                  disabled={isActivating}
                >
                  {t('cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={isActivating}>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {isActivating 
                    ? t('deviceStatusBanner.activating', 'Activating...') 
                    : t('deviceStatusBanner.activate', 'Activate')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceStatusBanner;