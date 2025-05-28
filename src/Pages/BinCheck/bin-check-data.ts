import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useRef, useState} from "react";
import {BinLocationScannerRef} from "@/components/BinLocationScanner";
import {useAuth} from "@/components/AppContext";
import {binCheck, BinContentResponse} from "@/pages/BinCheck/Bins";
import {BinLocation} from "@/assets/Common";
import {delay} from "@/assets/GlobalConfig";
import {exportToExcel} from "@/utils/excelExport";

export const useBinCheckData = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const binRef = useRef<BinLocationScannerRef>(null);
  const {user} = useAuth();
  const [binContent, setBinContent] = useState<BinContentResponse[] | null>(null);
  const [bin, setBin] = useState<BinLocation | null>(null);

  function onScan(bin: BinLocation) {
    setBin(bin);
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
    setBin(null);
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
    setError,
    binRef,
    user,
    binContent,
    setBinContent,
    onScan,
    onBinClear,
    excelData,
    excelHeaders,
    handleExportExcel,
    bin
  }
}
