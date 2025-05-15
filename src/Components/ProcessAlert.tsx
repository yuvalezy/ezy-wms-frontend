import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {Icon, MessageStrip, Title} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {useSwipeable} from "react-swipeable";

import {AddItemResponseMultipleValue, UnitType} from "../Assets/Common";

export interface ProcessAlertValue {
  lineID?: number,
  barcode?: string | null;
  itemCode?: string | null;
  quantity?: number,
  unit?: UnitType,
  packUnit?: number,
  packUnitMsr?: string,
  buyUnit?: number | null,
  buyUnitMsr?: string | null,
  timeStamp?: string;
  message?: string;
  severity: MessageStripDesign;
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
  const getAlertStyle = () => {
    const style: React.CSSProperties = {
      position: 'relative',
      transition: 'transform 0.2s',
      transform: swiped ? 'translateX(-100px)' : 'translateX(0)',
    };

    let cancelled = alert.canceled ?? false;
    if (cancelled || (alert.multiple != null && alert.multiple.length > 0)) {
      style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    }
    if (cancelled) {
      style.textDecoration = 'line-through';
    }

    return style;
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
    <div style={{position: 'relative', padding: '5px', borderRadius: '5px', overflow: 'hidden'}} {...handlers}>
      {/* Red background for swipe */}
      {swiped && (
        <div style={{
          background: 'red',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          transition: 'opacity 0.2s',
          opacity: 0.7
        }}/>
      )}
      <div style={{position: 'relative', zIndex: 1}}>
        <MessageStrip hideCloseButton design={alert.severity} style={getAlertStyle()}>
          {alert.barcode && <Title level="H4"><strong>{t('barcode')}: </strong>{alert.barcode}</Title>}
          <strong>{t('time')}: </strong>{alert.timeStamp} <br/>
          {alert.itemCode && <>
              <span><strong>{t('item')}: </strong>{alert.itemCode}</span>
              <br/>
              <span><strong>{t('quantity')}: </strong>{alert.quantity}{unitDesc()}</span>
              <br/>
            {!alert.unit && alert.packUnit &&
                <>
                    <span><strong>{t('packageQuantity')}: </strong>{alert.quantity! * alert.packUnit!} {alert.buyUnitMsr}</span>
                    <br/>
                </>
            }
            {alert.unit !== UnitType.Unit && alert.buyUnit &&
              <>
                  <span><strong>{t('dozenQuantity')}: </strong>{alert.quantity! * alert.buyUnit!} {alert.buyUnitMsr}</span>
                  <br/>
              </>
            }
            {alert.unit === UnitType.Pack && alert.packUnit &&
              <>
                  <span><strong>{t('packageQuantity')}: </strong>{alert.quantity! * alert.packUnit!} {alert.packUnitMsr}</span>
                  <br/>
              </>
            }
          </>}
          {alert.message && (<><strong>{t('message')}: </strong>{alert.message}</>)}
          {alert.multiple != null && alert.multiple.length > 0 && (<><br/><strong>{t('messages')}: </strong>{
            <>
              {
                alert.multiple.map(v => <MessageStrip hideCloseButton design={v.severity}>{v.message}</MessageStrip>)
              }
            </>
          }</>)}
          {!(alert.canceled ?? false) && alert.severity !== 'Negative' && !swiped &&
              <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                  <Icon name="numbered-text" onClick={() => onAction(AlertActionType.Quantity)}/>
                {enableComment &&
                    <>
                        <br/>
                        <Icon name="comment" onClick={() => onAction(AlertActionType.Comments)}/>
                    </>
                }
              </div>
          }
        </MessageStrip>
      </div>
    </div>
  );
};

export default ProcessAlert;
