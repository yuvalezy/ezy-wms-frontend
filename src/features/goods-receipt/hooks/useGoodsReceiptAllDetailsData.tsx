import {DetailUpdateParameters, Status} from "@/features/shared/data/shared";
import {ProcessType} from "@/features/shared/data";
import {
  GoodsReceiptAllDetail, GoodsReceiptAllLine
} from "@/features/goods-receipt/data/goods-receipt-reports";
import {useThemeContext} from "@/components/ThemeContext";
import {useState} from "react";

export const useGoodsReceiptAllDetailsData = (props: GRPOAllDetailProps) => {
  const {setError} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentData, setCurrentData] = useState<GoodsReceiptAllLine | null>(null);
  const [data, setData] = useState<GoodsReceiptAllDetail[] | null>([]);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: string]: boolean }>({}); // State to store checked rows
  const [quantityChanges, setQuantityChanges] = useState<{ [key: string]: number }>({}); // State to store quantity changes
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
    const numValue = parseInt(newValue, 10);
    setQuantityChanges(prevState => ({
      ...prevState,
      [lineId]: isNaN(numValue) ? 0 : numValue,
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
    isLoadingDetails
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