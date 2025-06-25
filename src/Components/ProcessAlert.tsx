import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useSwipeable} from "react-swipeable";
import { Edit3, MessageCircle } from "lucide-react";
import {AddItemResponseMultipleValue, UnitType} from "@/assets";
import {useAuth} from "@/components/AppContext";
import {ItemCustomFields} from "@/pages/item-check/components/item-details-list";

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
  const [swiped, setSwiped] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwiped(true);
      setTimeout(() => {
        onAction(AlertActionType.Cancel);
        setSwiped(false);
      }, 200); // Show red background briefly
    },
    trackMouse: true
  });

  const alertSeverity = mapSeverity(alert.severity);

  const getAlertClasses = () => {
    let baseClasses = "p-4 rounded-md relative transition-transform duration-200";
    if (swiped) baseClasses += " transform -translate-x-24";

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


  const units = [
    {text: t("unit"), value: UnitType.Unit},
    {text: t("dozen"), value: UnitType.Dozen},
    {text: t("box"), value: UnitType.Pack}
  ];

  const unitDesc = () => {
    switch (alert.unit) {
      case UnitType.Unit:
        return ' ' + (alert.quantity === 1 ? t('unit') : t('units'));
      case UnitType.Dozen:
        return ' ' + (alert.quantity === 1 ? t('dozen') : t('dozens'));
      case UnitType.Pack:
        return ' ' + (alert.quantity === 1 ? t('box') : t('boxes'));
      default:
        return null;
    }
  }

  return (
    <div className="relative p-1 rounded-md overflow-hidden" {...handlers}>
      {swiped && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-red-500 opacity-70 transition-opacity duration-200 z-0"/>
      )}
      <div className={`relative z-10 ${getAlertClasses()}`}>
        {alert.barcode && (
          <div className="mb-3">
            <h4 className="font-bold text-lg text-gray-800">{alert.barcode}</h4>
            <div className="text-xs text-gray-500 mt-1">{t('barcode')}</div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('time')}</div>
              <div className="font-medium">{alert.timeStamp}</div>
            </div>
            
            {alert.itemCode && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t('item')}</div>
                <div className="font-medium">{alert.itemCode}</div>
              </div>
            )}
          </div>

          {alert.itemCode && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{t('quantity')}</div>
                <div className="font-medium">{alert.quantity}{unitDesc()}</div>
              </div>
              
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

          {user?.settings?.goodsReceiptTargetDocuments && alert.message && (
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
        {!(alert.canceled ?? false) && alertSeverity !== 'Negative' && !swiped &&
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
                <Edit3 className="h-5 w-5 cursor-pointer hover:text-blue-500" onClick={() => onAction(AlertActionType.Quantity)}/>
              {enableComment &&
                  <MessageCircle className="h-5 w-5 cursor-pointer hover:text-blue-500" onClick={() => onAction(AlertActionType.Comments)}/>
              }
            </div>
        }
      </div>
    </div>
  );
};

export default ProcessAlert;
