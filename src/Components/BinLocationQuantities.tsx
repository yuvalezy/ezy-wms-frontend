import {BinLocation} from "../Assets/Common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import React from "react";
import {useTranslation} from "react-i18next";

export interface BinLocationQuantitiesProps {
    data: BinLocation[]
}

export const BinLocationQuantities: React.FC<BinLocationQuantitiesProps> = ({data}) => {
    const {t} = useTranslation();
    return (
        <Table className="w-auto border border-gray-200">
            <TableHeader>
                <TableRow>
                    <TableHead>{t('bin')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((bin, index) =>
                    <TableRow key={index}>
                        <TableCell>{bin.code}</TableCell>
                        <TableCell>{bin.quantity}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default BinLocationQuantities;
