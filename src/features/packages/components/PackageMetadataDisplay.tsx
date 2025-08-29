import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog';
import {Edit} from 'lucide-react';
import InfoBox from '@/components/InfoBox';
import {MetadataFieldType, PackageDto} from '../types';
import {PackageMetadataForm} from './PackageMetadataForm';
import {useAuth} from "@/Components";

interface PackageMetadataDisplayProps {
  packageData: PackageDto;
  className?: string;
  onPackageUpdate?: (updatedPackage: PackageDto) => void;
}

export const PackageMetadataDisplay: React.FC<PackageMetadataDisplayProps> = ({
  packageData,
  className,
  onPackageUpdate
}) => {
  const { t } = useTranslation();
  const {user} =  useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatValue = (value: any, fieldType: MetadataFieldType): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (fieldType) {
      case MetadataFieldType.Date:
        return new Date(value).toLocaleDateString();
      case MetadataFieldType.Decimal:
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case MetadataFieldType.Integer:
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
      case MetadataFieldType.Integer:
        return t('integer');
      case MetadataFieldType.Date:
        return t('date');
      default:
        return t('unknown');
    }
  };

  const definitions = user!.packageMetaData;
  const hasMetadata = definitions && definitions.length > 0;

  const handleSave = (updatedPackage: PackageDto) => {
    // Merge the updated package with the existing package data to preserve contents
    const mergedPackage: PackageDto = {
      ...packageData,
      ...updatedPackage,
      contents: packageData.contents, // Preserve the original contents array
    };
    onPackageUpdate?.(mergedPackage);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  if (!hasMetadata) {
    return null;
  }

  const renderEditButton = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Edit className="h-4 w-4" />
          <span className="ml-2">{t('edit')}</span>
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
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{t('packages.metadata')}</h3>
        {renderEditButton()}
      </div>
      <InfoBox>
        {definitions.map(definition => {
          const value = packageData.customAttributes?.[definition.id];
          const displayValue = formatValue(value, definition.type);
          
          return (
            <div key={definition.id}>
              <span className="text-gray-500">{definition.description}</span>
              <span className="ml-1 text-xs text-gray-400">{getFieldTypeLabel(definition.type)}</span>
              <span className="text-gray-500">:</span>
              <span className="ml-2 font-medium">{displayValue}</span>
            </div>
          );
        })}
      </InfoBox>
    </div>
  );
};