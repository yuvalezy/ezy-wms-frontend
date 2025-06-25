import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {useSwipeable} from "react-swipeable";
import { Edit3, MessageCircle } from "lucide-react";
import {AddItemResponseMultipleValue, UnitType} from "@/assets";

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
        {alert.barcode && <h4 className="font-bold text-lg mb-1"><strong>{t('barcode')}: </strong>{alert.barcode}</h4>}
        <div className="text-sm">
          <strong>{t('time')}: </strong>{alert.timeStamp} <br/>
          {alert.itemCode && <>
              <span><strong>{t('item')}: </strong>{alert.itemCode}</span>
              <br/>
              <span><strong>{t('quantity')}: </strong>{alert.quantity}{unitDesc()}</span>
              <br/>
            {!alert.unit && alert.purPackUn &&
                <>
                    <span><strong>{t('packageQuantity')}: </strong>{alert.quantity! * alert.purPackUn!} {alert.buyUnitMsr}</span>
                    <br/>
                </>
            }
            {alert.unit !== UnitType.Unit && alert.numInBuy &&
              <>
                  <span><strong>{t('dozenUnit')}: </strong>{alert.numInBuy!} {alert.buyUnitMsr}</span>
                  <br/>
              </>
            }
            {alert.unit === UnitType.Pack && alert.purPackUn &&
              <>
                  <span><strong>{t('packageUnit')}: </strong>{alert.purPackUn!} {alert.purPackMsr}</span>
                  <br/>
              </>
            }
          </>}
          {alert.message && (<><strong>{t('message')}: </strong>{alert.message}</>)}
          {alert.multiple != null && alert.multiple.length > 0 && (
            <div className="mt-2">
              <strong>{t('messages')}: </strong>
              {alert.multiple.map((v, index) => (
                <div key={index} className={`p-2 my-1 rounded-sm text-xs ${mapSeverity(v.severity) === "Positive" ? "bg-green-50" : mapSeverity(v.severity) === "Negative" ? "bg-red-50" : mapSeverity(v.severity) === "Warning" ? "bg-yellow-50" : "bg-blue-50"}`}>
                  {v.message}
                </div>
              ))}
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
