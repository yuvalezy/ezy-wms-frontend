import {DetailUpdateParameters} from "@/features/shared/data/shared";
import {CountingAllDetail, CountingSummaryReportLine} from "@/features/counting/data/counting";
import {useThemeContext} from "@/components/ThemeContext";
import {useState} from "react";
import {useAuth} from "@/components";
import {parseQuantity} from "@/utils/quantity-utils";

export const useCountingAllDetailsData = (props: CountingAllDetailProps) => {
  const {setError} = useThemeContext();
  const {user} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentData, setCurrentData] = useState<CountingSummaryReportLine | null>(null);
  const [data, setData] = useState<CountingAllDetail[] | null>([]);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: string]: boolean }>({});
  const [quantityChanges, setQuantityChanges] = useState<{ [key: string]: number }>({});
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

  function showWithData(lineData: CountingSummaryReportLine, details: CountingAllDetail[], enableUpdateFlag: boolean) {
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
  }

  function handleQuantityChange(lineId: string, newValue: string) {
    const numValue = parseQuantity(newValue, enableDecimals);
    setQuantityChanges(prevState => ({
      ...prevState,
      [lineId]: numValue,
    }));
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

export interface CountingAllDetailRef {
  show: (data: CountingSummaryReportLine, details: CountingAllDetail[], enableUpdate: boolean) => void;
}

export interface CountingAllDetailProps {
  id: string,
  onUpdate: (data: DetailUpdateParameters) => void,
}
