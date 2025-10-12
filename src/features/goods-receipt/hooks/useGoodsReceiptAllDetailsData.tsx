import {DetailUpdateParameters} from "@/features/shared/data/shared";
import {ProcessType} from "@/features/shared/data";
import {GoodsReceiptAllDetail, GoodsReceiptAllLine} from "@/features/goods-receipt/data/goods-receipt-reports";
import {useThemeContext} from "@/components/ThemeContext";
import {useState} from "react";
import {useAuth} from "@/components";
import {parseQuantity} from "@/utils/quantity-utils";

export const useGoodsReceiptAllDetailsData = (props: GRPOAllDetailProps) => {
  const {setError} = useThemeContext();
  const {user} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentData, setCurrentData] = useState<GoodsReceiptAllLine | null>(null);
  const [data, setData] = useState<GoodsReceiptAllDetail[] | null>([]);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: string]: boolean }>({}); // State to store checked rows
  const [quantityChanges, setQuantityChanges] = useState<{ [key: string]: number }>({}); // State to store quantity changes
  const enableDecimals = user?.settings?.enableDecimalQuantities ?? false;

  function update() {
    try {
      const removeRows = data?.filter(detail => checkedRows[detail.lineId]).map(detail => detail.lineId) ?? [];
      setIsOpen(false);
      props.onUpdate({id: props.id, removeRows: removeRows, quantityChanges: quantityChanges});
    } catch (e) {
      setError(e);
    }
  }

  function showWithData(lineData: GoodsReceiptAllLine, details: GoodsReceiptAllDetail[], enableUpdateFlag: boolean) {
    setEnableUpdate(enableUpdateFlag);
    setCheckedRows({});
    setQuantityChanges({});
    setData(details);
    setIsOpen(true);
  }

  function handleCheckboxChange(lineId: string, checked: boolean) {
    setCheckedRows(prevState => ({
      ...prevState,
      [lineId]: checked
    }));
    // setEnableUpdate(true); // This might not be needed if button is always enabled or logic changes
  }

  function handleQuantityChange(lineId: string, newValue: string) {
    const numValue = parseQuantity(newValue, enableDecimals);
    setQuantityChanges(prevState => ({
      ...prevState,
      [lineId]: numValue,
    }));
    // setEnableUpdate(true); // This might not be needed
  }

  return {
    isOpen,
    currentData,
    data,
    enableUpdate,
    checkedRows,
    quantityChanges,
    setCurrentData,
    showWithData,
    update,
    handleCheckboxChange,
    handleQuantityChange,
    setIsOpen,
  }
}

export interface GRPOAllDetailRef {
  show: (data: GoodsReceiptAllLine, details: GoodsReceiptAllDetail[], enableUpdate: boolean) => void;
}

export interface GRPOAllDetailProps {
  id: string,
  onUpdate: (data: DetailUpdateParameters) => void,
  processType?: ProcessType
}