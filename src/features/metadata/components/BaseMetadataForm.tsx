import React, {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DialogFooter} from '@/components/ui/dialog';
import {Form} from '@/components/ui/form';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {MetadataDefinition} from '@/features/items';
import {MetadataFieldType} from '@/features/packages/types';
import {MetadataField} from './MetadataField';

export interface BaseMetadataFormProps {
  title: string;
  noFieldsMessage: string;
  definitions: MetadataDefinition[];
  currentValues: Record<string, any>;
  formState: {
    fields: Array<{ fieldId: string; value: any; isValid: boolean }>;
    isValid: boolean;
    isLoading: boolean;
    hasChanges: boolean;
  };
  getFieldValue: (fieldId: string) => any;
  getFieldValidation: (fieldId: string) => { isValid: boolean; errorMessage?: string };
  updateFieldValue: (fieldId: string, value: any) => void;
  onFieldFocus?: (fieldId: string) => void;
  onFieldBlur?: (fieldId: string) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  onCancel?: () => void;
  className?: string;
}

type FormData = Record<string, string>;

export const BaseMetadataForm: React.FC<BaseMetadataFormProps> = ({
  title,
  noFieldsMessage,
  definitions,
  currentValues,
  formState,
  getFieldValue,
  getFieldValidation,
  updateFieldValue,
  onFieldFocus,
  onFieldBlur,
  onSave,
  onReset,
  onCancel,
  className
}) => {
  const { t } = useTranslation();
  
  const form = useForm<FormData>({
    defaultValues: {}
  });

  // Initialize form with current values
  useEffect(() => {
    const initialValues: FormData = {};
    definitions.forEach(def => {
      // Use the current value from the hook (which may be calculated) or the stored value
      const hookValue = getFieldValue(def.id);
      const currentValue = hookValue !== null && hookValue !== undefined ? hookValue : currentValues[def.id];
      
      // Format values for form inputs
      if (currentValue !== null && currentValue !== undefined) {
        switch (def.type) {
          case MetadataFieldType.Date:
            // Format date for input[type="date"]
            const date = new Date(currentValue);
            initialValues[def.id] = date.toISOString().split('T')[0];
            break;
          case MetadataFieldType.Decimal:
          case MetadataFieldType.Integer:
          case MetadataFieldType.String:
          default:
            initialValues[def.id] = String(currentValue);
            break;
        }
      } else {
        initialValues[def.id] = '';
      }
    });
    
    form.reset(initialValues);
  }, [definitions, currentValues, form, getFieldValue]);

  // Update form values when calculated fields change
  useEffect(() => {
    definitions.forEach(def => {
      const hookValue = getFieldValue(def.id);
      const currentFormValue = form.getValues(def.id) ?? '';
      
      let formattedValue = '';
      if (hookValue !== null && hookValue !== undefined) {
        switch (def.type) {
          case MetadataFieldType.Date:
            const date = hookValue instanceof Date ? hookValue : new Date(hookValue);
            formattedValue = date.toISOString().split('T')[0];
            break;
          case MetadataFieldType.Decimal:
          case MetadataFieldType.Integer:
            // For numbers, convert to string
            formattedValue = String(hookValue);
            break;
          default:
            formattedValue = String(hookValue);
            break;
        }
      }
      
      // Update form value if different
      if (currentFormValue !== formattedValue) {
        form.setValue(def.id, formattedValue, { shouldValidate: false });
      }
    });
  }, [formState.fields, definitions, form, getFieldValue]);

  const handleFieldChange = (fieldId: string, value: string) => {
    const definition = definitions.find(def => def.id === fieldId);
    if (!definition) return;

    let convertedValue: string | number | Date | null = null;

    if (value.trim() !== '') {
      switch (definition.type) {
        case MetadataFieldType.String:
          convertedValue = value;
          break;
        case MetadataFieldType.Decimal:
          // Keep as string while typing to allow intermediate states like "0." or "1.000"
          // The validation will handle checking if it's a valid number
          convertedValue = value;
          break;
        case MetadataFieldType.Integer:
          // Keep as string while typing to allow intermediate states
          convertedValue = value;
          break;
        case MetadataFieldType.Date:
          convertedValue = new Date(value);
          break;
      }
    }

    updateFieldValue(fieldId, convertedValue);
  };

  const handleReset = () => {
    onReset();
    // Reset the react-hook-form as well
    const initialValues: FormData = {};
    definitions.forEach(def => {
      const currentValue = currentValues[def.id];
      if (currentValue !== null && currentValue !== undefined) {
        switch (def.type) {
          case MetadataFieldType.Date:
            const date = new Date(currentValue);
            initialValues[def.id] = date.toISOString().split('T')[0];
            break;
          default:
            initialValues[def.id] = String(currentValue);
            break;
        }
      } else {
        initialValues[def.id] = '';
      }
    });
    form.reset(initialValues);
  };

  if (definitions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            {noFieldsMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton while form is initially loading
  if (formState.isLoading && !formState.hasChanges) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" aria-label="Loading...">
            {definitions.slice(0, 3).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              {onCancel && <Skeleton className="h-10 w-20" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            {definitions.map(definition => (
              <MetadataField
                key={definition.id}
                definition={definition}
                control={form.control}
                value={form.watch(definition.id) || ''}
                validation={getFieldValidation(definition.id)}
                isLoading={formState.isLoading}
                onFieldChange={handleFieldChange}
                onFieldFocus={onFieldFocus}
                onFieldBlur={onFieldBlur}
                allDefinitions={definitions}
              />
            ))}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={formState.isLoading || !formState.hasChanges}
              >
                {t('reset')}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={formState.isLoading}
                >
                  {t('cancel')}
                </Button>
              )}

              <Button
                type="submit"
                disabled={!formState.isValid || formState.isLoading || !formState.hasChanges}
              >
                {formState.isLoading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};