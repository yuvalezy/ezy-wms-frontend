import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { 
  PackageDto, 
  PackageMetadataDefinition, 
  MetadataFieldType 
} from '../types';
import { PackageMetadataForm } from './PackageMetadataForm';

interface PackageMetadataDisplayProps {
  packageData: PackageDto;
  className?: string;
  showTitle?: boolean;
  onPackageUpdate?: (updatedPackage: PackageDto) => void;
}

export const PackageMetadataDisplay: React.FC<PackageMetadataDisplayProps> = ({
  packageData,
  className,
  showTitle = true,
  onPackageUpdate
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleSave = (updatedPackage: PackageDto) => {
    // Merge the updated package with the existing package data to preserve contents
    const mergedPackage: PackageDto = {
      ...packageData,
      ...updatedPackage,
      contents: packageData.contents, // Preserve the original contents array
      metadataDefinitions: packageData.metadataDefinitions // Preserve metadata definitions
    };
    onPackageUpdate?.(mergedPackage);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

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

  const renderEditButton = (className?: string) => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Edit className="h-4 w-4 mr-2" />
          {t('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('packages.editMetadata')}</DialogTitle>
        </DialogHeader>
        <PackageMetadataForm
          packageData={packageData}
          onSave={handleSave}
          onCancel={handleCancel}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('packages.metadata')}</CardTitle>
          {renderEditButton()}
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        {!hasValues ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t('packages.noMetadataValues')}
            </p>
            {!showTitle && renderEditButton()}
          </div>
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
            {!showTitle && (
              <div className="pt-4 border-t">
                {renderEditButton("w-full")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};