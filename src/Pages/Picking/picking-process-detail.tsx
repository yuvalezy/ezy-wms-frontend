import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../components/BoxConfirmationDialog";
import {Alert, AlertDescription, AlertTitle, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BinLocation, Item} from "@/assets";
import {IsNumeric, StringFormat} from "@/assets";
import {addItem, fetchPicking, PickingDocument, PickingDocumentDetail} from "@/pages/picking/data/picking-document";
import {useObjectName} from "@/assets";
import BarCodeScanner, {BarCodeScannerRef} from "../../components/BarCodeScanner";
import PickingProcessDetailContent from "@/pages/picking/components/picking-process-detail-content";
import BinLocationScanner, {BinLocationScannerRef} from "../../components/BinLocationScanner";
import {toast} from "sonner";
import {AlertCircle} from "lucide-react";

export default function PickingProcessDetail() {
  const {idParam, typeParam, entryParam} = useParams();
  const [id, setID] = useState<number | null>();
  const [type, setType] = useState<number | null>();
  const [entry, setEntry] = useState<number | null>();
  const {t} = useTranslation();
  const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
  const [enable, setEnable] = useState(true);
  const {setLoading, setError} = useThemeContext();
  const [boxItem, setBoxItem] = useState("");
  const [boxItems, setBoxItems] = useState<Item[]>();
  const [, setPicking] = useState<PickingDocument | null>(null);
  const [detail, setDetail] = useState<PickingDocumentDetail | null>(null);
  const o = useObjectName();
  const navigate = useNavigate();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const binLocationRef = useRef<BinLocationScannerRef>(null);
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);


  useEffect(() => {
    [idParam, typeParam, entryParam].forEach((p, index) => {
      if (p === null || p === undefined || !IsNumeric(p)) {
        return;
      }
      let value = parseInt(p);
      switch (index) {
        case 0:
          setID(value);
          break;
        case 1:
          setType(value);
          break;
        case 2:
          setEntry(value);
          break;
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [id, type, entry]);

  function onBinChanged(bin: BinLocation) {
    setBinLocation(bin);
    loadData({binEntry: bin.entry});
  }

  function onBinClear() {
    setBinLocation(null);
    loadData();
  }

  interface loadDataParameters {
    reload?: boolean
    binEntry?: number;
  }

  function loadData(params?: loadDataParameters) {
    if (!id || !type || !entry) {
      return;
    }

    fetchPicking({id, type, entry, availableBins: true, binLocation: params?.binEntry})
      .then(value => {
        if (value == null) {
          setPicking(null);
          setError(t("pickingNotFound"))
          return;
        }
        if (value.detail != null) {
          let valueDetail = value.detail[0];
          setDetail(valueDetail);
          if (params?.binEntry != null && valueDetail.items?.length === 0) {
            binLocationRef?.current?.clear();
            return;
          }
          if (params?.reload && valueDetail.totalOpenItems === 0) {
            navigateBack();
            return;
          }
          if (params?.binEntry != null) {
            setTimeout(() => barcodeRef.current?.focus(), 1);
          } else {
            setTimeout(() => binLocationRef.current?.focus(), 1);
          }
        }
        setPicking(value);
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }


  function handleAddItem(itemCode: string, barcode: string) {
    boxConfirmationDialogRef?.current?.show(false);
    barcodeRef?.current?.clear();
    if (id == null || type == null || entry == null || binLocation == null) {
      return;
    }
    setLoading(true);
    addItem({id, type, entry, itemCode, quantity: 1, binEntry: binLocation.entry})
      .then((data) => {
        if (data.closedDocument) {
          setError(StringFormat(t("pickedIsClosed"), id));
          setEnable(false);
          return;
        }

        toast.success(StringFormat(t("pickingProcessSuccess"), barcode));
        loadData({reload: true, binEntry: binLocation.entry});
      })
      .catch((error) => {
        console.error(`Error performing action: ${error}`);
        let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
        setError(errorMessage);
        setLoading(false);
        setTimeout(() => barcodeRef.current?.focus(), 100);
      });
  }

  function navigateBack() {
    navigate(`/pick/${id}`);
  }

  return (
    <ContentTheme title={t("picking")}
                  titleOnClick={() => navigate("/pick")}
                  titleBreadcrumbs={[
                    {label: `${idParam}`, onClick: () => navigate(`/pick/${idParam}`)},
                    {label: `${o(type)}# ${detail?.number}`}
                  ]}
                  footer={detail && detail.totalOpenItems > 0 && binLocation &&
                      <BarCodeScanner ref={barcodeRef}
                                      onAddItem={(item) => handleAddItem(item.code, item.barcode ?? "")}
                                      enabled={enable}/>
                  }
    >
      {detail &&
          <div className="space-y-4 p-2">
            {detail.totalOpenItems > 0 &&
                <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>}
              <Alert variant="default">
                  <AlertTitle>
                    {t("customer")}:
                  </AlertTitle>
                  <AlertDescription>
                    {detail.cardCode} - {detail.cardName}
                  </AlertDescription>
              </Alert>
              <PickingProcessDetailContent items={detail.items}/>
              <BoxConfirmationDialog
                  onSelected={(itemCode: string) => handleAddItem(itemCode, barcodeRef?.current?.getValue() ?? "")}
                  ref={boxConfirmationDialogRef}
                  itemCode={boxItem}
                  items={boxItems}
              />
          </div>
      }
    </ContentTheme>
  );
}
