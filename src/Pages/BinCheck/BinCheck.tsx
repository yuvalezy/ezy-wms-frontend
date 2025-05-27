import React, {useRef, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import BinLocationScanner, {BinLocationScannerRef} from "../../Components/BinLocationScanner";
import {BinLocation, SourceTarget} from "../../Assets/Common";
import {useAuth} from "../../Components/AppContext";
import {CheckBox, Label, MessageStrip, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import {binCheck, BinContentResponse} from "./Bins";
import {ScrollableContentBox} from "../../Components/ScrollableContent";
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
    <ContentTheme title={t("binCheck")} icon="dimension">
      <MessageStrip design="Negative">You're not connected to a bin managed warehouse.</MessageStrip>
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
    <div className="themeContentStyle">
      <div className="containerStyle">
        {binContent &&
            <>
                <ScrollableContentBox>
                    <Table
                        columns={<>
                          <TableColumn><Label>{t('code')}</Label></TableColumn>
                          <TableColumn><Label>{t('description')}</Label></TableColumn>
                          <TableColumn><Label>{t('units')}</Label></TableColumn>
                          <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                          <TableColumn><Label>{t('packageQuantity')}</Label></TableColumn>
                        </>}
                    >
                      {binContent?.map((content) => (
                        <TableRow key={content.itemCode}>
                          <TableCell><Label>{content.itemCode}</Label></TableCell>
                          <TableCell><Label>{content.itemName}</Label></TableCell>
                          <TableCell><Label>{content.onHand}</Label></TableCell>
                          <TableCell><Label>{content.onHand / content.numInBuy}</Label></TableCell>
                          <TableCell><Label>{content.onHand / content.numInBuy / content.purPackUn}</Label></TableCell>
                        </TableRow>
                      ))}
                    </Table>
                </ScrollableContentBox>
            </>
        }
        <BinLocationScanner ref={binRef} onScan={onScan} onChanged={() => {
        }} onClear={onBinClear}/>
      </div>
    </div>
  </ContentTheme>
}
