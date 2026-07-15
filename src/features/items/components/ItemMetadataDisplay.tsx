import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {Edit} from 'lucide-react';
import InfoBox from '@/components/InfoBox';
import {ItemDetails} from '../data/items';
import {getFieldValuesRecord, initializeFields, MetadataFieldType, useCalculatedFields} from '@/features/metadata';
import {canEditMetadata, getItemMetadata, ItemMetadataEditDialog, MetadataDefinition} from '@/features/items';
import {useAuth} from "@/components";
import {useThemeContext} from '@/components/ThemeContext';

interface ItemMetadataDisplayProps {
  itemData: ItemDetails;
  className?: string;
  onItemUpdate?: (updatedItem: ItemDetails) => void;
}

export const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
  itemData,
  className,
  onItemUpdate
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { setError } = useThemeContext();
  const [isLoading, setIsLoading] = useState(true);
  const [metadataValues, setMetadataValues] = useState<Record<string, any>>({});
  const definitions = user!.itemMetaData;
  const hasMetadata = definitions && definitions.length > 0;
  const hasEditableFields = canEditMetadata(user);

  // Calculated fields are derived, so the formula — not whatever the external system happens
  // to have stored — is the source of truth for what is shown. Mirrors the edit dialog, which
  // recalculates on open; without this the two screens disagree about the same field.
  const calculatedFields = useCalculatedFields({definitions: definitions ?? []});
  const resolvedValues = useMemo(() => {
    if (!definitions || definitions.length === 0) {
      return metadataValues;
    }
    const fields = initializeFields(definitions, metadataValues);
    return getFieldValuesRecord(calculatedFields.recalculateFields(fields));
  }, [definitions, metadataValues, calculatedFields]);

  // Decimal places come from the field's configured Step, falling back to the rounding
  // precision of a calculated field. Without an explicit maximumFractionDigits the default
  // is 3, which silently rounds small values (0.000007 renders as "0").
  const formatNumber = (value: number, definition: MetadataDefinition): string => {
    const decimals = definition.step ?? definition.calculated?.precision;
    if (decimals === undefined) {
      return String(value);
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  };

  const formatValue = (value: any, definition: MetadataDefinition): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (definition.type) {
      case MetadataFieldType.Date:
        return new Date(value).toLocaleDateString();
      case MetadataFieldType.Decimal:
      case MetadataFieldType.Integer:
        return typeof value === 'number' ? formatNumber(value, definition) : String(value);
      case MetadataFieldType.String:
      default:
        return String(value);
    }
  };

  const getFieldTypeLabel = (fieldType: MetadataFieldType): string => {
    switch (fieldType) {
      case MetadataFieldType.String:
        return t('text');
      case MetadataFieldType.Decimal:
        return t('number');
      case MetadataFieldType.Integer:
        return t('integer');
      case MetadataFieldType.Date:
        return t('date');
      default:
        return t('unknown');
    }
  };

  // Load metadata values from API
  useEffect(() => {
    const loadMetadata = async () => {
      if (!hasMetadata) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getItemMetadata(itemData.itemCode);
        setMetadataValues(response.metadata || {});
      } catch (error) {
        console.error('Failed to load item metadata:', error);
        setError(error as Error);
        setMetadataValues({});
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [itemData.itemCode, hasMetadata, setError]);

  const handleItemUpdate = async (updatedItem: ItemDetails) => {
    // Merge the updated item with the existing item data to preserve other properties
    const mergedItem: ItemDetails = {
      ...itemData,
      ...updatedItem,
    };
    onItemUpdate?.(mergedItem);
    
    // Reload metadata to show updated values
    try {
      const response = await getItemMetadata(itemData.itemCode);
      setMetadataValues(response.metadata || {});
    } catch (error) {
      console.error('Failed to reload item metadata:', error);
    }
  };

  if (!hasMetadata) {
    return null;
  }

  const renderEditButton = () => {
    if (!hasEditableFields) {
      return null;
    }

    return (
      <ItemMetadataEditDialog
        itemCode={itemData.itemCode}
        onItemUpdate={handleItemUpdate}
      />
    );
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <div>&nbsp;</div>
          {hasEditableFields && (
            <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
              <Edit className="h-4 w-4" />
              <span className="ml-2">{t('edit')}</span>
            </Button>
          )}
        </div>
        <InfoBox>
          {definitions?.map(definition => (
            <div key={definition.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
                <span className="text-gray-500">:</span>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </InfoBox>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div>&nbsp;</div>
        {renderEditButton()}
      </div>
      <InfoBox>
        {definitions?.map(definition => {
          const value = resolvedValues[definition.id];
          const displayValue = formatValue(value, definition);
          
          return (
            <div key={definition.id}>
              <span className="text-gray-500">{definition.description}</span>
              <span className="ml-1 text-xs text-gray-400">{getFieldTypeLabel(definition.type)}</span>
              {definition.required && <span className="text-red-500 ml-1">*</span>}
              {definition.readOnly && <span className="text-gray-400 ml-1">(RO)</span>}
              <span className="text-gray-500">:</span>
              <span className="ml-2 font-medium">{displayValue}</span>
            </div>
          );
        })}
      </InfoBox>
    </div>
  );
};