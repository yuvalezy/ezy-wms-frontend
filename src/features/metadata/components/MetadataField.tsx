import React from 'react';
import {useTranslation} from 'react-i18next';
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
import {Info} from 'lucide-react';
import {MetadataDefinition} from '@/features/items';
import {MetadataFieldType} from '@/features/packages/types';
import {Control} from 'react-hook-form';

interface MetadataFieldProps {
  definition: MetadataDefinition;
  control: Control<Record<string, string>>;
  value: string;
  validation: { isValid: boolean; errorMessage?: string };
  isLoading: boolean;
  onFieldChange: (fieldId: string, value: string) => void;
  onFieldFocus?: (fieldId: string) => void;
  onFieldBlur?: (fieldId: string) => void;
  allDefinitions?: MetadataDefinition[];
}

export const MetadataField: React.FC<MetadataFieldProps> = ({
  definition,
  control,
  value,
  validation,
  isLoading,
  onFieldChange,
  onFieldFocus,
  onFieldBlur,
  allDefinitions = []
}) => {
  const { t } = useTranslation();
  
  const isCalculated = !!definition.calculated;
  const allowManualEdit = definition.calculated?.clearDependenciesOnManualEdit || false;
  const isFieldDisabled = definition.readOnly || isLoading || (isCalculated && !allowManualEdit);

  const renderInput = (field: any) => {
    const baseProps = {
      ...field,
      required: definition.required,
      disabled: isFieldDisabled,
      className: `${!validation.isValid ? 'border-red-500' : ''} ${isCalculated && !allowManualEdit ? 'bg-blue-50' : ''} ${isCalculated && allowManualEdit ? 'bg-green-50' : ''}`
    };

    switch (definition.type) {
      case MetadataFieldType.Date:
        return (
          <Input
            type="date"
            {...baseProps}
            onChange={(e) => {
              if (!isCalculated || allowManualEdit) {
                field.onChange(e);
                onFieldChange(definition.id, e.target.value);
              }
            }}
            onFocus={() => onFieldFocus?.(definition.id)}
            onBlur={() => onFieldBlur?.(definition.id)}
          />
        );

      case MetadataFieldType.Decimal:
        return (
          <Input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
            {...baseProps}
            onChange={(e) => {
              if (!isCalculated || allowManualEdit) {
                field.onChange(e);
                onFieldChange(definition.id, e.target.value);
              }
            }}
            onFocus={() => onFieldFocus?.(definition.id)}
            onBlur={(e) => {
              onFieldBlur?.(definition.id);
              // Convert to number on blur for validation
              const numValue = parseFloat(e.target.value);
              if (!isNaN(numValue)) {
                onFieldChange(definition.id, e.target.value);
              }
            }}
          />
        );

      case MetadataFieldType.Integer:
        return (
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
            {...baseProps}
            onChange={(e) => {
              if (!isCalculated || allowManualEdit) {
                // Only allow integer input
                const value = e.target.value.replace(/[^0-9-]/g, '');
                field.onChange(value);
                onFieldChange(definition.id, value);
              }
            }}
            onFocus={() => onFieldFocus?.(definition.id)}
            onBlur={(e) => {
              onFieldBlur?.(definition.id);
              // Convert to number on blur for validation
              const intValue = parseInt(e.target.value);
              if (!isNaN(intValue)) {
                onFieldChange(definition.id, e.target.value);
              }
            }}
          />
        );

      default: // String type
        return (
          <Input
            type="text"
            placeholder={isCalculated && !allowManualEdit ? 'Automatically calculated' : `${t('enterValue')} ${definition.description.toLowerCase()}`}
            {...baseProps}
            onChange={(e) => {
              if (!isCalculated || allowManualEdit) {
                field.onChange(e);
                onFieldChange(definition.id, e.target.value);
              }
            }}
            onFocus={() => onFieldFocus?.(definition.id)}
            onBlur={() => onFieldBlur?.(definition.id)}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
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
                          const depDefinition = allDefinitions.find(d => d.id === depId);
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
            {renderInput(field)}
          </FormControl>
          <FormMessage>
            {validation.errorMessage}
          </FormMessage>
        </FormItem>
      )}
    />
  );
};