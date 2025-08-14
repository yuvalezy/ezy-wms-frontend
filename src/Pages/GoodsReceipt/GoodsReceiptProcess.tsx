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
import {ProcessSkeleton} from "@/features/goods-receipt/components/ProcessSkeleton";
import {Loader2} from "lucide-react";

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
    isProcessing,
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
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('processingItem')}</p>
          </div>
        </div>
      )}
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
