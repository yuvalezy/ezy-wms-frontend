import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router-dom";
import React from "react";
import {Alert, AlertDescription, AlertTitle, PackageValue, useAuth} from "@/components";
import {useTranslation} from "react-i18next";
import BarCodeScanner from "@/components/BarCodeScanner";
import PickingProcessDetailContent from "@/features/picking/components/picking-process-detail-content";
import BinLocationScanner from "@/components/BinLocationScanner";
import {usePickingProcessDetailData} from "@/features/picking/hooks/usePickingProcessDetailData";
import {AlertCircle} from "lucide-react";
import {useObjectName} from "@/hooks/useObjectName";

export default function PickingProcessDetail() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const o = useObjectName();
  const {user} = useAuth();
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
    handleAddPackage,
    pickPackOnly,
    currentPackage,
    pickingPackage,
    setPickingPackage,
    handleCreatePackage,
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
                    {detail.totalOpenItems > 0 && (binLocation || !user?.binLocations) &&
                        <BarCodeScanner ref={barcodeRef}
                                        unit
                                        enablePackage={user!.settings!.enablePackages}
                                        enablePackageCreate={false}
                                        currentPackage={currentPackage}
                                        pickPackOnly={pickPackOnly}
                                        onAddItem={(value) => handleAddItem(value, t)}
                                        onAddPackage={handleAddPackage}
                                        enabled={enable}/>}
                    {!binLocation && detail.totalOpenItems > 0 && user?.binLocations &&
                        <div className="space-y-4 p-2">
                            <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}
                                                enablePackageCreate={user!.settings!.enablePackages}
                                                onCreatePackageClicked={handleCreatePackage}
                            />
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
            {pickingPackage && <div
                className="bg-blue-100 border-l-4 border-blue-500 p-3 mb-4 rounded flex items-center justify-between">
                <div>
                    <span className="font-semibold text-blue-800">{t('newPackage')}: </span>
                    <span className="font-bold text-blue-900">{pickingPackage.barcode}</span>
                </div>
                <button
                    type="button"
                    onClick={() => setPickingPackage(null)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  {t('clearPackage')}
                </button>
            </div>}
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
