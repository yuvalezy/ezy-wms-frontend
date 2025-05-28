import ContentTheme from "../../components/ContentTheme";
import React from "react";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {configUtils} from "@/assets/GlobalConfig";
import ProcessAlert, {AlertActionType} from "../../components/ProcessAlert";
import {ReasonType} from "@/assets/Reasons";
import Processes from "../../components/Processes";
import BarCodeScanner from "../../components/BarCodeScanner";
import {useGoodsReceiptProcessData} from "@/pages/GoodsReceipt/Data/goods-receipt-process-data";

export default function GoodsReceiptProcess() {
  const {t} = useTranslation();
  const {
    title,
    id,
    enable,
    barcodeRef,
    processesRef,
    acceptValues,
    currentAlert,
    handleAddItem,
    alertAction,
    handleAlertActionAccept,
    handleUpdateLine
  } = useGoodsReceiptProcessData();
  return (
    <ContentTheme title={title}>
      {id ? (
        <>
          {enable && (
            // <Form onSubmit={handleSubmit}>
            //     <FormItem label={t("barcode")}>
            //         <Input required
            //                value={barcodeInput}
            //                onInput={(e) => setBarcodeInput(e.target.value as string)}
            //                ref={barcodeRef}
            //                disabled={!enable}
            //         ></Input>
            //     </FormItem>
            //     <FormItem>
            //         <Button type="Submit" icon="accept" disabled={!enable}>
            //             {t("accept")}
            //         </Button>
            //     </FormItem>
            // </Form>
            <BarCodeScanner ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>
          )}
          {acceptValues.map((alert) => (
            <ProcessAlert
              enableComment={true}
              alert={alert}
              key={alert.lineID}
              onAction={(type) => alertAction(alert, type)}
            />
          ))}
          {currentAlert && id &&
              <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.GoodsReceipt}
                         onCancel={(comment, cancel) => handleAlertActionAccept(AlertActionType.Cancel, comment, cancel)}
                         onCommentsChanged={(comment) => handleAlertActionAccept(AlertActionType.Comments, comment)}
                         onQuantityChanged={(quantity) => handleAlertActionAccept(AlertActionType.Quantity, quantity)}
                         supervisorPassword={configUtils.grpoModificationSupervisor}
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
