import ContentTheme from "../../components/ContentTheme";
import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import ProcessAlert, {AlertActionType} from "../../components/ProcessAlert";
import {ReasonType} from "@/features/shared/data/reasons";
import Processes from "../../components/Processes";
import BarCodeScanner from "../../components/BarCodeScanner";
import {useGoodsReceiptProcessData} from "@/features/goods-receipt/hooks/useGoodsReceiptProcessData";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components";
import {ObjectType} from "@/features/packages/types";
import {ProcessType} from "@/features/shared/data";
import {Skeleton} from "@/components/ui/skeleton";

export default function GoodsReceiptProcess({processType = ProcessType.Regular}: { processType?: ProcessType }) {
  const {t} = useTranslation();
  const {
    info,
    enable,
    isLoading,
    barcodeRef,
    processesRef,
    acceptValues,
    currentAlert,
    handleAddItem,
    alertAction,
    handleAlertActionAccept,
    handleUpdateLine,
    currentPackage,
    setCurrentPackage,
  } = useGoodsReceiptProcessData(processType);
  const navigate = useNavigate();
  const {user} = useAuth();

  const getTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t('receiptConfirmation');
      case ProcessType.TransferConfirmation:
        return t('transferConfirmation');
      default:
        return t("goodsReceipt");
    }
  };

  const title = getTitle();

  const getNavigationPath = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return '/goodsReceiptConfirmation';
      case ProcessType.TransferConfirmation:
        return '/transferConfirmation';
      default:
        return '/goodsReceipt';
    }
  };

  const ProcessSkeleton = () => (
    <div className="space-y-4" aria-label="Loading...">
      {/* Document Info Skeleton */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Process Alerts Skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      ))}

      {/* Process Controls Skeleton */}
      <div className="p-4 border rounded-lg">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(getNavigationPath())}
                  titleBreadcrumbs={[{label: info?.number?.toString() || ''}]}
                  footer={enable && !isLoading && (
                    <BarCodeScanner
                      ref={barcodeRef}
                      enabled
                      unit
                      enablePackage={user!.settings!.enablePackages && user!.settings!.goodsReceiptPackages}
                      currentPackage={currentPackage}
                      objectType={ObjectType.GoodsReceipt}
                      objectId={info?.id}
                      objectNumber={info?.number}
                      onAddItem={handleAddItem}
                      onPackageChanged={setCurrentPackage}
                    />
                  )}
    >
      {isLoading ? (
        <ProcessSkeleton />
      ) : info ? (
        <>
          {acceptValues.map((alert) => (
            <ProcessAlert
              enableComment={true}
              alert={alert}
              key={alert.lineId}
              onAction={(type) => alertAction(alert, type)}
            />
          ))}
          {currentAlert &&
              <Processes ref={processesRef} id={info.id} alert={currentAlert} reasonType={ReasonType.GoodsReceipt}
                         onCancel={(comment, cancel) => handleAlertActionAccept(AlertActionType.Cancel, comment, cancel)}
                         onCommentsChanged={(comment) => handleAlertActionAccept(AlertActionType.Comments, comment)}
                         onQuantityChanged={(quantity) => handleAlertActionAccept(AlertActionType.Quantity, quantity)}
                         supervisorPassword={user!.settings!.goodsReceiptModificationSupervisor}
                         onUpdateLine={handleUpdateLine}/>}
          {/*<BoxConfirmationDialog*/}
          {/*  onSelected={(v: string) => addItemToDocument(v)}*/}
          {/*  ref={boxConfirmationDialogRef}*/}
          {/*  itemCode={boxItem}*/}
          {/*  items={boxItems}*/}
          {/*/>*/}
        </>
      ) : (
        <Alert variant="destructive" className="mt-4">
          {/* <AlertTitle>{t("error")}</AlertTitle> */}
          <AlertDescription>{t("invalidScanCode")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
