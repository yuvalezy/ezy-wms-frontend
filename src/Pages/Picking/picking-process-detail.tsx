import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router-dom";
import React from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components";
import {useTranslation} from "react-i18next";
import {useObjectName} from "@/assets";
import BarCodeScanner from "@/components/BarCodeScanner";
import PickingProcessDetailContent from "@/pages/picking/components/picking-process-detail-content";
import BinLocationScanner from "@/components/BinLocationScanner";
import {usePickingProcessDetailData} from "@/pages/picking/data/picking-process-detail-data";
import {AlertCircle} from "lucide-react";

export default function PickingProcessDetail() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const o = useObjectName();
  const {
    idParam,
    type,
    enable,
    detail,
    barcodeRef,
    binLocationRef,
    binLocation,
    onBinChanged,
    onBinClear,
    handleAddItem,
  } = usePickingProcessDetailData();
  const titleBreadcrumbs = [
    {label: `${idParam}`, onClick: () => navigate(`/pick/${idParam}`)},
    {label: o(type) + (detail ? `# ${detail?.number}` : ''), onClick: binLocation ? () => onBinClear() : undefined}
  ];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }
  return (
    <ContentTheme title={t("picking")}
                  titleOnClick={() => navigate("/pick")}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={detail && <>
                    {detail.totalOpenItems > 0 && binLocation &&
                        <BarCodeScanner ref={barcodeRef}
                                        unit
                                        onAddItem={(item, unit) => handleAddItem(item.code, item.barcode ?? "", unit)}
                                        enabled={enable}/>}
                    {!binLocation && detail.totalOpenItems > 0 &&
                        <div className="space-y-4 p-2">
                            <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>
                        </div>
                    }
                  </>
                  }
    >
      {detail &&
          <div className="space-y-4">
              <Alert variant={detail.totalOpenItems > 0 ? "default" : "information"}>
                  <AlertCircle/>
                  <AlertTitle>
                    {t("customer")}:
                  </AlertTitle>
                  <AlertDescription>
                    {detail.cardCode} - {detail.cardName}
                  </AlertDescription>
                {detail.totalOpenItems === 0 && <AlertDescription>
                  {t("pickingCompletedFor", {type: o(type), number: detail.number})}:
                </AlertDescription>}
              </Alert>
              <PickingProcessDetailContent items={detail.items}/>
            {/*<BoxConfirmationDialog*/}
            {/*    onSelected={(itemCode: string) => handleAddItem(itemCode, barcodeRef?.current?.getValue() ?? "")}*/}
            {/*    ref={boxConfirmationDialogRef}*/}
            {/*    itemCode={boxItem}*/}
            {/*    items={boxItems}*/}
            {/*/>*/}
          </div>
      }
    </ContentTheme>
  );
}
