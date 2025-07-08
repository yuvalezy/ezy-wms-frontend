import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Save, X} from "lucide-react";
import {useThemeContext} from "@/components";
import {useAuth} from "@/components/AppContext";
import {Device, UpdateDeviceStatusRequest, DeviceStatus} from "../data/device";
import {deviceService} from "../data/device-service";
import {getOrCreateDeviceUUID} from "@/utils/deviceUtils";

interface DeviceStatusFormProps {
  device: Device;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (shouldReload: boolean) => void;
}

const DeviceStatusForm: React.FC<DeviceStatusFormProps> = ({device, open, onOpenChange, onClose}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const {updateDeviceStatus} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateDeviceStatusRequest>({
    defaultValues: {
      status: device.status,
      reason: ""
    }
  });

  const onSubmit = async (data: UpdateDeviceStatusRequest) => {
    try {
      setIsSubmitting(true);
      setLoading(true);
      
      await deviceService.updateStatus(device.deviceUuid, data);
      
      // Check if this is the current user's device and update the context
      const currentDeviceUUID = getOrCreateDeviceUUID();
      if (device.deviceUuid === currentDeviceUUID) {
        updateDeviceStatus(data.status);
      }
      
      onClose(true);
    } catch (error) {
      setError(`Failed to update device status: ${error}`);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  const availableStatuses = Object.values(DeviceStatus).filter(status => status !== device.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('updateDeviceStatus')}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('device')}: <span className="font-medium">{device.deviceName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('currentStatus')}: <span className="font-medium">{device.status}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="status"
              rules={{
                required: t('statusRequired'),
                validate: (value) => value !== device.status || t('selectDifferentStatus')
              }}
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('newStatus')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')}/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              rules={{
                required: t('reasonRequired'),
                minLength: {
                  value: 10,
                  message: t('reasonMinLength')
                },
                maxLength: {
                  value: 500,
                  message: t('reasonMaxLength')
                }
              }}
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('reason')} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('enterReasonForStatusChange')}
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2"/>
                {isSubmitting ? t('updating') : t('updateStatus')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2"/>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceStatusForm;