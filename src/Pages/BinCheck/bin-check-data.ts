import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useRef, useState} from "react";
import {BinLocationScannerRef} from "@/components/BinLocationScanner";
import {useAuth} from "@/components/AppContext";
import {binCheck, BinContentResponse} from "@/Pages/BinCheck/Bins";
import {BinLocation} from "@/Assets/Common";
import {delay} from "@/Assets/GlobalConfig";
import {exportToExcel} from "@/Utils/excelExport";

export const useBinCheckData = () => {
  const {t} = useTranslation();
  const {setLoading, setAlert, setError} = useThemeContext();
  const binRef = useRef<BinLocationScannerRef>(null);
  const {user} = useAuth();
  const [binContent, setBinContent] = useState<BinContentResponse[] | null>(null);

  function onScan(bin: BinLocation) {
    try {
      binCheck(bin.entry)
        .then((v) => setBinContent(v))
        .catch((error) => setError(error))
        .finally(() => setLoading(false));
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  function onBinClear() {
    setBinContent(null);
    delay(1).then(() => binRef?.current?.focus());
  }
  const excelData = () => {
    return binContent?.map((value) => {
      const rowValue = [
        value.itemCode,
        value.itemName,
        value.onHand,
        value.onHand / value.numInBuy,
        value.onHand / value.numInBuy / value.purPackUn,
      ];
      return rowValue;
    }) ?? [];
  };

  const excelHeaders = [
    t("code"),
    t("description"),
    t("units"),
    t("quantity"),
    t('packageQuantity')
  ];

  const handleExportExcel = () => {
    exportToExcel({
      name: "BinCheck",
      headers: excelHeaders,
      getData: excelData,
      fileName: `bincheck_${binRef?.current?.getBin()}`
    });
  };

  return {
    setLoading,
    setAlert,
    setError,
    binRef,
    user,
    binContent,
    setBinContent,
    onScan,
    onBinClear,
    excelData,
    excelHeaders,
    handleExportExcel
  }
}