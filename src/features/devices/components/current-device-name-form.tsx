import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import axios from "axios";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Save, X} from "lucide-react";
import {useThemeContext} from "@/components";
import {UpdateDeviceNameRequest} from "../data/device";
import {deviceService} from "../data/device-service";

interface CurrentDeviceNameFormProps {
  currentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (shouldReload: boolean) => void;
}

/**
 * Lets the logged-in user rename the device they are currently connected from.
 * Unlike DeviceNameForm (SuperUser, any device), the target device is resolved
 * server-side from the X-Device-UUID header, so no device UUID is sent.
 */
const CurrentDeviceNameForm: React.FC<CurrentDeviceNameFormProps> = ({currentName, open, onOpenChange, onClose}) => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateDeviceNameRequest>({
    defaultValues: {
      deviceName: currentName ?? ""
    }
  });

  const onSubmit = async (data: UpdateDeviceNameRequest) => {
    try {
      setIsSubmitting(true);

      await deviceService.updateMyName(data);

      onClose(true);
    } catch (error) {
      if (axios.isAxiosError(error) &&
          error.response?.status === 400 &&
          error.response?.data?.error === "Device name already in use") {
        setError(t('deviceNameAlreadyInUse'));
      } else {
        setError(`Failed to update device name: ${error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeDeviceName')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('device')}: <span className="font-medium">{currentName || t('unnamedDevice', 'Unnamed device')}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="deviceName"
              rules={{
                required: t('deviceNameRequired'),
                minLength: {
                  value: 3,
                  message: t('deviceNameMinLength')
                },
                maxLength: {
                  value: 100,
                  message: t('deviceNameMaxLength')
                },
                validate: (value) => value !== currentName || t('enterDifferentName')
              }}
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('newDeviceName')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('enterNewDeviceName')}
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
                {isSubmitting ? t('updating') : t('changeName')}
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

export default CurrentDeviceNameForm;
