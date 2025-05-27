import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Label, MessageStrip, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useAuth} from "../../components/AppContext";
import {BinLocation, Item, SourceTarget} from "../../Assets/Common";
import BarCodeScanner, {BarCodeScannerRef} from "../../components/BarCodeScanner";
import {addItem, fetchTransferContent, TransferContent} from "./Data/TransferDocument";
import BinLocationScanner from "../../components/BinLocationScanner";
import {delay} from "../../Assets/GlobalConfig";
import {MessageStripDesign} from "@ui5/webcomponents-react";
import ProcessAlert, {ProcessAlertValue} from "../../components/ProcessAlert";
import {ScrollableContent, ScrollableContentBox} from "../../components/ScrollableContent";
import {ReasonType} from "../../Assets/Reasons";
import Processes, {ProcessesRef} from "../../components/Processes";
import {updateLine} from "./Data/TransferProcess";
import {useDateTimeFormat} from "../../Assets/DateFormat";

export default function TransferProcessSource() {
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

  function getTitle(): string {
    if (binLocation == null) {
      return `${t("transfer")} #${scanCode} - ${t("selectTransferSource")}`;
    } else {
      return StringFormat(`${t("selectItemsForTransfers")}`, scanCode);
    }
  }

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
    fetchTransferContent({id, type: SourceTarget.Source, binEntry})
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
    addItem({id, itemCode: item.code, barcode: item.barcode, type: SourceTarget.Source, binEntry: binLocation?.entry})
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
          severity: MessageStripDesign.Information,
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

  return (
    <ContentTheme title={getTitle()}
                        buttons={[{action: () => navigate(`/transfer/${id}/targetBins`), icon: "map"}]}
                        back={() => navigateBack()}>
      {id &&
          <ScrollableContent>
            {user?.binLocations && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
              <ScrollableContentBox borderUp={user?.binLocations ?? false}>
                {currentAlert &&
                    <ProcessAlert alert={currentAlert} onAction={(type) => processesRef?.current?.open(type)}/>}
                {rows != null && rows.length > 0 &&
                    <Table
                        columns={<>
                          <TableColumn><Label>{t('code')}</Label></TableColumn>
                          <TableColumn><Label>{t('description')}</Label></TableColumn>
                          <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                        </>}
                    >
                      {rows.map((row) => (
                        <TableRow key={row.code}>
                          <TableCell><Label>{row.code}</Label></TableCell>
                          <TableCell><Label>{row.name}</Label></TableCell>
                          <TableCell><Label>{row.quantity}</Label></TableCell>
                        </TableRow>
                      ))}
                    </Table>
                }
                {rows != null && rows.length === 0 &&
                    <div style={{padding: '10px'}}>
                        <MessageStrip hideCloseButton design={MessageStripDesign.Information}>
                          {t("nodata")}
                        </MessageStrip>
                    </div>
                }
              </ScrollableContentBox>
            {enable && <BarCodeScanner ref={barcodeRef} onAddItem={handleAddItem} enabled={enable}/>}
          </ScrollableContent>
      }
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
