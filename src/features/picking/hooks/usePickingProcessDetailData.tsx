import {useNavigate, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {AddItemValue, BarCodeScannerRef, BinLocationScannerRef, BoxConfirmationDialogRef, useAuth, useThemeContext} from "@/components";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";

import {BinLocation} from "@/features/items/data/items";
import {PickingDocumentDetail, PickingPackageLabel} from "@/features/picking/data/picking";
import {IsNumeric} from "@/utils/number-utils";
import {StringFormat} from "@/utils/string-utils";
import {pickingService} from "@/features/picking/data/picking-service";

export const usePickingProcessDetailData = () => {
  const {t} = useTranslation();
  const {idParam, typeParam, entryParam} = useParams();
  const [id, setID] = useState<number | null>();
  const [type, setType] = useState<number | null>();
  const [entry, setEntry] = useState<number | null>();
  const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
  const [enable, setEnable] = useState(true);
  const {setLoading, setError} = useThemeContext();
  const [detail, setDetail] = useState<PickingDocumentDetail | null>(null);
  const navigate = useNavigate();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const binLocationRef = useRef<BinLocationScannerRef>(null);
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
  const [pickPackOnly, setPickPackOnly] = useState(false);
  const [packageLabels, setPackageLabels] = useState<PickingPackageLabel[]>([]);
  const [selectedPackageLabelId, setSelectedPackageLabelId] = useState<string | null>(null);
  const [creatingPackageLabel, setCreatingPackageLabel] = useState(false);
  const {user} = useAuth();
  const packageLabelsEnabled = user?.settings.enablePickingPackageLabels === true && user?.settings.enablePostPickRepack !== true;

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

  useEffect(() => {
    if (packageLabelsEnabled && id) {
      loadPackageLabels();
      return;
    }
    setPackageLabels([]);
    setSelectedPackageLabelId(null);
  }, [id, packageLabelsEnabled]);

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

    pickingService.fetchPicking({id, type, entry, availableBins: true, binLocation: params?.binEntry})
      .then(value => {
        if (value == null) {
          setError(t("pickingNotFound"))
          return;
        }
        setPickPackOnly(value.pickPackOnly);
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
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }

  function loadPackageLabels(selectLabelId?: string) {
    if (!id || !packageLabelsEnabled) {
      return;
    }

    pickingService.fetchPackageLabels(id)
      .then(labels => {
        setPackageLabels(labels);
        setSelectedPackageLabelId(current => {
          if (selectLabelId !== undefined) {
            return selectLabelId;
          }
          return current != null && labels.some(label => label.id === current) ? current : null;
        });
      })
      .catch(error => setError(error));
  }

  function handlePackageLabelSelected(labelId: string | null) {
    setSelectedPackageLabelId(labelId);
    setTimeout(() => barcodeRef.current?.focus(), 1);
  }

  function handleCreatePackageLabel() {
    if (!id) {
      toast.error(t('missingRequiredParameters'));
      return;
    }

    setCreatingPackageLabel(true);
    pickingService.createPackageLabel(id)
      .then(label => {
        setPackageLabels(current => [...current.filter(item => item.id !== label.id), label]
          .sort((a, b) => a.sequence - b.sequence));
        setSelectedPackageLabelId(label.id);
        setTimeout(() => barcodeRef.current?.focus(), 1);
      })
      .catch(error => setError(error))
      .finally(() => setCreatingPackageLabel(false));
  }

  function handleAddItem(value: AddItemValue, t: (key: string) => string) {
    boxConfirmationDialogRef?.current?.show(false);
    barcodeRef?.current?.clear();
    if (id == null || type == null || entry == null || user?.binLocations && binLocation == null) {
      toast.error(t('missingRequiredParameters'));
      setLoading(false);
      return;
    }
    const itemCode = value.item.code;
    const unit = value.unit;
    const barcode = value.item.barcode ?? "";
    
    setLoading(true);
    pickingService.addItem({
      id,
      type,
      entry,
      itemCode,
      quantity: 1,
      binEntry: binLocation?.entry,
      unit,
      pickingPackageLabelId: selectedPackageLabelId ?? undefined,
    })
      .then((data) => {
        if (data.closedDocument) {
          setError(StringFormat(t("pickedIsClosed"), id));
          setEnable(false);
          navigateBack();
          return;
        }
        let errorMessage = data.errorMessage;
        if (errorMessage != null) {
          try {
            switch (errorMessage) {
              case 'Quantity exceeds bin available stock':
                errorMessage = StringFormat(t('binQuantityExceedError'), itemCode);
                break;
              case 'Customer is marked as pick pack only':
                const name = detail?.cardName ?? detail?.cardCode ?? 'N/A';
                errorMessage = StringFormat(t('pickPackOnlyError'), name);
                break;
              case 'Item entry not found in pick':
                if (user?.binLocations)
                  errorMessage = StringFormat(t('itemEntryNotFoundPickingBin'), itemCode, id, binLocation!.code);
                else
                  errorMessage = StringFormat(t('itemEntryNotFoundPicking'), itemCode, id);
                break;
            }
            toast.error(errorMessage);
          } finally {
            setLoading(false);
            setTimeout(() => barcodeRef.current?.focus(), 100);
          }
          return;
        }

        toast.success(StringFormat(t("pickingProcessSuccess"), barcode));
        loadData({reload: true, binEntry: binLocation?.entry});
        loadPackageLabels();
        setTimeout(() => barcodeRef.current?.focus(), 100);
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

  return {
    idParam,
    type,
    enable,
    detail,
    barcodeRef,
    binLocationRef,
    binLocation,
    onBinChanged,
    onBinClear,
    handleAddItem,
    pickPackOnly,
    packageLabelsEnabled,
    packageLabels,
    selectedPackageLabelId,
    creatingPackageLabel,
    handlePackageLabelSelected,
    handleCreatePackageLabel,
  }
}
