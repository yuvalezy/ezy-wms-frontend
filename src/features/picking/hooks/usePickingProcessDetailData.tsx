import {useNavigate, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {AddItemValue, BarCodeScannerRef, BinLocationScannerRef, BoxConfirmationDialogRef, PackageValue, useAuth, useThemeContext} from "@/components";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";

import {BinLocation} from "@/features/items/data/items";
import {PickingDocumentDetail} from "@/features/picking/data/picking";
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
  const [currentPackage, setCurrentPackage] = useState<PackageValue | null | undefined>(null);
  const [pickingPackage, setPickingPackage] = useState<PackageValue | null | undefined>(null);
  const {user} = useAuth();

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
    const packageId = value.package?.id;
    
    setLoading(true);
    pickingService.addItem({id, type, entry, itemCode, quantity: 1, binEntry: binLocation?.entry, unit, packageId, pickingPackageId: pickingPackage?.id})
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
          }
          return;
        }

        toast.success(StringFormat(t("pickingProcessSuccess"), barcode));
        loadData({reload: true, binEntry: binLocation?.entry});
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

  function handleAddPackage(value: PackageValue) {
    boxConfirmationDialogRef?.current?.show(false);
    barcodeRef?.current?.clear();
    if (id == null || type == null || entry == null || binLocation == null) {
      return;
    }
    setLoading(true);
    pickingService.addPackage({id, type, entry, packageId: value.id, binEntry: binLocation.entry, pickingPackageId: pickingPackage?.id})
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
              case 'Package is locked':
                break;
              case 'Package is not active':
                break;
              case 'Package already added to this pick list':
                break;
              case 'No items found for the specified pick list entry':
                break;
              case 'Package is empty':
                break;
              case 'Package has committed quantities for items: {string.Join(", ", itemsWithCommittedQty)}':
                break;
              case 'Insufficient open quantities for: {string.Join(", ", insufficientItems)}':
                break;
              case 'Package cannot be fully picked':
                break;
            }
            toast.error(errorMessage);
          } finally {
            setLoading(false);
            setTimeout(() => barcodeRef.current?.focus(), 100);
          }
          return;
        }

        toast.success(StringFormat(t("pickingPackageSuccess"), value.barcode));
        loadData({reload: true, binEntry: binLocation.entry});
      })
      .catch((error) => {
        console.error(`Error performing action: ${error}`);
        let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Package Error: ${error}`;
        setError(errorMessage);
        setLoading(false);
        setTimeout(() => barcodeRef.current?.focus(), 100);
      });
  }

  function navigateBack() {
    navigate(`/pick/${id}`);
  }

  const handleCreatePackage = async () => {
    setLoading(true);
    pickingService.createPackage(id!)
      .then((response) => {
        setPickingPackage({id: response.id, barcode: response.barcode});
      })
      .catch((e) => {
        console.error(`Error performing action: ${e}`);
        let errorMessage = e.response?.data["exceptionMessage"] ?? `Create Package Error: ${e}`;
        setError(errorMessage);
        setTimeout(() => barcodeRef.current?.focus(), 100);
      })
      .finally(() => setLoading(false));
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
    handleAddPackage,
    pickPackOnly,
    currentPackage,
    pickingPackage,
    setPickingPackage,
    handleCreatePackage,
  }
}