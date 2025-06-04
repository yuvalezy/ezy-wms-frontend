import {DetailUpdateParameters, Status} from "@/assets/Common";
import {
  fetchGoodsReceiptReportAllDetails,
  GoodsReceiptAll,
  GoodsReceiptAllDetail
} from "@/pages/GoodsReceipt/data/Report";
import {useThemeContext} from "@/components/ThemeContext";
import {useState} from "react";
import {fetchDocuments} from "@/pages/GoodsReceipt/data/Document";

export const useGoodsReceiptAllDetailsData = (props: GRPOAllDetailProps) => {
  const {setLoading, setError} = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentData, setCurrentData] = useState<GoodsReceiptAll | null>(null);
  const [data, setData] = useState<GoodsReceiptAllDetail[] | null>([]);
  const [enableUpdate, setEnableUpdate] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({}); // State to store checked rows
  const [quantityChanges, setQuantityChanges] = useState<{ [key: number]: number }>({}); // State to store quantity changes

  function update() {
    try {
      const removeRows = data?.filter(detail => checkedRows[detail.lineId]).map(detail => detail.lineId) ?? [];
      setIsOpen(false);
      props.onUpdate({id: props.id, removeRows: removeRows, quantityChanges: quantityChanges});
    } catch (e) {
      setError(e);
    }
  }

  function loadDetails(data: GoodsReceiptAll) {
    setLoading(true);
    setEnableUpdate(false);
    setCheckedRows({})
    setQuantityChanges({})
    fetchDocuments({id: props.id, confirm: props.confirm})
      .then((doc) => {
        setEnableUpdate(doc[0].status === Status.InProgress);
        fetchGoodsReceiptReportAllDetails(props.id, data.itemCode)
          .then((result) => {
            setIsOpen(true);
            setData(result);
          })
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  function handleCheckboxChange(lineId: number, checked: boolean) {
    setCheckedRows(prevState => ({
      ...prevState,
      [lineId]: checked
    }));
    // setEnableUpdate(true); // This might not be needed if button is always enabled or logic changes
  }

  function handleQuantityChange(lineId: number, newValue: string) {
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
    loadDetails,
    update,
    handleCheckboxChange,
    handleQuantityChange,
    setIsOpen
  }
}

export interface GRPOAllDetailRef {
  show: (data: GoodsReceiptAll) => void;
}

export interface GRPOAllDetailProps {
  id: number,
  onUpdate: (data: DetailUpdateParameters) => void,
  confirm: boolean | undefined
}