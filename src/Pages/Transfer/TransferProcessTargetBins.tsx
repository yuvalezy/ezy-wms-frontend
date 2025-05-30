import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  useThemeContext
} from "@/components";
import {useTranslation} from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Progress} from "@/components/ui/progress";
import {IsNumeric, StringFormat} from "@/assets";
import {useAuth} from "@/components";
import {BinLocation, Item, SourceTarget} from "@/assets";
import BarCodeScanner, {BarCodeScannerRef} from "../../components/BarCodeScanner";
import {addItem, fetchTransferContent, TransferContent} from "./Data/TransferDocument";
import BinLocationScanner from "../../components/BinLocationScanner";
import {delay} from "@/assets";
import ProcessAlert, {ProcessAlertValue} from "../../components/ProcessAlert";
import {ScrollableContent, ScrollableContentBox} from "@/components";
import {ReasonType} from "@/assets";
import Processes, {ProcessesRef} from "../../components/Processes";
import {updateLine} from "./Data/TransferProcess";
import {useDateTimeFormat} from "@/assets";

export default function TransferProcessTargetBins() {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const [id, setID] = useState<number | null>();
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
  const [enable, setEnable] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const [rows, setRows] = useState<TransferContent[] | null>(null);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);
  const navigate = useNavigate();
  const processAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEnable(!user?.binLocations);
    if (enable) {
      setTimeout(() => barcodeRef.current?.focus(), 1);
    }
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));
  }, []);

  useEffect(() => {
    if (!id)
      return;
    const params = new URLSearchParams(window.location.search);
    const binParam = params.get('bin');
    if (binParam) {
      try {
        const bin = JSON.parse(binParam);
        onBinChanged(bin);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        setError(e);
      }
    }
  }, [id]);

  function onBinChanged(bin: BinLocation) {
    try {
      setBinLocation(bin);
      setEnable(true);
      loadRows(bin.entry);
      delay(1).then(() => barcodeRef?.current?.focus());
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  function onBinClear() {
    setBinLocation(null);
    setRows(null);
    setEnable(false);
    setCurrentAlert(null);
  }


  function loadRows(binEntry?: number) {
    if (id == null) {
      return;
    }
    binEntry ??= binLocation?.entry;
    setLoading(true);
    fetchTransferContent({id, type: SourceTarget.Target, binEntry, targetBinQuantity: true})
      .then((v) => setRows(v))
      .catch((e) => {
        setError(e);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }

  function handleAddItem(item: Item) {
    if (id == null) {
      return;
    }
    addItem({id, itemCode: item.code, barcode: item.barcode, type: SourceTarget.Target, binEntry: binLocation?.entry})
      .then((v) => {
        if (v.errorMessage != null) {
          setError(v.errorMessage);
          return;
        }
        let date = new Date(Date.now());
        setCurrentAlert({
          lineID: v.lineID,
          quantity: 1,
          barcode: item.barcode,
          itemCode: item.code,
          severity: "Information",
          timeStamp: dateTimeFormat(date)
        })
        barcodeRef?.current?.clear();
        loadRows();
        barcodeRef?.current?.focus();
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => setLoading(false));
    return;
  }

  function handleQuantityChanged(quantity: number) {
    if (currentAlert == null)
      return;
    acceptAlertChanged({
      ...currentAlert,
      quantity: quantity,
    });
  }

  function handleCancel(comment: string, cancel: boolean) {
    if (currentAlert == null)
      return;
    acceptAlertChanged({
      ...currentAlert,
      comment: comment,
      canceled: cancel,
    });
  }

  function acceptAlertChanged(newAlert: ProcessAlertValue): void {
    setCurrentAlert(newAlert);
    loadRows();
  }

  function navigateBack() {
    navigate(`/transfer/${id}`);
  }

  if (!id)
    return null;

  const titleBreadcrumbs = [
    {label: scanCode ?? '', onClick: () => navigate(`/transfer/${scanCode}`)},
    {label: t("selectTransferTargetBins"), onClick: binLocation ? onBinClear : undefined}
  ];
  if (binLocation) {
    titleBreadcrumbs.push({label: binLocation.code, onClick: undefined});
  }

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={titleBreadcrumbs}
                  footer={binLocation &&
                      <BarCodeScanner unit ref={barcodeRef} onAddItem={handleAddItem} enabled={enable}/>}
    >
      {user?.binLocations && !binLocation && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
      <div className="contentStyle">
        {currentAlert &&
            <div ref={processAlertRef}><ProcessAlert alert={currentAlert}
                                                     onAction={(type) => processesRef?.current?.open(type)}/></div>}
        {rows != null && rows.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Label>{t('code')}</Label></TableHead>
                    <TableHead><Label>{t('description')}</Label></TableHead>
                    <TableHead className="text-right"><Label>{t('openQuantity')}</Label></TableHead>
                    <TableHead className="text-right"><Label>{t('binQuantity')}</Label></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <React.Fragment key={row.code}>
                      <TableRow>
                        <TableCell><Label>{row.code}</Label></TableCell>
                        <TableCell><Label>{row.name}</Label></TableCell>
                        <TableCell className="text-right"><Label>{row.openQuantity}</Label></TableCell>
                        <TableCell className="text-right"><Label>{row.binQuantity}</Label></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="p-1">
                          <Progress value={row.progress ?? 0} className="w-full h-2"/>
                          <p className="text-xs text-muted-foreground text-center">{`${row.progress ?? 0}%`}</p>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {rows != null && rows.length === 0 &&
            <div className="p-4">
                <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-700">
                  {/* <AlertTitle>Information</AlertTitle> */}
                    <AlertDescription>{t("nodata")}</AlertDescription>
                </Alert>
            </div>
        }
      </div>
      {currentAlert && id && <Processes
          ref={processesRef}
          id={id}
          alert={currentAlert}
          reasonType={ReasonType.Transfer}
          onCancel={handleCancel}
          onQuantityChanged={handleQuantityChanged}
          onUpdateLine={updateLine}
          onUpdateComplete={loadRows}
      />}
    </ContentTheme>
  );
}
