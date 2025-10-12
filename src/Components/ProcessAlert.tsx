import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {Edit, Edit3, MessageCircle, Package2} from "lucide-react";
import {AddItemResponseMultipleValue, UnitType} from "@/features/shared/data";
import {useAuth} from "@/components/AppContext";
import {ItemCustomFields} from "@/features/items/components/ItemDetailsList";
import {PackageValue} from "@/components/BarCodeScanner";
import {PackageContentDto} from "@/features/packages/types";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import ClickableItemCode from "@/components/ClickableItemCode";
import {useStockInfo} from "@/utils/stock-info";
import {ScannerMode} from "@/features/login/data/login";
import {canEditMetadata, ItemMetadataEditDialog} from "@/features/items/components/ItemMetadataEditDialog";

export type AlertSeverity = "Information" | "Positive" | "Negative" | "Warning";

const mapSeverity = (design?: string): AlertSeverity => {
  switch (design) {
    case "Positive": return "Positive";
    case "Negative": return "Negative";
    case "Warning": return "Warning";
    case "Information":
    default:
      return "Information";
  }
};

export interface ProcessAlertValue {
  lineId?: string,
  barcode?: string | null;
  itemCode?: string | null;
  quantity?: number,
  unit?: UnitType,
  numInBuy?: number | null,
  buyUnitMsr?: string | null,
  purPackUn?: number,
  purPackMsr?: string,
  timeStamp?: string;
  message?: string;
  severity: AlertSeverity;
  comment?: string;
  canceled?: boolean;
  multiple?: AddItemResponseMultipleValue[];
  customFields?: Record<string, unknown>;
  package?: PackageValue | null;
  packageContents?: PackageContentDto[] | null;
}

export interface ProcessAlertProps {
  alert: ProcessAlertValue;
  onAction: (type: AlertActionType) => void;
  enableComment?: boolean;
}

export enum AlertActionType {
  None = -1,
  Comments,
  Cancel,
  Quantity,
}

const ProcessAlert: React.FC<ProcessAlertProps> = ({alert, onAction, enableComment}) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [showPackageContents, setShowPackageContents] = useState(false);
  const stockInfo = useStockInfo();
  const canEditItemMetadata = alert.itemCode && canEditMetadata(user);


  const alertSeverity = mapSeverity(alert.severity);

  const getAlertClasses = () => {
    let baseClasses = "p-4 rounded-md relative";

    let cancelled = alert.canceled ?? false;
    if (cancelled || (alert.multiple != null && alert.multiple.length > 0)) {
      baseClasses += " bg-gray-300 opacity-60"; // Dimmed for cancelled or multiple
    }
    if (cancelled) {
      baseClasses += " line-through";
    }

    switch (alertSeverity) {
      case "Positive": return `${baseClasses} bg-green-100 border-green-400 text-green-700`;
      case "Negative": return `${baseClasses} bg-red-100 border-red-400 text-red-700`;
      case "Warning": return `${baseClasses} bg-yellow-100 border-yellow-400 text-yellow-700`;
      case "Information":
      default:
        return `${baseClasses} bg-blue-100 border-blue-400 text-blue-700`;
    }
  };

  const unitDesc = () => {
    switch (alert.unit) {
      case UnitType.Unit:
        return ' ' + (alert.quantity === 1 ? t('unit') : t('units'));
      case UnitType.Dozen:
        return ' ' + t('buyUnit');
      case UnitType.Pack:
        return ' ' + t('packUnit');
      default:
        return null;
    }
  }

  const formatStock = (content: PackageContentDto) => {
    if (!content.itemData) return `${content.quantity} ${t('units')}`;
    
    const itemData = content.itemData;
    const packages = Math.floor(content.quantity / (itemData.quantityInUnit * itemData.quantityInPack));
    const remainingForDozens = content.quantity % (itemData.quantityInUnit * itemData.quantityInPack);
    const dozens = Math.floor(remainingForDozens / itemData.quantityInUnit);
    const units = remainingForDozens % itemData.quantityInUnit;
    
    const parts = [];
    if (packages > 0) parts.push(`${packages} ${itemData.packMeasure || 'Box'}`);
    if (dozens > 0) parts.push(`${dozens} ${itemData.unitMeasure || 'Doz'}`);
    if (units > 0) parts.push(`${units} ${t('units')}`);
    return parts.join(', ') || '0';
  };

  const hasPackageContents = alert.packageContents && alert.packageContents.length > 0;

  return (
    <div className="relative p-1 rounded-md overflow-hidden">
      <div className={getAlertClasses()}>
        {alert.itemCode && user!.settings.scannerMode === ScannerMode.ItemCode && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mt-1">{t('item')}</div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg text-gray-800">{alert.itemCode}</h4>
              {canEditItemMetadata && (
                <ItemMetadataEditDialog
                  itemCode={alert.itemCode}
                  triggerButton={
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      {t('editMetadata')}
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}
        {alert.barcode && user!.settings.scannerMode === ScannerMode.ItemBarcode && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mt-1">{t('barcode')}</div>
            <h4 className="font-bold text-lg text-gray-800">{alert.barcode}</h4>
          </div>
        )}
        {alert.package && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mt-1">{t('package')}</div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg text-gray-800">{alert.package.barcode}</h4>
              {hasPackageContents && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPackageContents(true)}
                  className="flex items-center gap-1"
                >
                  <Package2 className="w-4 h-4" />
                  {t('viewContents')}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('time')}</div>
              <div className="font-medium">{alert.timeStamp}</div>
            </div>
            
            {alert.itemCode && user!.settings.scannerMode === ScannerMode.ItemBarcode && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t('item')}</div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{alert.itemCode}</div>
                  {canEditItemMetadata && (
                    <ItemMetadataEditDialog
                      itemCode={alert.itemCode}
                      triggerButton={
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {alert.itemCode && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {alert.quantity && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t('quantity')}</div>
                <div className="font-medium">{alert.quantity}{unitDesc()}</div>
              </div>
              )}
              
              {!alert.unit && alert.purPackUn && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{t('packageQuantity')}</div>
                  <div className="font-medium">{alert.quantity! * alert.purPackUn!} {alert.buyUnitMsr}</div>
                </div>
              )}
              
              {alert.unit !== UnitType.Unit && alert.numInBuy && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{t('purchasingUoM')}</div>
                  <div className="font-medium">{alert.numInBuy!} {alert.buyUnitMsr}</div>
                </div>
              )}
              
              {alert.unit === UnitType.Pack && alert.purPackUn && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{t('packagingUoM')}</div>
                  <div className="font-medium">{alert.purPackUn!} {alert.purPackMsr}</div>
                </div>
              )}
            </div>
          )}

          {alert.message && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('message')}</div>
              <div className="text-sm">{alert.message}</div>
            </div>
          )}

          {alert.customFields && <div className="grid grid-cols-2 gap-3">
            <ItemCustomFields
              customFields={alert.customFields}
              render={(field, value, index) => (
                <div key={`custom-${index}`} className="text-sm">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{field.description}</div>
                  <div className="font-medium">{value}</div>
                </div>
              )}
            />
          </div>}
          {alert.multiple != null && alert.multiple.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('messages')}</div>
              <div className="space-y-2">
                {alert.multiple.map((v, index) => (
                  <div key={index} className={`p-3 rounded-md text-sm border-l-4 ${
                    mapSeverity(v.severity) === "Positive" ? "bg-green-50 border-green-400" : 
                    mapSeverity(v.severity) === "Negative" ? "bg-red-50 border-red-400" : 
                    mapSeverity(v.severity) === "Warning" ? "bg-yellow-50 border-yellow-400" : 
                    "bg-blue-50 border-blue-400"
                  }`}>
                    {v.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {!(alert.canceled ?? false) && alertSeverity !== 'Negative' && !alert.packageContents &&
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
                <Edit3 className="h-5 w-5 cursor-pointer hover:text-blue-500" onClick={() => onAction(AlertActionType.Quantity)}/>
              {enableComment &&
                  <MessageCircle className="h-5 w-5 cursor-pointer hover:text-blue-500" onClick={() => onAction(AlertActionType.Comments)}/>
              }
            </div>
        }
      </div>

      {/* Package Contents Dialog */}
      <Dialog open={showPackageContents} onOpenChange={setShowPackageContents}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package2 className="w-5 h-5" />
              {t('packageContents')}
              {alert.package && (
                <span className="text-sm font-mono text-gray-600">
                  {alert.package.barcode}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {alert.packageContents?.map((content, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
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
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{t('quantity')}</p>
                    <p className="font-semibold">
                      {content.itemData ? stockInfo({
                        quantity: content.quantity,
                        numInBuy: content.itemData.quantityInUnit,
                        buyUnitMsr: content.itemData.unitMeasure,
                        purPackUn: content.itemData.quantityInPack,
                        purPackMsr: content.itemData.packMeasure,
                      }) : `${content.quantity} ${t('units')}`}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            
            {(!alert.packageContents || alert.packageContents.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                {t('noPackageContents')}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessAlert;
