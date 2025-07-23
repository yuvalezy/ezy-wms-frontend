import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ItemDetails } from '../data/items';
import { ItemMetadataDefinition } from '../types/ItemMetadataDefinition.dto';
import { MetadataFieldType } from '../../packages/types/MetadataFieldType.enum';
import { useItemMetadata } from '../hooks/useItemMetadata';

interface ItemMetadataFormProps {
  itemData: ItemDetails;
  onSave?: (updatedItem: ItemDetails) => void;
  onCancel?: () => void;
  className?: string;
}

type FormData = Record<string, string>;

export const ItemMetadataForm: React.FC<ItemMetadataFormProps> = ({
  itemData,
  onSave,
  onCancel,
  className
}) => {
  const { t } = useTranslation();
  
  const {
    definitions,
    formState: metadataFormState,
    updateFieldValue,
    saveMetadata,
    resetForm,
    getFieldValue,
    getFieldValidation
  } = useItemMetadata(itemData);

  const form = useForm<FormData>({
    defaultValues: {}
  });

  // Initialize form with current item metadata
  useEffect(() => {
    const initialValues: FormData = {};
    definitions.forEach(def => {
      const currentValue = itemData.customAttributes?.[def.id];
      
      // Format values for form inputs
      if (currentValue !== null && currentValue !== undefined) {
        switch (def.type) {
          case MetadataFieldType.Date:
            // Format date for input[type="date"]
            const date = new Date(currentValue);
            initialValues[def.id] = date.toISOString().split('T')[0];
            break;
          case MetadataFieldType.Decimal:
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
  }, [definitions, itemData.customAttributes, form]);

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
          const numValue = parseFloat(value);
          convertedValue = isNaN(numValue) ? null : numValue;
          break;
        case MetadataFieldType.Date:
          convertedValue = new Date(value);
          break;
      }
    }

    updateFieldValue(fieldId, convertedValue);
  };

  const handleSave = async () => {
    try {
      const updatedItem = await saveMetadata(itemData.itemCode);
      onSave?.(updatedItem);
    } catch (error) {
      console.error('Failed to save metadata:', error);
      // Error is handled by the hook and ThemeContext
    }
  };

  const handleReset = () => {
    resetForm();
    // Reset the react-hook-form as well
    const initialValues: FormData = {};
    definitions.forEach(def => {
      const currentValue = itemData.customAttributes?.[def.id];
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

  const renderField = (definition: ItemMetadataDefinition) => {
    const validation = getFieldValidation(definition.id);
    
    return (
      <FormField
        key={definition.id}
        control={form.control}
        name={definition.id}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {definition.description}
              {definition.required && <span className="text-red-500 ml-1">*</span>}
              {definition.readOnly && <span className="text-gray-500 ml-1">(Read Only)</span>}
            </FormLabel>
            <FormControl>
              {definition.type === MetadataFieldType.Date ? (
                <Input
                  type="date"
                  {...field}
                  disabled={definition.readOnly}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange(definition.id, e.target.value);
                  }}
                  className={!validation.isValid ? 'border-red-500' : ''}
                />
              ) : definition.type === MetadataFieldType.Decimal ? (
                <Input
                  type="number"
                  step="any"
                  placeholder={`${t('enterValue')} ${definition.description.toLowerCase()}`}
                  {...field}
                  disabled={definition.readOnly}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange(definition.id, e.target.value);
                  }}
                  className={!validation.isValid ? 'border-red-500' : ''}
                />
              ) : (
                <Input
                  type="text"
                  placeholder={`${t('enterValue')} ${definition.description.toLowerCase()}`}
                  {...field}
                  disabled={definition.readOnly}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange(definition.id, e.target.value);
                  }}
                  className={!validation.isValid ? 'border-red-500' : ''}
                />
              )}
            </FormControl>
            <FormMessage>
              {validation.errorMessage}
            </FormMessage>
          </FormItem>
        )}
      />
    );
  };

  if (definitions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            {t('items.noMetadataFieldsConfigured')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('items.metadata')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {definitions.map(renderField)}
            
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={!metadataFormState.isValid || metadataFormState.isLoading || !metadataFormState.hasChanges}
                className="flex-1"
              >
                {metadataFormState.isLoading ? t('saving') : t('save')}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={metadataFormState.isLoading || !metadataFormState.hasChanges}
                className="flex-1"
              >
                {t('reset')}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={metadataFormState.isLoading}
                >
                  {t('cancel')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};