import React, { useState, useEffect } from "react";
import {PackageDto, PackageStatus, PackageContentDto} from "@/features/packages/types";
import {useTranslation} from "react-i18next";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import ClickableItemCode from "@/components/ClickableItemCode";
import ClickableBinCode from "@/components/ClickableBinCode";
import {Package, MapPin, Calendar, User, Box, Grid3x3} from "lucide-react";
import {formatDistance} from "date-fns";
import {PackageMetadataDisplay} from "@/features/packages/components";
import {useAuth} from "@/Components";

export const PackageCheckResult: React.FC<{ packageData: PackageDto; onPackageUpdate?: (updatedPackage: PackageDto) => void }> = ({packageData: initialPackageData, onPackageUpdate}) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [packageData, setPackageData] = useState<PackageDto>(initialPackageData);

  useEffect(() => {
    setPackageData(initialPackageData);
  }, [initialPackageData]);

  const handlePackageUpdate = (updatedPackage: PackageDto) => {
    setPackageData(updatedPackage);
    onPackageUpdate?.(updatedPackage);
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.Active:
        return "bg-green-100 text-green-800";
      case PackageStatus.Closed:
        return "bg-blue-100 text-blue-800";
      case PackageStatus.Cancelled:
        return "bg-red-100 text-red-800";
      case PackageStatus.Locked:
        return "bg-yellow-100 text-yellow-800";
      case PackageStatus.Init:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: PackageStatus) => {
    return t(`packages.status.${status.toLowerCase()}`);
  };

  const formatStock = (content: PackageContentDto) => {
    if (!content.itemData) {
      return `${content.quantity} ${t('units')}`;
    }
    
    const { quantityInUnit, quantityInPack } = content.itemData;
    const totalUnits = content.quantity;
    
    // Calculate breakdown: packs -> dozens -> units
    const packs = Math.floor(totalUnits / (quantityInUnit * quantityInPack));
    const remainingForDozens = totalUnits % (quantityInUnit * quantityInPack);
    const dozens = Math.floor(remainingForDozens / quantityInUnit);
    const units = remainingForDozens % quantityInUnit;
    
    const parts = [];
    if (packs > 0) parts.push(`${packs} ${content.itemData.packMeasure || 'Box'}`);
    if (dozens > 0) parts.push(`${dozens} ${content.itemData.unitMeasure || 'Doz'}`);
    if (units > 0) parts.push(`${units} ${t('units')}`);
    
    return parts.join(', ') || '0';
  };

  const getStockBreakdown = (content: PackageContentDto) => {
    if (!content.itemData) {
      return { packs: 0, dozens: 0, units: content.quantity };
    }
    
    const { quantityInUnit, quantityInPack } = content.itemData;
    const totalUnits = content.quantity;
    
    const packs = Math.floor(totalUnits / (quantityInUnit * quantityInPack));
    const remainingForDozens = totalUnits % (quantityInUnit * quantityInPack);
    const dozens = Math.floor(remainingForDozens / quantityInUnit);
    const units = remainingForDozens % quantityInUnit;
    
    return { packs, dozens, units };
  };

  const calculateTotals = () => {
    const totalItems = packageData.contents.length;
    const totalQuantity = packageData.contents.reduce((sum, content) => sum + content.quantity, 0);
    let totalPacks = 0;
    let totalDozens = 0;
    let totalUnits = 0;
    
    packageData.contents.forEach(content => {
      const breakdown = getStockBreakdown(content);
      totalPacks += breakdown.packs;
      totalDozens += breakdown.dozens;
      totalUnits += breakdown.units;
    });
    
    return { totalItems, totalQuantity, totalPacks, totalDozens, totalUnits };
  };

  if (!packageData) {
    return <p className="text-center text-muted-foreground">{t('packages.noPackageContentFound')}</p>;
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      {/* Package Information Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('packages.packageBarcode')}: {packageData.barcode}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Badge className={getStatusColor(packageData.status)}>
                  {getStatusLabel(packageData.status)}
                </Badge>
              </div>
              {packageData.binCode && packageData.binEntry && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <ClickableBinCode 
                    binEntry={packageData.binEntry} 
                    binCode={packageData.binCode}
                  />
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{packageData.createdBy?.name}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="h-4 w-4" />
              <span>{t('packages.packageCreated')}: {formatDistance(new Date(packageData.createdAt), new Date(), {addSuffix: true})}</span>
            </div>
            {packageData.closedAt && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <Calendar className="h-4 w-4" />
                <span>{t('packages.packageClosed')}: {formatDistance(new Date(packageData.closedAt), new Date(), {addSuffix: true})}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Package Metadata */}
      {user?.packageMetaData && user.packageMetaData.length > 0 && (
        <PackageMetadataDisplay packageData={packageData} onPackageUpdate={handlePackageUpdate} />
      )}

      {/* Package Contents */}
      <Card className="p-0 gap-0">
        {packageData.contents.map((content, index) => {
          const { packs, dozens, units } = getStockBreakdown(content);

          return (
            <div key={content.id} className={`${index !== 0 ? 'border-t' : ''}`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ClickableItemCode itemCode={content.itemCode} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {content.itemData?.itemName || content.itemCode}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatStock(content)}
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex gap-1">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      packs > 0 ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.box.abbr')}
                    </span>
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      dozens > 0 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.dozen.abbr')}
                    </span>
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      units > 0 ? 'bg-amber-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.unit.abbr')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {packageData.contents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t('packages.noPackageContentFound')}
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Grid3x3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">{t('totalItems')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalPacks}</p>
          <p className="text-xs text-gray-500 mt-1">{t('inventory.totalBoxes')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Box className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalQuantity}</p>
          <p className="text-xs text-gray-500 mt-1">{t('packages.totalQuantity')}</p>
        </Card>
      </div>
    </div>
  );
};