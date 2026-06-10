import React from "react";
import {useTranslation} from "react-i18next";
import {Edit, Edit3, MessageCircle} from "lucide-react";
import {AddItemResponseMultipleValue, UnitType} from "@/features/shared/data";
import {useAuth} from "@/components/AppContext";
import {ItemCustomFields} from "@/features/items/components/ItemDetailsList";
import {Button} from "@/components/ui/button";
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

  let settings = user!.settings!;

  const unitDesc = () => {
    switch (alert.unit) {
      case UnitType.Unit:
        return ' ' + (alert.quantity === 1 ? t("inventory.units.unit.label") : t("inventory.units.unit.multiple"));
      case UnitType.Dozen:
        return ' ' + (settings.dozensLabel ?? t("inventory.units.dozen.label"));
      case UnitType.Pack:
        return ' ' + (settings.boxLabel ?? t("inventory.units.box.label"));
      default:
        return null;
    }
  }

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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('time')}</div>
              <div className="font-medium">{alert.timeStamp}</div>
            </div>
            
            {alert.itemCode && user!.settings.scannerMode === ScannerMode.ItemBarcode && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t('item')}</div>
                <div className="font-medium">{alert.itemCode}</div>
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

        {/* Action Buttons */}
        {(!(alert.canceled ?? false) && alertSeverity !== 'Negative') || (canEditItemMetadata && user!.settings.scannerMode === ScannerMode.ItemBarcode) ? (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row gap-2">
            {!(alert.canceled ?? false) && alertSeverity !== 'Negative' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onAction(AlertActionType.Quantity)}
                  className="flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{t('editQuantity')}</span>
                </Button>

                {enableComment && (
                  <Button
                    variant="outline"
                    onClick={() => onAction(AlertActionType.Comments)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{t('addComment')}</span>
                  </Button>
                )}
              </>
            )}

            {canEditItemMetadata && user!.settings.scannerMode === ScannerMode.ItemBarcode && alert.itemCode && (
              <ItemMetadataEditDialog
                itemCode={alert.itemCode}
                triggerButton={
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 w-full md:w-auto"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{t('editMetadata')}</span>
                  </Button>
                }
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProcessAlert;
