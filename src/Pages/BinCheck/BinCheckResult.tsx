import React from "react";
import {BinContentResponse} from "@/Pages/BinCheck/Bins";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export const BinCheckResult: React.FC<{ content: BinContentResponse[] }> = ({content}) => {
  const {t} = useTranslation();
  return <Table>
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
      {content?.map((content) => (
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
}