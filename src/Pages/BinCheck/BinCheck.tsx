import React, {useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import BinLocationScanner, {BinLocationScannerRef} from "../../Components/BinLocationScanner";
import {BinLocation, SourceTarget} from "../../Assets/Common";
import {useAuth} from "../../Components/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {binCheck, BinContentResponse} from "./Bins";
import {delay} from "../../Assets/GlobalConfig";
import {exportToExcel} from "../../Utils/excelExport";
import {formatValueByPack} from "../../Assets/Quantities";

export default function BinCheck() {
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

  if (!user?.binLocations) return (
    <ContentTheme title={t("binCheck")}>
      <Alert className="border-red-200 bg-red-50">
        <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600" />
        <AlertDescription>
          You're not connected to a bin managed warehouse.
        </AlertDescription>
      </Alert>
    </ContentTheme>
  )

  const excelHeaders = [
    t("code"),
    t("description"),
    t("units"),
    t("quantity"),
    t('packageQuantity')
  ];

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

  const handleExportExcel = () => {
    exportToExcel({
      name: "BinCheck",
      headers: excelHeaders,
      getData: excelData,
      fileName: `bincheck_${binRef?.current?.getBin()}`
    });
  };

  return <ContentTheme title={t("binCheck")} exportExcel={true} onExportExcel={handleExportExcel}>
    <div className="space-y-4">
      {binContent && (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('code')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('units')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                    <TableHead>{t('packageQuantity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {binContent?.map((content) => (
                    <TableRow key={content.itemCode}>
                      <TableCell>{content.itemCode}</TableCell>
                      <TableCell>{content.itemName}</TableCell>
                      <TableCell>{content.onHand}</TableCell>
                      <TableCell>{Math.round((content.onHand / content.numInBuy) * 100) / 100}</TableCell>
                      <TableCell>{Math.round((content.onHand / content.numInBuy / content.purPackUn) * 100) / 100}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <BinLocationScanner ref={binRef} onScan={onScan} onChanged={() => {
      }} onClear={onBinClear}/>
    </div>
  </ContentTheme>
}
