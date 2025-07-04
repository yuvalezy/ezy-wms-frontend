import ContentTheme from "../../components/ContentTheme";
import React from "react";
import ItemCheckMultipleResult from "./ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheckResult";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Check, AlertTriangle} from 'lucide-react';
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
          <div className="flex justify-center">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCheckSubmit();
            }} className="w-full max-w-md">
              <div className="space-y-4">
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
                <div>
                  <Button className="w-full">
                    <Check className="h-4 w-4 mr-2"/>
                    {t("accept")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          {result.length === 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600"/>
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
