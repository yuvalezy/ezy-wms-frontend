import ContentTheme from "../../components/ContentTheme";
import React, {useEffect} from "react";
import ItemCheckMultipleResult from "../../features/items/components/ItemCheckMultipleResult";
import ItemCheckResult from "../../features/items/components/ItemCheckResult";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, Check} from 'lucide-react';
import {useItemCheckData} from "@/features/items/hooks/useItemCheckData";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "@/components";
import {ScannerMode} from "@/features/login/data/login";

export default function ItemCheck() {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {code} = useParams();
  const navigate = useNavigate();

  const {
    barcodeInput,
    setBarcodeInput,
    itemCodeInput,
    setItemCodeInput,
    result,
    barcodeInputRef,
    codeInputRef,
    handleUpdateSubmit,
    handleSetBarcodeItem,
    handleClear,
    handleCheckSubmit
  } = useItemCheckData();

  useEffect(() => {
    if (code && !result) {
      handleCheckSubmit();
    }
  }, [code, result]);

  const handleClearAndNavigate = () => {
    handleClear();
    navigate('/itemCheck');
  };

  const handleSubmitAndNavigate = () => {
    const inputValue = barcodeInput.trim() || itemCodeInput.trim();
    if (inputValue) {
      navigate(`/itemCheck/${encodeURIComponent(inputValue)}`);
    }
  };

  const hasData = result && result.length > 0;
  return (
    <ContentTheme title={t("itemCheck")}
                  titleOnClick={hasData ? handleClearAndNavigate : undefined}
                  titleBreadcrumbs={hasData ? [{label: result[0].itemCode}] : undefined}>
      {!hasData ? (
        <>
          <div className="flex justify-center px-3 pt-3 md:px-0 md:pt-0">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAndNavigate();
            }} className="w-full max-w-md">
              <div className="space-y-4">
                {user!.settings.scannerMode === ScannerMode.ItemBarcode && (
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
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">{t("code")}</Label>
                  <Input
                    id="code"
                    required={barcodeInput.length === 0}
                    disabled={barcodeInput.length > 0}
                    value={itemCodeInput}
                    onChange={(e) => setItemCodeInput(e.target.value)}
                    ref={codeInputRef}
                  />
                </div>
                {user!.settings.scannerMode === ScannerMode.ItemCode && (
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
                )}
                <div>
                  <Button disabled={!barcodeInput.trim() && !itemCodeInput.trim()} className="w-full">
                    <Check className="h-4 w-4 mr-2"/>
                    {t("accept")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="px-3 pt-3 md:px-0 md:pt-0">
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
        </div>
      )}
    </ContentTheme>
  );
}
