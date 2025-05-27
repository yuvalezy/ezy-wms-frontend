import React from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import BinLocationScanner from "../../components/BinLocationScanner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {useBinCheckService} from "@/services/bin-check.services";

export default function BinCheck() {
  const {t} = useTranslation();
  const {
    binRef,
    user,
    binContent,
    onScan,
    onBinClear,
    handleExportExcel
  } = useBinCheckService();

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

  return <ContentTheme title={t("binCheck")} exportExcel={binContent != null} onExportExcel={handleExportExcel}>
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
