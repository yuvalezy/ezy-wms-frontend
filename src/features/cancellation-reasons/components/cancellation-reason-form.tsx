import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Save, X} from "lucide-react";
import {useThemeContext} from "@/components";
import {CancellationReason, CancellationReasonFormData} from "../data/cancellation-reason";
import {cancellationReasonService} from "../data/cancellation-reason-service";
import {CancellationReasonFormSkeleton} from "./CancellationReasonFormSkeleton";

interface CancellationReasonFormProps {
  reason?: CancellationReason | null;
  onClose: (shouldReload?: boolean) => void;
}

const CancellationReasonForm: React.FC<CancellationReasonFormProps> = ({reason, onClose}) => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CancellationReasonFormData>({
    defaultValues: {
      name: reason?.name || "",
      isEnabled: reason?.isEnabled || true,
      counting: reason?.counting || false,
      goodsReceipt: reason?.goodsReceipt || false,
      transfer: reason?.transfer || false
    }
  });

  const isEditing = !!reason;

  const onSubmit = async (data: CancellationReasonFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing) {
        await cancellationReasonService.update(reason.id, data);
      } else {
        await cancellationReasonService.create(data);
      }

      onClose(true);
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} cancellation reason: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  // Show skeleton while form is submitting
  if (isSubmitting) {
    return <CancellationReasonFormSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: t('nameRequired'),
              minLength: {
                value: 2,
                message: t('nameMinLength')
              },
              maxLength: {
                value: 100,
                message: t('nameMaxLength')
              },
            }}
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('name')} *</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    placeholder={t('enterName')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isEnabled"
            render={({field}) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('isActive')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goodsReceipt"
            render={({field}) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('goodsReceipt')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transfer"
            render={({field}) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('transfer')}</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="counting"
            render={({field}) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('counting')}</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2"/>
              {isSubmitting ? t('saving') : t('save')}
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
    </div>
  );
};

export default CancellationReasonForm;