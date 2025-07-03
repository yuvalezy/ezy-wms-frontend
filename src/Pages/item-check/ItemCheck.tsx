import ContentTheme from "../../components/ContentTheme";
import React from "react";
import ItemCheckMultipleResult from "./ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheckResult";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {useItemCheckData} from "@/pages/item-check/item-check-data";

export default function ItemCheck() {
  const {t} = useTranslation();

  const {
    barcodeInput,
    setBarcodeInput,
    itemCodeInput,
    setItemCodeInput,
    result,
    barcodeInputRef,
    handleCheckSubmit,
    handleUpdateSubmit,
    handleSetBarcodeItem,
    handleClear
  } = useItemCheckData();

  const hasData = result && result.length > 0;
  return (
    <ContentTheme title={t("itemCheck")}
                  titleOnClick={hasData ? () => handleClear() : undefined}
                  titleBreadcrumbs={hasData ? [{label: result[0].itemCode}] : undefined}>
      {!hasData ? (
        <>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCheckSubmit();
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="barcode">{t("barcode")}</Label>
                <Input
                  id="barcode"
                  required={itemCodeInput.length === 0}
                  disabled={itemCodeInput.length > 0}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  ref={barcodeInputRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t("code")}</Label>
                <Input
                  id="code"
                  required={barcodeInput.length === 0}
                  disabled={barcodeInput.length > 0}
                  value={itemCodeInput}
                  onChange={(e) => setItemCodeInput(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full md:w-auto">
                  <FontAwesomeIcon icon={faCheck} className="mr-2"/>
                  {t("accept")}
                </Button>
              </div>
            </div>
          </form>
        </>
      ) : (
        <>
          {result.length === 0 && (
            <Alert className="border-red-200 bg-red-50">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600"/>
              <AlertDescription>
                {t("noDataFound")}
              </AlertDescription>
            </Alert>
          )}
          {result.length === 1 && (
            <ItemCheckResult
              result={result[0]}
              submit={handleUpdateSubmit}
              onClear={handleClear}
            />
          )}
          {result.length > 1 && (
            <ItemCheckMultipleResult
              barcode={barcodeInput}
              result={result}
              clear={handleClear}
              setBarcodeItem={handleSetBarcodeItem}
            />
          )}
        </>
      )}
    </ContentTheme>
  );
}
