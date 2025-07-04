import React, {useState} from "react";
import {PackageDto, PackageStatus, UnitType} from "@/pages/packages/types";
import {useTranslation} from "react-i18next";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {ChevronRight, Package, MapPin, Calendar, User, Box} from "lucide-react";
import {formatDistance} from "date-fns";

export const PackageCheckResult: React.FC<{ packageData: PackageDto }> = ({packageData}) => {
  const {t} = useTranslation();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (contentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedRows(newExpanded);
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

  const getUnitIcon = (unitType: UnitType) => {
    switch (unitType) {
      case UnitType.Pack:
        return "bg-blue-500";
      case UnitType.Dozen:
        return "bg-green-500";
      case UnitType.Unit:
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUnitLabel = (unitType: UnitType) => {
    switch (unitType) {
      case UnitType.Pack:
        return t('inventory.units.pack.abbr');
      case UnitType.Dozen:
        return t('inventory.units.dozen.abbr');
      case UnitType.Unit:
        return t('inventory.units.unit.abbr');
      default:
        return unitType;
    }
  };

  const calculateTotals = () => {
    const totalItems = packageData.contents.length;
    const totalQuantity = packageData.contents.reduce((sum, content) => sum + content.quantity, 0);
    const uniqueItems = new Set(packageData.contents.map(c => c.itemCode)).size;
    
    return { totalItems, totalQuantity, uniqueItems };
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
              {packageData.binCode && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{packageData.binCode}</span>
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

      {/* Package Contents */}
      <Card className="p-0 gap-0">
        <div className="p-4 border-b">
          <h4 className="text-md font-medium">{t('packages.packageContents')}</h4>
        </div>
        
        {packageData.contents.map((content, index) => {
          const isExpanded = expandedRows.has(content.id);
          const hasDetails = content.itemName || content.binCode;

          return (
            <div key={content.id} className={`${index !== 0 ? 'border-t' : ''}`}>
              <div
                onClick={() => hasDetails ? toggleRow(content.id) : null}
                className={`flex items-center justify-between p-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{content.itemCode}</span>
                  </div>
                  {content.itemName && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {content.itemName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900 font-medium">
                      {content.quantity} {getUnitLabel(content.unitType)}
                    </span>
                    {content.binCode && (
                      <span className="text-xs text-gray-500">
                        @ {content.binCode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${getUnitIcon(content.unitType)}`}>
                    {getUnitLabel(content.unitType)}
                  </span>
                  
                  {hasDetails && (
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ml-2 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </div>
              </div>

              {hasDetails && isExpanded && (
                <div className="bg-gray-50 px-4 pb-4">
                  <div className="pt-4 space-y-2">
                    {content.itemName && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{t('itemName')}</p>
                        <p className="text-sm text-gray-900">{content.itemName}</p>
                      </div>
                    )}
                    {content.binCode && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{t('binCode')}</p>
                        <p className="text-sm text-gray-900">{content.binCode}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t('createdAt')}</p>
                      <p className="text-sm text-gray-900">{new Date(content.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t('createdBy')}</p>
                      <p className="text-sm text-gray-900">{content.createdBy?.name}</p>
                    </div>
                  </div>
                </div>
              )}
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
            <Box className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.uniqueItems}</p>
          <p className="text-xs text-gray-500 mt-1">{t('packages.uniqueItems')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">{t('packages.totalItemsInPackage')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalQuantity}</p>
          <p className="text-xs text-gray-500 mt-1">{t('packages.totalQuantity')}</p>
        </Card>
      </div>
    </div>
  );
};