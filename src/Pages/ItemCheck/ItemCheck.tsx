import ContentTheme from "../../components/ContentTheme";
import React, {useEffect, useRef} from "react";
import {
  itemCheck,
  ItemCheckResponse,
  updateItemBarCode,
} from "./Item";
import ItemCheckMultipleResult from "./ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheckResult";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {useItemCheckData} from "@/Pages/ItemCheck/item-check-data";

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

  return (
    <ContentTheme title={t("itemCheck")}>
      {(result == null || result.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("itemCheck")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button onClick={() => handleCheckSubmit()} className="w-full">
              <FontAwesomeIcon icon={faCheck} className="mr-2"/>
              {t("accept")}
            </Button>
          </CardContent>
        </Card>
      )}
      {result && (
        <div className="space-y-4">
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
        </div>
      )}
    </ContentTheme>
  );
}
