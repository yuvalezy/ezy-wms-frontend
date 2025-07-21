import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PackageDto, 
  PackageMetadataDefinition, 
  MetadataFieldType 
} from '../types';

interface PackageMetadataDisplayProps {
  packageData: PackageDto;
  className?: string;
  showTitle?: boolean;
}

export const PackageMetadataDisplay: React.FC<PackageMetadataDisplayProps> = ({
  packageData,
  className,
  showTitle = true
}) => {
  const { t } = useTranslation();

  const formatValue = (value: any, fieldType: MetadataFieldType): string => {
    if (value === null || value === undefined) {
      return t('notSet');
    }

    switch (fieldType) {
      case MetadataFieldType.Date:
        return new Date(value).toLocaleDateString();
      case MetadataFieldType.Decimal:
        return typeof value === 'number' ? value.toLocaleString() : String(value);
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
      case MetadataFieldType.Date:
        return t('date');
      default:
        return t('unknown');
    }
  };

  const hasMetadata = packageData.metadataDefinitions && packageData.metadataDefinitions.length > 0;
  const hasValues = packageData.customAttributes && Object.keys(packageData.customAttributes).length > 0;

  if (!hasMetadata) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            {t('packages.noMetadataFieldsConfigured')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle>{t('packages.metadata')}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        {!hasValues ? (
          <p className="text-muted-foreground text-center">
            {t('packages.noMetadataValues')}
          </p>
        ) : (
          <div className="space-y-3">
            {packageData.metadataDefinitions.map(definition => {
              const value = packageData.customAttributes?.[definition.id];
              const displayValue = formatValue(value, definition.type);
              const hasValue = value !== null && value !== undefined;

              return (
                <div key={definition.id} className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{definition.description}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getFieldTypeLabel(definition.type)}
                      </Badge>
                    </div>
                    <span className={`text-sm ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {displayValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};