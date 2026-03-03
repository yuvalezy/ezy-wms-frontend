import React, {useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {toast} from "sonner";
import ContentTheme from "@/components/ContentTheme";
import BinLocationScanner, {BinLocationScannerRef} from "@/components/BinLocationScanner";
import BarCodeScanner, {AddItemValue, BarCodeScannerRef} from "@/components/BarCodeScanner";
import {useAuth, useThemeContext} from "@/components";
import {ProcessingOverlay} from "@/features/transfer/components/processing-overlay";
import {UnitSelector} from "@/components/BarCodeScanner/UnitSelector";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {BinLocation} from "@/features/items/data/items";
import {UnitType} from "@/features/shared/data";
import {directTransferService} from "@/features/direct-transfer/data/direct-transfer-service";
import {ArrowDown, Box, MapPin} from "lucide-react";
import {ObjectType} from "@/features/packages/types";
import {parseQuantity, getQuantityStep} from "@/utils/quantity-utils";

export default function DirectTransfer() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {setError} = useThemeContext();
  const {user, getUnitSettings: getUnitSettingsFn} = useAuth();
  const transferUnitSettings = getUnitSettingsFn("Transfer");
  const {enableUnitSelection: unitSelection, defaultUnitType: defaultUnit} = transferUnitSettings;

  const sourceBinRef = useRef<BinLocationScannerRef>(null);
  const targetBinRef = useRef<BinLocationScannerRef>(null);
  const barcodeRef = useRef<BarCodeScannerRef>(null);

  const [sourceBin, setSourceBin] = useState<BinLocation | null>(null);
  const [targetBin, setTargetBin] = useState<BinLocation | null>(null);
  const [scannedItem, setScannedItem] = useState<AddItemValue | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(defaultUnit);
  const [isExecuting, setIsExecuting] = useState(false);
  const enableDecimals = user?.settings?.enableDecimalQuantities ?? false;

  function reset() {
    setSourceBin(null);
    setTargetBin(null);
    setScannedItem(null);
    setQuantity("1");
    setSelectedUnit(defaultUnit);
  }

  function handleSourceBinScanned(bin: BinLocation) {
    setSourceBin(bin);
  }

  function handleItemScanned(value: AddItemValue) {
    setScannedItem(value);
    setSelectedUnit(value.unit);
  }

  async function handleTargetBinScanned(bin: BinLocation) {
    setTargetBin(bin);
    await executeTransfer(bin);
  }

  async function executeTransfer(target: BinLocation) {
    if (!sourceBin || !scannedItem) return;

    const qty = parseQuantity(quantity, enableDecimals);
    if (qty <= 0) {
      setError(t("quantityIsRequired"));
      return;
    }

    setIsExecuting(true);
    try {
      await directTransferService.execute({
        sourceBinEntry: sourceBin.entry,
        itemCode: scannedItem.item.code,
        targetBinEntry: target.entry,
        quantity: qty,
        unitCode: selectedUnit,
      });
      toast.success(t("directTransferSuccess"));
      reset();
    } catch (error) {
      setError(error);
      setTargetBin(null);
    } finally {
      setIsExecuting(false);
    }
  }

  const step = !sourceBin ? 1 : !scannedItem ? 2 : 3;

  return (
    <ContentTheme title={t("directTransfer")} titleOnClick={() => navigate("/")}>
      {isExecuting && <ProcessingOverlay message={t("directTransferExecuting")}/>}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Progress Summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className={`h-4 w-4 ${sourceBin ? "text-green-600" : "text-muted-foreground"}`}/>
              <span className="font-medium">{t("scanSourceBin")}:</span>
              <span className={sourceBin ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                {sourceBin ? sourceBin.code : "—"}
              </span>
            </div>

            <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground"/>

            <div className="flex items-center gap-2 text-sm">
              <Box className={`h-4 w-4 ${scannedItem ? "text-green-600" : "text-muted-foreground"}`}/>
              <span className="font-medium">{t("scanItemToTransfer")}:</span>
              <span className={scannedItem ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                {scannedItem ? `${scannedItem.item.code} × ${quantity}` : "—"}
              </span>
            </div>

            <ArrowDown className="h-4 w-4 mx-auto text-muted-foreground"/>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className={`h-4 w-4 ${targetBin ? "text-green-600" : "text-muted-foreground"}`}/>
              <span className="font-medium">{t("scanTargetBin")}:</span>
              <span className={targetBin ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                {targetBin ? targetBin.code : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Scan Source Bin */}
        {step === 1 && (
          <Card>
            <CardContent className="p-4">
              <BinLocationScanner
                ref={sourceBinRef}
                label={t("scanSourceBin")}
                onScan={handleSourceBinScanned}
                autofocus
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Scan Item + Quantity */}
        {step === 2 && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <BarCodeScanner
                ref={barcodeRef}
                enabled={true}
                unit={true}
                onAddItem={handleItemScanned}
                binEntry={sourceBin?.entry}
                objectType={ObjectType.Transfer}
              />
            </CardContent>
          </Card>
        )}

        {/* Quantity + Unit override (shown after item scanned, before target bin) */}
        {step === 3 && (
          <>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity-input">{t("quantity")}</Label>
                  <Input
                    id="quantity-input"
                    type="number"
                    min={enableDecimals ? "0.01" : "1"}
                    step={getQuantityStep(enableDecimals)}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <UnitSelector
                  visible={unitSelection}
                  pickPackOnly={false}
                  selectedUnit={selectedUnit}
                  onUnitChange={(v) => setSelectedUnit(v as UnitType)}
                  enableUseBaseUn={transferUnitSettings.enableUseBaseUn}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <BinLocationScanner
                  ref={targetBinRef}
                  label={t("scanTargetBin")}
                  onScan={handleTargetBinScanned}
                  autofocus
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ContentTheme>
  );
}
