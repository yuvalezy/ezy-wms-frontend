import ContentTheme from "../../components/ContentTheme";
import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import ProcessAlert, {AlertActionType} from "../../components/ProcessAlert";
import {ReasonType} from "@/assets/Reasons";
import Processes from "../../components/Processes";
import BarCodeScanner from "../../components/BarCodeScanner";
import {useGoodsReceiptProcessData} from "@/pages/GoodsReceipt/data/goods-receipt-process-data";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components";
import {ObjectType} from "@/features/packages/types";

export default function GoodsReceiptProcess({confirm = false}: { confirm?: boolean }) {
  const {t} = useTranslation();
  const {
    info,
    enable,
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
  } = useGoodsReceiptProcessData(confirm);
  const navigate = useNavigate();
  const {user} = useAuth();

  const title = `${!confirm ? t("goodsReceipt") : t("receiptConfirmation")}`;

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(`/goodsReceipt${confirm ? 'Confirmation' : ''}`)}
                  titleBreadcrumbs={[{label: info?.number?.toString() || ''}]}
                  footer={enable && (
                    <BarCodeScanner
                      ref={barcodeRef}
                      enabled
                      unit
                      enablePackage={user!.settings!.enablePackages}
                      currentPackage={currentPackage}
                      objectType={ObjectType.GoodsReceipt}
                      objectId={info?.id}
                      objectNumber={info?.number}
                      onAddItem={handleAddItem}
                      onPackageChanged={setCurrentPackage}
                    />
                  )}
    >
      {info ? (
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
