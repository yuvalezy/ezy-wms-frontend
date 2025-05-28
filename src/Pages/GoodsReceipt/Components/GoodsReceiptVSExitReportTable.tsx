import * as React from 'react';
import {GoodsReceiptVSExitReportDataLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface GoodsReceiptVSExitReportTableProps {
    data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
    const {t} = useTranslation();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Label>{t('code')}</Label></TableHead>
                        <TableHead><Label>{t('description')}</Label></TableHead>
                        <TableHead className="text-right"><Label>{t('openQuantity')}</Label></TableHead>
                        <TableHead className="text-right"><Label>{t('Quantity')}</Label></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.itemCode}>
                            <TableCell><Label>{row.itemCode}</Label></TableCell>
                            <TableCell><Label>{row.itemName}</Label></TableCell>
                            <TableCell className="text-right"><Label>{row.openQuantity}</Label></TableCell>
                            <TableCell className="text-right"><Label>{row.quantity}</Label></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default GoodsReceiptVSExitReportTable;
