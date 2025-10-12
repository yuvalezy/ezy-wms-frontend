import React, {useEffect, useState} from "react";
import {PackageContentDto, PackageDto, PackageStatus} from "@/features/packages/types";
import {useTranslation} from "react-i18next";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import ClickableItemCode from "@/components/ClickableItemCode";
import ClickableBinCode from "@/components/ClickableBinCode";
import {Calendar, MapPin, User} from "lucide-react";
import {formatDistance} from "date-fns";
import {PackageMetadataDisplay} from "@/features/packages/components";
import {useAuth} from "@/Components";
import {InventoryUnitIndicators} from "@/components/InventoryUnitIndicators";
import {StockTotalsSummary} from "./StockTotalsSummary";
import {formatStock, getStockBreakdown} from "../utils/stock-calculations";
import {packageContentToStockItem} from "../utils/package-adapter";

export const PackageCheckResult: React.FC<{ packageData: PackageDto; onPackageUpdate?: (updatedPackage: PackageDto) => void }> = ({packageData: initialPackageData, onPackageUpdate}) => {
  const {t} = useTranslation();
  const {user, defaultUnit} = useAuth();
  const [packageData, setPackageData] = useState<PackageDto>(initialPackageData);
  const settings = user!.settings;

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


  const calculateTotals = () => {
    const totalItems = packageData.contents.length;
    const totalQuantity = packageData.contents.reduce((sum, content) => sum + content.quantity, 0);
    let totalPacks = 0;

    packageData.contents.forEach(content => {
      const stockItem = packageContentToStockItem(content);
      const breakdown = getStockBreakdown(stockItem, settings);
      totalPacks += breakdown.packages;
    });

    return {totalItems, totalQuantity, totalPacks};
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
                  <MapPin className="h-4 w-4"/>
                  <ClickableBinCode
                    binEntry={packageData.binEntry}
                    binCode={packageData.binCode}
                  />
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="h-4 w-4"/>
                <span>{packageData.createdBy?.name}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="h-4 w-4"/>
              <span>{t('packages.packageCreated')}: {formatDistance(new Date(packageData.createdAt), new Date(), {addSuffix: true})}</span>
            </div>
            {packageData.closedAt && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <Calendar className="h-4 w-4"/>
                <span>{t('packages.packageClosed')}: {formatDistance(new Date(packageData.closedAt), new Date(), {addSuffix: true})}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Package Metadata */}
      {user?.packageMetaData && user.packageMetaData.length > 0 && (
        <PackageMetadataDisplay packageData={packageData} onPackageUpdate={handlePackageUpdate}/>
      )}

      {/* Package Contents */}
      <Card className="p-0 gap-0">
        {packageData.contents.map((content, index) => {
          const stockItem = packageContentToStockItem(content);
          const breakdown = getStockBreakdown(stockItem, settings);
          const stockText = formatStock(stockItem, settings, true, defaultUnit, t);

          return (
            <div key={content.id} className={`${index !== 0 ? 'border-t' : ''}`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ClickableItemCode itemCode={content.itemCode}/>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {content.itemData?.itemName || content.itemCode}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {stockText}
                  </p>
                </div>

                <InventoryUnitIndicators
                  packages={breakdown.packages}
                  dozens={breakdown.dozens}
                  units={breakdown.units}
                />
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
      <StockTotalsSummary
        totals={{
          primaryCount: totals.totalItems,
          totalBoxes: totals.totalPacks,
          mixedBoxes: totals.totalQuantity,
        }}
        enablePackages={true}
        unitSelection={true}
        primaryLabel="totalItems"
        thirdLabel="packages.totalQuantity"
      />
    </div>
  );
};