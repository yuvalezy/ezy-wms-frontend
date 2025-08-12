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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { ItemDetails } from '../data/items';
import { ItemMetadataDefinition } from '../types/ItemMetadataDefinition.dto';
import { MetadataFieldType } from '../../packages/types/MetadataFieldType.enum';
import { useItemMetadata } from '../hooks/useItemMetadata';

interface ItemMetadataFormProps {
  itemData: ItemDetails & { metadataDefinitions?: ItemMetadataDefinition[] };
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
    getFieldValidation,
    onFieldFocus,
    onFieldBlur
  } = useItemMetadata(itemData, itemData.metadataDefinitions);

  const form = useForm<FormData>({
    defaultValues: {}
  });

  // Initialize form with current item metadata
  useEffect(() => {
    const initialValues: FormData = {};
    definitions.forEach(def => {
      // Use the current value from the hook (which may be calculated) or the item's stored value
      const hookValue = getFieldValue(def.id);
      const currentValue = hookValue !== null ? hookValue : itemData.customAttributes?.[def.id];
      
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
  }, [definitions, itemData.customAttributes, form, getFieldValue]);

  // Update form values when calculated fields change
  useEffect(() => {
    definitions.forEach(def => {
      const hookValue = getFieldValue(def.id);
      const currentFormValue = form.getValues(def.id) || '';
      
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
  }, [metadataFormState.fields, definitions, form, getFieldValue]);

  const handleFieldChange = (fieldId: string, value: string) => {
    const definition = definitions.find(def => def.id === fieldId);
    if (!definition) return;

    console.log('🖊️ handleFieldChange:', { 
      fieldId, 
      rawValue: value, 
      type: definition.type,
      isCalculated: !!definition.calculated,
      clearDependenciesOnManualEdit: definition.calculated?.clearDependenciesOnManualEdit
    });

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
        case MetadataFieldType.Integer:
          const intValue = parseInt(value);
          convertedValue = isNaN(intValue) ? null : intValue;
          break;
        case MetadataFieldType.Date:
          convertedValue = new Date(value);
          break;
      }
    }

    console.log('  Converted value:', convertedValue);
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
    const isCalculated = !!definition.calculated;
    const allowManualEdit = definition.calculated?.clearDependenciesOnManualEdit || false;
    const isFieldDisabled = definition.readOnly || metadataFormState.isLoading || (isCalculated && !allowManualEdit);
    
    return (
      <FormField
        key={definition.id}
        control={form.control}
        name={definition.id}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              {definition.description}
              {definition.required && <span className="text-red-500">*</span>}
              {definition.readOnly && <span className="text-gray-500">(Read Only)</span>}
              {isCalculated && !allowManualEdit && <span className="text-blue-500">({t('calculated')})</span>}
              {isCalculated && allowManualEdit && <span className="text-green-500">({t('calculated')} - {t('editable')})</span>}
              {isCalculated && definition.calculated && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-1">{t('formula')}:</p>
                        <code className="block text-xs bg-muted p-2 rounded font-mono">
                          {definition.calculated.formula}
                        </code>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{t('dependsOn')}:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {definition.calculated.dependencies.map(depId => {
                            const depDefinition = definitions.find(d => d.id === depId);
                            return (
                              <li key={depId}>• {depDefinition?.description || depId}</li>
                            );
                          })}
                        </ul>
                      </div>
                      {definition.calculated.clearDependenciesOnManualEdit && (
                        <div className="text-sm text-amber-600 border-t pt-2">
                          <p className="font-medium">{t('note')}:</p>
                          <p>{t('manualEditWillClearDependents')}</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </FormLabel>
            <FormControl>
              {definition.type === MetadataFieldType.Date ? (
                <Input
                  type="date"
                  {...field}
                  disabled={isFieldDisabled}
                  onChange={(e) => {
                    if (!isCalculated || allowManualEdit) {
                      field.onChange(e);
                      handleFieldChange(definition.id, e.target.value);
                    }
                  }}
                  onFocus={() => onFieldFocus(definition.id)}
                  onBlur={() => onFieldBlur(definition.id)}
                  className={`${!validation.isValid ? 'border-red-500' : ''} ${isCalculated && !allowManualEdit ? 'bg-blue-50' : ''} ${isCalculated && allowManualEdit ? 'bg-green-50' : ''}`}
                />
              ) : definition.type === MetadataFieldType.Decimal ? (
                <Input
                  type="number"
                  step="any"
                  placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
                  {...field}
                  disabled={isFieldDisabled}
                  onChange={(e) => {
                    if (!isCalculated || allowManualEdit) {
                      field.onChange(e);
                      handleFieldChange(definition.id, e.target.value);
                    }
                  }}
                  onFocus={() => onFieldFocus(definition.id)}
                  onBlur={() => onFieldBlur(definition.id)}
                  className={`${!validation.isValid ? 'border-red-500' : ''} ${isCalculated && !allowManualEdit ? 'bg-blue-50' : ''} ${isCalculated && allowManualEdit ? 'bg-green-50' : ''}`}
                />
              ) : definition.type === MetadataFieldType.Integer ? (
                <Input
                  type="number"
                  step="1"
                  placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
                  {...field}
                  disabled={isFieldDisabled}
                  onChange={(e) => {
                    if (!isCalculated || allowManualEdit) {
                      field.onChange(e);
                      handleFieldChange(definition.id, e.target.value);
                    }
                  }}
                  onFocus={() => onFieldFocus(definition.id)}
                  onBlur={() => onFieldBlur(definition.id)}
                  className={`${!validation.isValid ? 'border-red-500' : ''} ${isCalculated && !allowManualEdit ? 'bg-blue-50' : ''} ${isCalculated && allowManualEdit ? 'bg-green-50' : ''}`}
                />
              ) : (
                <Input
                  type="text"
                  placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
                  {...field}
                  disabled={isFieldDisabled}
                  onChange={(e) => {
                    if (!isCalculated || allowManualEdit) {
                      field.onChange(e);
                      handleFieldChange(definition.id, e.target.value);
                    }
                  }}
                  onFocus={() => onFieldFocus(definition.id)}
                  onBlur={() => onFieldBlur(definition.id)}
                  className={`${!validation.isValid ? 'border-red-500' : ''} ${isCalculated && !allowManualEdit ? 'bg-blue-50' : ''} ${isCalculated && allowManualEdit ? 'bg-green-50' : ''}`}
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
        <CardTitle>{t('metadata')}</CardTitle>
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