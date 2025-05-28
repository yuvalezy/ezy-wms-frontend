import React, {useEffect, useState} from "react";
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
import {PickingDocumentDetailItem} from "@/pages/Picking/data/PickingDocument";
import BinLocationQuantities from "../../../components/BinLocationQuantities";

export interface PickingProcessDetailContentProps {
    items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items }) => {
    const {t} = useTranslation();
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        setAvailable(items?.some(i => i.available != null && i.available > 0)??false);
    }, [items]);

    return (
        <div className="contentStyle rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Label>{t('code')}</Label></TableHead>
                        <TableHead><Label>{t('description')}</Label></TableHead>
                        <TableHead className="text-right"><Label>{t('quantity')}</Label></TableHead>
                        <TableHead className="text-right"><Label>{t('picked')}</Label></TableHead>
                        <TableHead className="text-right"><Label>{t('pending')}</Label></TableHead>
                        {available && <TableHead className="text-right"><Label>{t('available')}</Label></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items?.map((row) => (
                        <React.Fragment key={row.itemCode}>
                            <TableRow className={row.openQuantity === 0 ? 'bg-green-100' : ''}>
                                <TableCell><Label>{row.itemCode}</Label></TableCell>
                                <TableCell><Label>{row.itemName}</Label></TableCell>
                                <TableCell className="text-right"><Label>{row.quantity}</Label></TableCell>
                                <TableCell className="text-right"><Label>{row.picked}</Label></TableCell>
                                <TableCell className="text-right"><Label>{row.openQuantity}</Label></TableCell>
                                {available && <TableCell className="text-right"><Label>{row.available}</Label></TableCell>}
                            </TableRow>
                            {!available && row.openQuantity > 0 && row.binQuantities && row.binQuantities.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={available ? 6 : 5} className="p-0"> {/* Adjusted colSpan */}
                                        <div className="p-2 bg-slate-50">
                                            <BinLocationQuantities data={row.binQuantities}/>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default PickingProcessDetailContent;
